import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Filter } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../store/useTaskStore';
import { useToast } from '../../context/ToastContext';
import { getSocket } from '../../services/socket';
import { PageTransition } from '../../components/PageTransition';
import { TaskCard } from '../../components/wellness/TaskCard';
import { PendingTaskBanner } from '../../components/wellness/PendingTaskBanner';

export const WellnessTasksPage: React.FC = () => {
    const { tasks, pendingTasks, setTasks, moveTask, isGeneratingPlan, setIsGeneratingPlan } = useTaskStore();
    const { showToast } = useToast();
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    const socket = getSocket();

    const loadTasks = async () => {
        try {
            const data = await taskService.getTasks();
            setTasks(data);
        } catch (err) {
            console.error("Failed to load tasks", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();

        if (socket) {
            socket.on('tasks:new_plan_ready', (data: { count: number }) => {
                showToast(`${data.count} new AI-generated tasks are ready for review!`, "success");
                setIsGeneratingPlan(false);
                loadTasks();
            });

            socket.on('tasks:plan_failed', (data: { fallback: boolean }) => {
                showToast(data.fallback ? "AI plan failed, using fallback wellness tasks." : "Failed to generate AI plan.", "error");
                setIsGeneratingPlan(false);
                loadTasks();
            });

            socket.on('tasks:therapist_note_added', (data: { title: string }) => {
                showToast(`New therapist note added to: ${data.title}`, "info");
                loadTasks();
            });
        }

        return () => {
            if (socket) {
                socket.off('tasks:new_plan_ready');
                socket.off('tasks:plan_failed');
                socket.off('tasks:therapist_note_added');
            }
        };
    }, [socket]);

    const filteredTasks = filterCategory === 'all' 
        ? tasks 
        : tasks.filter(t => t.category === filterCategory);

    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'inprogress');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    const handleMoveTask = async (taskId: string, newStatus: any) => {
        try {
            await taskService.updateStatus(taskId, newStatus);
            moveTask(taskId, newStatus);
        } catch (err) {
            showToast("Failed to update task status", "error");
        }
    };

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                            My Wellness Journey
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Manage your daily practices and track your growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            onClick={() => showToast("Manual task creation coming soon!", "info")}
                        >
                            <Plus size={20} />
                            Add Personal Task
                        </button>
                    </div>
                </div>

                {/* AI Plan Status Bar */}
                <AnimatePresence>
                    {isGeneratingPlan && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] shadow-xl text-white flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                                    <Sparkles size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">AI is crafting your wellness plan...</h3>
                                    <p className="text-indigo-100 font-medium">This usually takes about 20-30 seconds. Feel free to explore other pages.</p>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                            className="w-2.5 h-2.5 bg-white rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pending Tasks Queue */}
                <AnimatePresence>
                    {pendingTasks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <PendingTaskBanner tasks={pendingTasks} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="text-slate-400 mr-2 shrink-0" size={20} />
                    {['all', 'mental', 'physical', 'behavioral', 'social'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all shrink-0 ${
                                filterCategory === cat 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column: To Do */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-slate-300 rounded-full" />
                                <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">Ready to Start</h3>
                            </div>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-bold">
                                {todoTasks.length}
                            </span>
                        </div>
                        <div className="space-y-4 min-h-[400px]">
                            {todoTasks.map(task => (
                                <TaskCard key={task._id} task={task} onMove={handleMoveTask} />
                            ))}
                            {todoTasks.length === 0 && !isLoading && (
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-300 font-bold">
                                    No tasks waiting.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                                <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">In Practice</h3>
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                                {inProgressTasks.length}
                            </span>
                        </div>
                        <div className="space-y-4 min-h-[400px]">
                            {inProgressTasks.map(task => (
                                <TaskCard key={task._id} task={task} onMove={handleMoveTask} />
                            ))}
                            {inProgressTasks.length === 0 && !isLoading && (
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-300 font-bold">
                                    Nothing in practice.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column: Done */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                                <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">Completed</h3>
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                                {doneTasks.length}
                            </span>
                        </div>
                        <div className="space-y-4 min-h-[400px]">
                            {doneTasks.map(task => (
                                <TaskCard key={task._id} task={task} onMove={handleMoveTask} />
                            ))}
                            {doneTasks.length === 0 && !isLoading && (
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-300 font-bold">
                                    No tasks completed yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
