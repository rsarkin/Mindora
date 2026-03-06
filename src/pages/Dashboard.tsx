import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, TrendingUp, Quote, CheckCircle2, Heart, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const Dashboard: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoggingMood, setIsLoggingMood] = useState(false);

    // Dynamic Stats State
    const [streak, setStreak] = useState<number>(((user as any)?.streak as number) || 0);
    const [hasSignedInToday, setHasSignedInToday] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

    useEffect(() => {
        // Fetch appointments to compute stats
        const fetchData = async () => {
            try {
                const appointments = await api.getAppointments();

                // Completed sessions
                const completed = appointments.filter((a: any) => a.status === 'COMPLETED');
                setCompletedSessionsCount(completed.length);

                // Upcoming
                const now = new Date();
                const upcoming = (appointments as any[])
                    .filter((a: any) =>
                        (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') &&
                        new Date(a.scheduledAt) > now
                    )
                    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .slice(0, 2);
                setUpcomingAppointments(upcoming);

            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchData();

        // Initial streak check based on user object context
        if ((user as any)?.lastLoginAt) {
            const lastLog = new Date((user as any).lastLoginAt);
            const today = new Date();
            if (
                lastLog.getDate() === today.getDate() &&
                lastLog.getMonth() === today.getMonth() &&
                lastLog.getFullYear() === today.getFullYear()
            ) {
                setHasSignedInToday(true);
            }
        }
    }, [user]);

    const handleSignInToday = async () => {
        if (hasSignedInToday || isSigningIn) return;
        setIsSigningIn(true);
        try {
            const data = await api.updateSignInStreak();
            setStreak(data.streak);
            setHasSignedInToday(true);
            updateUser({ streak: data.streak, lastLoginAt: data.lastLoginAt });
            showToast(`Streak updated! You're on a ${data.streak}-day streak! 🔥`, 'success');
        } catch (error) {
            console.error("Failed to sign in streak", error);
            showToast('Failed to record sign in', 'error');
        } finally {
            setIsSigningIn(false);
        }
    };

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
        <div
            className="max-w-6xl mx-auto space-y-12 pb-24"
        >
            {/* Greeting Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <motion.div variants={STAGGER_CHILD_VARIANTS}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        Your Daily Insight
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                        Find your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">
                            Inner Peace, {user?.name?.split(' ')[0] || 'User'}
                        </span>
                    </h1>
                </motion.div>
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex gap-4">
                    <button
                        onClick={() => navigate('/appointments')}
                        className="px-8 py-4 bg-white border border-slate-100 rounded-2xl font-black text-sm text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-all shadow-xl shadow-slate-200/50 hover:shadow-sky-100 group active:scale-95"
                    >
                        Schedule Session
                    </button>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-2xl shadow-slate-900/20 hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                        Quick Start <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            {/* Hero Quote Card */}
            <motion.div
                variants={STAGGER_CHILD_VARIANTS}
                className="relative overflow-hidden group rounded-[40px] shadow-2xl shadow-blue-200/50"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600" />
                {/* Decorative blobs (from LandingPage CTA) */}
                <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-300/20 rounded-full blur-2xl" />

                <div className="relative z-10 p-10 sm:p-16 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/15 rounded-3xl backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-inner">
                        <Quote className="w-8 h-8 text-white" />
                    </div>

                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight italic max-w-3xl mx-auto tracking-tight mb-8">
                        "{todayQuote}"
                    </p>

                    <span className="inline-block px-5 py-2 rounded-full bg-white/10 text-sky-100 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm border border-white/10">
                        Reflect for a moment
                    </span>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                {/* Left Column (Mood & Stats) */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Mood Log Card */}
                    <motion.div
                        variants={STAGGER_CHILD_VARIANTS}
                        className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl shadow-slate-200/30 p-10 md:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner">
                                <Heart className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">How are you feeling?</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Quick Mood Check-in</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                            {MOODS.map(m => (
                                <button
                                    key={m.type}
                                    onClick={() => handleQuickMoodLog(m.type)}
                                    disabled={isLoggingMood}
                                    className={`flex-1 min-w-[100px] group flex flex-col items-center gap-4 p-6 rounded-[32px] border border-slate-50 bg-slate-50/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:bg-white hover:border-white active:scale-95 ${m.color} ${isLoggingMood ? 'opacity-50' : ''}`}
                                >
                                    <span className="text-5xl group-hover:scale-125 transition-transform duration-500">{m.emoji}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Session Stat */}
                        <motion.div
                            variants={STAGGER_CHILD_VARIANTS}
                            whileHover={{ y: -8 }}
                            className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-2xl shadow-sky-100/50 relative overflow-hidden group transition-all"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-sky-500/20 transition-colors" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-4 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-inner">
                                    <Brain size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 bg-sky-100/50 px-4 py-1.5 rounded-full border border-sky-100 backdrop-blur-sm">
                                    Journey
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{completedSessionsCount}</h3>
                                <p className="text-slate-400 font-black text-xs mt-2 uppercase tracking-[0.2em]">Sessions Completed</p>
                            </div>
                        </motion.div>

                        {/* Streak Stat */}
                        <motion.div
                            variants={STAGGER_CHILD_VARIANTS}
                            whileHover={{ y: -8 }}
                            className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-2xl shadow-orange-100/50 relative overflow-hidden group transition-all"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-colors" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 shadow-inner">
                                    <TrendingUp size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-100/50 px-4 py-1.5 rounded-full border border-orange-100 backdrop-blur-sm">
                                    Consistency
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{streak || 0}</h3>
                                <p className="text-slate-400 font-black text-xs mt-2 uppercase tracking-[0.2em]">Day Streak</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Claim Streak Button */}
                    <AnimatePresence>
                        {!hasSignedInToday && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={handleSignInToday}
                                disabled={isSigningIn}
                                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <CheckCircle2 className="w-6 h-6" />
                                {isSigningIn ? 'RECORDING MOMENT...' : 'CLAIM DAILY STREAK 🔥'}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column (Upcoming) */}
                <div className="space-y-10">
                    <motion.div
                        variants={STAGGER_CHILD_VARIANTS}
                        className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl shadow-slate-200/30 p-10 h-full flex flex-col relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl -mr-24 -mt-24" />
                        
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Your Schedule</p>
                            </div>
                            <button
                                onClick={() => navigate('/appointments')}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-slate-100 shadow-sm"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-5 flex-1 relative z-10">
                            {upcomingAppointments.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner border border-slate-100/50">
                                        <Calendar className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-900 font-black text-lg">No sessions yet</p>
                                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-[150px] mx-auto leading-relaxed">Let's schedule your first step towards wellness.</p>
                                </div>
                            ) : (
                                upcomingAppointments.map((appt) => {
                                    const therapistName = appt.therapist?.user?.name || appt.therapistId?.userId?.name || 'Therapist';
                                    const d = new Date(appt.scheduledAt);
                                    return (
                                        <div
                                            key={appt._id}
                                            onClick={() => navigate('/appointments')}
                                            className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-sky-100/50 transition-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white group-hover:scale-110 transition-transform">
                                                    <img src={`https://ui-avatars.com/api/?name=${therapistName}&background=0ea5e9&color=fff&bold=true`} alt={therapistName} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate">{therapistName}</h4>
                                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-md inline-block mt-1">{appt.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-black text-slate-500 bg-white/80 px-4 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:border-sky-100 group-hover:text-sky-600 transition-all">
                                                <Calendar className="w-4 h-4 text-sky-500" />
                                                <span className="tracking-tight">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/appointments')}
                            className="w-full mt-10 py-5 rounded-[24px] border-2 border-dashed border-slate-200 text-slate-400 font-black text-sm hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/50 transition-all group flex items-center justify-center gap-2 relative z-10 active:scale-95"
                        >
                            <Calendar className="w-4 h-4 group-hover:animate-bounce" />
                            Book New Session
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
