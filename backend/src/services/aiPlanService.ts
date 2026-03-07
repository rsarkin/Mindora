import { Server as SocketIOServer } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import WellnessTask, { TaskSource, TaskStatus, ApprovalStatus } from '../models/WellnessTask';
import AITaskPlan from '../models/AITaskPlan';
import User from '../models/User';
import logger from '../utils/logger';

export class AIPlanService {
    private genAI: GoogleGenerativeAI | null = null;
    private io: SocketIOServer;

    constructor(io: SocketIOServer) {
        this.io = io;
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            logger.warn('AIPlanService: GEMINI_API_KEY missing. AI plans will use fallbacks.');
        }
    }

    async generateAIPlan(patientId: string, descriptionId: string, plainTextContent: string) {
        try {
            logger.info(`Generating AI Wellness Plan for patient ${patientId}`);
            
            let tasksData: any[] = [];
            let rawResponse = '';
            const today = new Date().toISOString().split('T')[0];

            if (this.genAI) {
                const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const systemPrompt = `You are a compassionate wellness coach integrated into a professional mental health platform. A patient has described what they feel is wrong with them. Your job is to generate a personalized, actionable wellness task plan for them.

RULES:
1. Respond ONLY with a valid JSON array. No preamble, no explanation, no markdown fences.
2. Generate between 5 and 10 tasks.
3. Each task must have: title (string), description (string), category (one of: mental | physical | behavioral | social), frequency (one of: once | daily | weekly), durationMinutes (number, 10–60), dueDate (ISO 8601 date, 3–30 days from today).
4. Do NOT suggest medication, clinical diagnosis, or treatment.
5. If the description contains self-harm or crisis language, still generate the plan but make the FIRST task: { "title": "Talk to someone you trust", "category": "social", "frequency": "once", "durationMinutes": 30, "description": "Reach out to a friend, family member, or call a support line today." } with a dueDate of tomorrow.
6. Tasks must feel warm, specific, and achievable — not generic.
User prompt: Patient's description:\n"""\n${plainTextContent}\n"""\n\nToday's date: ${today}. Generate the JSON task plan now.`;

                const tryGenerate = async () => {
                    const result = await model.generateContent(systemPrompt);
                    const text = result.response.text();
                    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    return { tasks: JSON.parse(cleanJson), raw: text };
                };

                try {
                    const res = await tryGenerate();
                    tasksData = res.tasks;
                    rawResponse = res.raw;
                } catch (err) {
                    logger.error('Gemini AI Plan generation failed, retrying once...');
                    try {
                        const res = await tryGenerate();
                        tasksData = res.tasks;
                        rawResponse = res.raw;
                    } catch (retryErr) {
                        logger.error('Gemini AI Plan retry failed.');
                        tasksData = []; // Trigger fallback below
                    }
                }
            }

            // Fallback if AI failed or API key missing
            if (tasksData.length === 0) {
                const weekOut = new Date();
                weekOut.setDate(weekOut.getDate() + 7);
                const weekOutStr = weekOut.toISOString().split('T')[0];
                
                tasksData = [
                    { title: "5-minute breathing exercise", category: "mental", frequency: "daily", durationMinutes: 5, description: "Use the 4-7-8 breathing technique once per day.", dueDate: weekOutStr },
                    { title: "10-minute evening walk", category: "physical", frequency: "daily", durationMinutes: 10, description: "Walk outside in the evening without your phone.", dueDate: weekOutStr },
                    { title: "Write one thing you're grateful for", category: "behavioral", frequency: "daily", durationMinutes: 5, description: "Each morning, write one thing you appreciate in your life.", dueDate: weekOutStr }
                ];
                this.io.to(`patient:${patientId}`).emit('tasks:plan_failed', { fallback: true });
            }

            const user = await User.findById(patientId);
            const approvalStatus = user?.preferences?.aiTaskApproval === 'review' ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED;

            const tasksToInsert = tasksData.map(t => ({
                patientId,
                sourceDescriptionId: descriptionId,
                source: TaskSource.AI,
                status: TaskStatus.TODO,
                category: t.category,
                title: t.title,
                description: t.description,
                durationMinutes: t.durationMinutes,
                frequency: t.frequency,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                approvalStatus
            }));

            const createdTasks = await WellnessTask.insertMany(tasksToInsert);
            
            const aiPlan = new AITaskPlan({
                patientId,
                descriptionId,
                taskIds: createdTasks.map(t => t._id),
                geminiRawResponse: rawResponse
            });
            await aiPlan.save();

            if (rawResponse && !rawResponse.includes('fallback')) {
                this.io.to(`patient:${patientId}`).emit('tasks:new_plan_ready', { count: createdTasks.length });
            }

        } catch (error) {
            logger.error('Critical error in generateAIPlan:', error);
            this.io.to(`patient:${patientId}`).emit('tasks:plan_failed', { fallback: false });
        }
    }
}
