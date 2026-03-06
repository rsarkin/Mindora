import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Activity, Plus, History } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const moodScale: Record<string, number> = {
    'Great': 5,
    'Good': 4,
    'Okay': 3,
    'Low': 2,
    'Bad': 1
};

const reverseMoodScale: Record<number, string> = {
    5: 'Great',
    4: 'Good',
    3: 'Okay',
    2: 'Low',
    1: 'Bad'
};

export const ProgressPage = () => {
    const [moodHistory, setMoodHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [newMood, setNewMood] = useState('Good');
    const [newNote, setNewNote] = useState('');

    const fetchMoods = async () => {
        try {
            const data = await api.getMoodHistory();
            const processed = data.map((entry: any) => ({
                ...entry,
                score: moodScale[entry.mood] || 3,
                date: new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: new Date(entry.timestamp)
            })).sort((a: any, b: any) => a.fullDate.getTime() - b.fullDate.getTime());

            setMoodHistory(processed);
        } catch (error) {
            console.error('Failed to fetch mood history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, []);

    const handleLogMood = async () => {
        try {
            await api.logMood({ mood: newMood, note: newNote });
            setShowLogModal(false);
            setNewNote('');
            fetchMoods();
        } catch (error) {
            console.error('Failed to log mood', error);
        }
    };

    const averageMood = moodHistory.length > 0
        ? (moodHistory.reduce((acc, curr) => acc + curr.score, 0) / moodHistory.length).toFixed(1)
        : 'N/A';

    const streak = 3;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                }
            }}
            className="max-w-7xl mx-auto space-y-8"
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Your Progress</h1>
                    <p className="text-slate-500 mt-2 text-lg">Track your emotional journey and milestones over time.</p>
                </div>
                <button
                    onClick={() => setShowLogModal(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 font-bold hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5 -ml-1 border-2 border-white rounded-full p-0.5" />
                    Log Today's Mood
                </button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-[80px] opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl ring-1 ring-indigo-100 relative z-10 shadow-inner">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Average Mood</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{averageMood} <span className="text-lg text-slate-400 font-bold">/ 5.0</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 blur-[80px] opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl ring-1 ring-emerald-100 relative z-10 shadow-inner">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Entries</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{moodHistory.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 blur-[80px] opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl ring-1 ring-amber-100 relative z-10 shadow-inner">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Current Streak</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{streak} <span className="text-lg text-slate-400 font-bold">Days</span></p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-heading font-bold text-slate-900">Mood Timeline</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                Score
                            </span>
                        </div>
                    </div>
                    <div className="h-[360px] w-full mt-4 flex-1">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium animate-pulse">Loading chart data...</div>
                        ) : moodHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={moodHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
                                        dy={12}
                                    />
                                    <YAxis
                                        domain={[1, 5]}
                                        ticks={[1, 2, 3, 4, 5]}
                                        tickFormatter={(value) => reverseMoodScale[value]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
                                        width={60}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorMood)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                <Activity className="w-12 h-12 mb-4 opacity-30" />
                                <p className="font-medium text-slate-500">No mood data yet.</p>
                                <p className="text-sm mt-1">Start logging to see your progress chart!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Logs List */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="w-5 h-5 text-slate-400" />
                        <h3 className="text-xl font-heading font-bold text-slate-900">Recent Journal</h3>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                        {moodHistory.slice().reverse().slice(0, 5).map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100/80 hover:bg-slate-50 hover:border-slate-200 transition-colors group">
                                <div className={`w-1.5 h-auto self-stretch rounded-full ${entry.score >= 4 ? 'bg-emerald-500' :
                                    entry.score === 3 ? 'bg-amber-400' : 'bg-red-500'
                                    }`} />
                                <div className="flex-1 w-full min-w-0">
                                    <div className="flex justify-between items-start mb-1.5 w-full">
                                        <h4 className="font-bold text-slate-900 tracking-tight">{entry.mood}</h4>
                                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    {entry.note ? (
                                        <p className="text-slate-600 text-sm leading-relaxed overflow-hidden text-ellipsis">{entry.note}</p>
                                    ) : (
                                        <p className="text-slate-400 text-xs italic">No note attached.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {moodHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 h-full">
                                <History className="w-8 h-8 opacity-20 mb-3" />
                                <p className="italic text-sm font-medium">No entries yet.</p>
                            </div>
                        )}
                    </div>

                    {moodHistory.length > 5 && (
                        <button className="w-full mt-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">
                            View All History
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Log Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-slate-100"
                        >
                            <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight text-center mb-8">How are you feeling today?</h2>

                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {Object.keys(moodScale).reverse().map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setNewMood(m)}
                                        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all ${newMood === m
                                            ? 'bg-primary-50 ring-2 ring-primary-500 transform -translate-y-1 shadow-md shadow-primary-500/10'
                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 hover:-translate-y-0.5 border border-slate-100'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex justify-center items-center mb-3 ${m === 'Great' ? 'bg-green-100 text-green-600 shadow-sm' :
                                            m === 'Good' ? 'bg-emerald-100 text-emerald-600 shadow-sm' :
                                                m === 'Okay' ? 'bg-amber-100 text-amber-600 shadow-sm' :
                                                    m === 'Low' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'bg-rose-100 text-rose-600 shadow-sm'
                                            }`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{m}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Add a journal entry (optional)</label>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none h-32 transition-all font-medium text-slate-800"
                                    placeholder="What's been on your mind? Did something specific happen?"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="flex-1 px-4 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border-2 border-transparent hover:border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogMood}
                                    className="flex-1 px-4 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 hover:-translate-y-0.5"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
