import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ShieldCheck, ArrowRight, Save, History } from 'lucide-react';
import { descriptionService } from '../../services/descriptionService';
import { useTaskStore } from '../../store/useTaskStore';
import { useToast } from '../../context/ToastContext';
import { PageTransition } from '../../components/PageTransition';

export const ProblemDescriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setIsGeneratingPlan, setDescription, description } = useTaskStore();
    
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const MAX_CHARS = 2000;

    useEffect(() => {
        const loadActive = async () => {
            try {
                const active = await descriptionService.getActive();
                if (active) {
                    setDescription(active);
                    setContent(active.content);
                }
            } catch (err) {
                console.error("Failed to load active description", err);
            }
        };
        loadActive();
    }, [setDescription]);

    const handleSubmit = async (triggerAI: boolean) => {
        if (!content.trim()) {
            showToast("Please describe how you're feeling first.", "error");
            return;
        }

        setIsLoading(true);
        try {
            await descriptionService.createOrUpdate({ 
                content, 
                triggerAIPlan: triggerAI 
            });
            
            showToast(triggerAI ? "Plan generation started! Redirecting..." : "Description saved.", "success");
            
            if (triggerAI) {
                setIsGeneratingPlan(true);
                navigate('/patient/tasks');
            } else {
                // Refresh local state without navigating
                const active = await descriptionService.getActive();
                setDescription(active);
            }
        } catch (err) {
            showToast("Failed to save description. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Brain size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                                How are you feeling today?
                            </h1>
                            <p className="text-slate-600">
                                Share what's on your mind. This helps us personalize your journey.
                            </p>
                        </div>
                    </div>

                    {description && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full mb-4">
                            <History size={14} />
                            Version {description.version} — Last updated {new Date(description.createdAt).toLocaleDateString()}
                        </div>
                    )}

                    <div className="relative mb-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="I've been feeling a bit overwhelmed lately with work and I find it hard to disconnect in the evenings..."
                            className="w-full h-64 p-5 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-800 text-lg leading-relaxed placeholder:text-slate-400"
                        />
                        <div className={`absolute bottom-4 right-4 text-sm font-medium ${content.length >= MAX_CHARS ? 'text-rose-500' : 'text-slate-400'}`}>
                            {content.length} / {MAX_CHARS}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-4 mb-8">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Your description is <strong>end-to-end encrypted</strong>. It is only accessible to therapist(s) you have a confirmed appointment with and our secure wellness AI.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link 
                            to="/patient/tasks" 
                            className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        >
                            Skip for now
                        </Link>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Save size={18} />
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Sparkles size={18} />
                                Generate My Wellness Plan
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};
