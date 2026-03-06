import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, TrendingUp, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoggingMood, setIsLoggingMood] = React.useState(false);

    const handleQuickMoodLog = async (moodType: string) => {
        setIsLoggingMood(true);
        try {
            await api.post('/mood/quick', { mood: moodType });
            showToast('Mood logged successfully!', 'success');
        } catch (error) {
            console.error('Failed to log mood', error);
            showToast('Failed to log mood', 'error');
        } finally {
            setIsLoggingMood(false);
        }
    };

    const MOODS = [
        { type: 'VERY_SAD', emoji: '😢', label: 'Very Sad', color: 'hover:bg-blue-50 hover:border-blue-200' },
        { type: 'SAD', emoji: '🙁', label: 'Sad', color: 'hover:bg-slate-50 hover:border-slate-200' },
        { type: 'NEUTRAL', emoji: '😐', label: 'Neutral', color: 'hover:bg-gray-50 hover:border-gray-200' },
        { type: 'HAPPY', emoji: '🙂', label: 'Happy', color: 'hover:bg-emerald-50 hover:border-emerald-200' },
        { type: 'VERY_HAPPY', emoji: '😄', label: 'Very Happy', color: 'hover:bg-yellow-50 hover:border-yellow-200' }
    ];

    const QUOTES = [
        "Every day may not be good... but there's something good in every day.",
        "Your present circumstances don't determine where you can go; they merely determine where you start.",
        "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
        "You are braver than you believe, stronger than you seem, and smarter than you think.",
        "Healing takes time, and asking for help is a courageous step.",
        "The only journey is the one within.",
        "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure."
    ];

    const todayQuote = React.useMemo(() => {
        const index = new Date().getDay() % QUOTES.length;
        return QUOTES[index];
    }, []);

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
            className="max-w-4xl mx-auto space-y-6 lg:space-y-8 animate-fade-in"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Good morning, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
                    <p className="text-slate-500 mt-2 text-lg">Here's your wellness overview for today.</p>
                </div>
            </div>

            {/* Hero Quote Component */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-[32px] border border-primary-400 shadow-xl p-8 sm:p-12 relative overflow-hidden group min-h-[300px] flex flex-col justify-center items-center text-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mx-auto mb-8 inline-flex transform group-hover:scale-110 transition-transform">
                        <Quote className="w-8 h-8 text-white" />
                    </div>

                    <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white leading-tight italic max-w-2xl mx-auto tracking-wide">
                        "{todayQuote}"
                    </p>

                    <div className="mt-8">
                        <span className="bg-white/10 text-primary-50 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/20">Quote of the Day</span>
                    </div>
                </div>
            </motion.div>

            {/* Main Interactive Widgets */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Stats Container Map */}
                <div className="space-y-6">
                    {/* Quick Mood Log Widget */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[180px] flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 block text-center sm:text-left">How are you feeling right now?</span>
                        <div className="flex items-center justify-between w-full max-w-sm mx-auto sm:mx-0">
                            {MOODS.map(m => (
                                <button
                                    key={m.type}
                                    onClick={() => handleQuickMoodLog(m.type)}
                                    disabled={isLoggingMood}
                                    className={`text-3xl p-3.5 rounded-2xl border border-transparent transition-all transform hover:scale-110 active:scale-95 ${m.color} ${isLoggingMood ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={m.label}
                                >
                                    {m.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { title: 'Sessions', value: '12', change: '+2', color: 'secondary', icon: Calendar },
                            { title: 'Streak', value: '5 Days', change: '+1', color: 'emerald', icon: TrendingUp }
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow`}>
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500 blur-[60px] opacity-10 rounded-full -mr-8 -mt-8`}></div>
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 ring-1 ring-${stat.color}-100`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                        <TrendingUp className="w-2.5 h-2.5" /> {stat.change}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">{stat.title}</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col h-full min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-heading font-bold text-slate-900">Upcoming</h2>
                        <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">View All</button>
                    </div>
                    <div className="space-y-4 flex-1">
                        {[1, 2].map((i) => (
                            <div key={i} onClick={() => navigate('/appointments')} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-all group cursor-pointer hover:-translate-y-0.5 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold relative shadow-inner text-sm">
                                        D
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors text-sm">Dr. Sarah Jenkins</h4>
                                        <p className="text-[10px] font-semibold text-slate-500 border border-slate-200 inline-block px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 bg-white">Clinical</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100/80 shadow-sm">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-500" /> Tomorrow, 10:00 AM</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/appointments')} className="w-full mt-4 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                        + Book New Session
                    </button>
                </div>

            </motion.div>
        </motion.div>
    );
};
