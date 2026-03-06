import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, TrendingUp, Quote, CheckCircle2 } from 'lucide-react';
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
                            { title: 'Sessions', value: `${completedSessionsCount}`, change: 'Total', color: 'secondary', icon: Calendar },
                            { title: 'Streak', value: `${streak || 0} Days`, change: 'Current', color: 'emerald', icon: TrendingUp }
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

                    {/* Sign-in Today Button */}
                    <AnimatePresence>
                        {!hasSignedInToday && (
                            <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                onClick={handleSignInToday}
                                disabled={isSigningIn}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {isSigningIn ? 'Recording...' : 'Claim Daily Sign-In Streak! 🔥'}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col h-full min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-heading font-bold text-slate-900">Upcoming</h2>
                        <button onClick={() => navigate('/appointments')} className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">View All</button>
                    </div>
                    <div className="space-y-4 flex-1">
                        {upcomingAppointments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <Calendar className="w-12 h-12 mb-3 text-slate-200" />
                                <p className="text-sm font-medium">No upcoming sessions scheduled.</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((appt) => {
                                const therapistName = appt.therapist?.user?.name || appt.therapistId?.userId?.name || 'Therapist';
                                const d = new Date(appt.scheduledAt);
                                return (
                                    <div key={appt._id} onClick={() => navigate('/appointments')} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-all group cursor-pointer hover:-translate-y-0.5 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold relative shadow-inner text-sm overflow-hidden">
                                                <img src={`https://ui-avatars.com/api/?name=${therapistName}&background=c7d2fe&color=3730a3`} alt={therapistName} />
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors text-sm truncate max-w-[160px]">{therapistName}</h4>
                                                <p className="text-[10px] font-semibold text-slate-500 border border-slate-200 inline-block px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 bg-white truncate">({appt.type})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100/80 shadow-sm">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-500" /> {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <button onClick={() => navigate('/appointments')} className="w-full mt-4 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                        + Book New Session
                    </button>
                </div>

            </motion.div>
        </motion.div>
    );
};
