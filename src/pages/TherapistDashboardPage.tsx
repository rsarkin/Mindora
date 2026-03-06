/* eslint-disable react-hooks/purity */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Calendar as CalendarIcon,
    DollarSign,
    Users,
    Video,
    Clock,
    CheckCircle,
    MessageSquare,
    MoreHorizontal,
    ChevronRight,
    Activity,
    X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTherapistCrisisAlerts } from '../hooks/useTherapistCrisisAlerts.ts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    scheduledAt: Date;
    durationMinutes: number;
    type: 'VIDEO_CALL' | 'AUDIO_CALL' | 'CHAT_ONLY';
    status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_BY_PATIENT' | 'CANCELLED_BY_THERAPIST' | 'NO_SHOW' | 'IN_PROGRESS';
    avatar?: string;
    googleMeetLink?: string;
}

interface DashboardStats {
    upcomingSessions: number;
    totalEarningsINR: number;
    completedThisMonth: number;
}

interface ActivityItem {
    id: string;
    type: 'SESSION_COMPLETED' | 'MESSAGE_SENT' | 'APPOINTMENT_APPROVED';
    description: string;
    timestamp: Date;
    actor: string;
}

export const TherapistDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        upcomingSessions: 0,
        totalEarningsINR: 0,
        completedThisMonth: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const { showToast } = useToast();
    const { crisisAlerts, acceptCrisisSession, dismissAlert } = useTherapistCrisisAlerts();

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await api.getTherapistDashboardStats();

            // Stats
            const metrics = data.metrics;
            setStats({
                upcomingSessions: metrics.upcomingSessions,
                totalEarningsINR: metrics.totalEarningsINR || 0,
                completedThisMonth: metrics.completedThisMonth
            });

            // Appointments
            const formattedApts = data.appointments.map((apt: any) => ({
                ...apt,
                scheduledAt: new Date(apt.scheduledAt)
            }));
            setAppointments(formattedApts);

            // Recent activities from backend
            const actualActivities = (data.activities || []).map((act: any) => ({
                ...act,
                timestamp: new Date(act.timestamp)
            }));
            setRecentActivity(actualActivities);
        } catch (error) {
            console.error("Failed to fetch live stats", error);
            showToast('Failed to load dashboard data', 'error');
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatRelativeTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return 'Yesterday';
    };

    const handleCancel = async () => {
        if (!selectedApt || !cancelReason.trim()) return;
        setIsCancelling(true);
        try {
            await api.post(`/appointments/${selectedApt.id}/cancel`, { reason: cancelReason });
            showToast('Appointment cancelled successfully', 'success');
            setSelectedApt(null);
            setCancelReason('');
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            showToast('Failed to cancel appointment', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleAcceptCrisis = (alertId: string) => {
        acceptCrisisSession(alertId);
        // Navigate to emergency session room
        navigate(`/therapist/session/crisis-${alertId}`);
    };

    const todaysAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt);
        const today = new Date();
        return aptDate.getDate() === today.getDate() && aptDate.getMonth() === today.getMonth();
    }).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    return (
        <div className="relative">
            {/* Page specific background effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] -ml-20 pointer-events-none" />

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
                className="max-w-7xl mx-auto space-y-12 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
                        </div>
                        <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
                            Welcome back, <span className="text-indigo-600 font-bold">{user?.name}</span>. 
                            {crisisAlerts.length > 0 ? (
                                <span className="text-red-500 font-bold block mt-1 animate-pulse">
                                    ⚠️ Action Required: {crisisAlerts.length} emergency alerts pending.
                                </span>
                            ) : (
                                " All systems are clear. You have " + todaysAppointments.length + " sessions scheduled for today."
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2.5rem] border border-white/50 shadow-sm self-start md:self-center">
                        <button 
                            onClick={() => navigate('/therapist/slots')}
                            className="px-6 py-3 bg-white text-slate-700 rounded-3xl font-bold border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all flex items-center gap-2 group shadow-sm"
                        >
                            <Clock className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                            Update Slots
                        </button>
                        <button 
                            className="px-8 py-3 bg-indigo-600 text-white rounded-3xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group shadow-xl shadow-indigo-600/20 active:translate-y-0 hover:-translate-y-1"
                        >
                            <CalendarIcon className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
                            Schedule View
                        </button>
                    </div>
                </motion.div>

                {/* Crisis Alerts Area */}
                <AnimatePresence>
                    {crisisAlerts.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-4"
                        >
                            {crisisAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl shadow-red-900/10 overflow-hidden relative group"
                                >
                                    {/* Animated border effect for critical alerts */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer pointer-events-none" />
                                    
                                    <div className="bg-white rounded-[2.25rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="relative shrink-0">
                                                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-[2rem] border-2 border-red-100 flex items-center justify-center relative z-10 group-hover:bg-red-100 transition-colors">
                                                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <span className="text-xs font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase tracking-[0.15em]">Critical Alert</span>
                                                    <h3 className="text-xl md:text-2xl font-black text-slate-900">Emergency Protocol</h3>
                                                </div>
                                                <p className="text-slate-600 font-medium text-lg leading-relaxed line-clamp-2 italic">
                                                    "{alert.message}"
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-sm font-bold text-slate-400">
                                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> ID: {alert.userId.slice(-6)}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span className="flex items-center gap-1.5 text-red-500 animate-pulse"><Clock className="w-4 h-4" /> Received {formatRelativeTime(new Date(alert.timestamp))}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                                            <button
                                                onClick={() => dismissAlert(alert.id)}
                                                className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all active:scale-95"
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleAcceptCrisis(alert.id)}
                                                className="flex-1 md:flex-none px-10 py-4 bg-red-600 text-white rounded-[1.5rem] font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/25 active:translate-y-1 hover:-translate-y-1 flex items-center justify-center gap-3"
                                            >
                                                <Video className="w-6 h-6" />
                                                Intervene Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top Statistics Cards */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Today's Schedule", value: stats.upcomingSessions, sub: "Upcoming Sessions", icon: CalendarIcon, accent: "indigo" },
                        { label: "Revenue Overview", value: stats.totalEarningsINR.toLocaleString('en-IN'), sub: "Total Earnings (INR)", icon: DollarSign, accent: "slate" },
                        { label: "Patient Impact", value: stats.completedThisMonth, sub: "Sessions Completed", icon: Activity, accent: "sky" }
                    ].map((stat, idx) => (
                        <div key={idx} className="relative group perspective-1000">
                            <div className={`absolute -inset-1 bg-gradient-to-r ${stat.accent === 'indigo' ? 'from-indigo-500 to-sky-500' : stat.accent === 'sky' ? 'from-sky-400 to-indigo-400' : 'from-slate-400 to-slate-600'} rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition duration-500`} />
                            
                            <div className="relative bg-white rounded-[2.5rem] p-8 border border-white/50 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-${stat.accent}-50 flex items-center justify-center border border-${stat.accent}-100 group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className={`w-7 h-7 ${stat.accent === 'slate' ? 'text-slate-700' : `text-${stat.accent}-600`}`} />
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                                        {stat.icon === DollarSign && "₹"}
                                        {stat.value}
                                    </p>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none pt-1">{stat.sub}</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform cursor-pointer">
                                        Detailed breakdown <ChevronRight className="w-3.5 h-3.5" />
                                    </span>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Schedule Section */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-8 space-y-8">
                        <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        Upcoming Sessions
                                        <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-sm flex items-center justify-center border border-indigo-100">{todaysAppointments.length}</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1">Your filtered view for today {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/therapist/appointments')}
                                    className="px-6 py-3 bg-slate-50 text-slate-700 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2"
                                >
                                    Full Schedule <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {todaysAppointments.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 border-2 border-dashed border-indigo-200">
                                        <CalendarIcon className="w-10 h-10 text-indigo-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Afternoon Refresh</h3>
                                    <p className="text-slate-500 font-medium max-w-sm">No more sessions locked in for today. Perfect time for session notes or a quick break.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {todaysAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="group relative"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-3xl opacity-0 group-hover:opacity-10 transition duration-300" />
                                            <div className="relative bg-white border border-slate-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group-hover:border-indigo-100 group-hover:shadow-lg">
                                                <div className="flex items-center gap-5 flex-1 w-full">
                                                    <div className="relative shrink-0">
                                                        <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-indigo-50 to-sky-50 border border-slate-100 overflow-hidden shadow-sm">
                                                            <img src={apt.avatar || `https://ui-avatars.com/api/?name=${apt.patientName}&background=f1f5f9&color=6366f1`} alt={apt.patientName} className="w-14 h-14 md:w-16 md:h-16 rounded-[0.875rem] object-cover" />
                                                        </div>
                                                        <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                                                            apt.type === 'VIDEO_CALL' ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-600'
                                                        }`}>
                                                            {apt.type === 'VIDEO_CALL' ? <Video className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg md:text-xl font-black text-slate-800 transition-colors group-hover:text-indigo-600">{apt.patientName}</h3>
                                                            {apt.status === 'IN_PROGRESS' && (
                                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 animate-pulse">
                                                                    Live Now
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-400 mt-1">
                                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(apt.scheduledAt)}</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {apt.durationMinutes}m Session</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                                    <button 
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (apt.googleMeetLink) {
                                                                window.open(apt.googleMeetLink, '_blank');
                                                            } else {
                                                                window.open(`https://meet.google.com/abc-defg-hij`, '_blank');
                                                            }
                                                        }}
                                                        className="flex-[3] md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:translate-y-1 hover:-translate-y-1"
                                                    >
                                                        <Video className="w-5 h-5 hidden sm:block" />
                                                        Enter Room
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden relative group cursor-pointer" onClick={() => navigate('/therapist/patients')}>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="bg-slate-800/40 rounded-[2.25rem] p-8 border border-white/5 relative z-10">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform">
                                        <Users className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">Active Directory</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed mb-6">Access central patient records, history, and treatment plans.</p>
                                    <div className="flex items-center text-xs font-black text-indigo-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Open Directory <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-1 shadow-lg overflow-hidden relative group cursor-pointer border border-slate-100" onClick={() => navigate('/therapist/messages')}>
                                <div className="bg-slate-50/50 rounded-[2.25rem] p-8 border border-white relative z-10 transition-colors group-hover:bg-white">
                                    <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center border border-sky-100 mb-6 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-7 h-7 text-sky-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Secure Comms</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-6">Review unread messages and coordinate between sessions.</p>
                                    <div className="flex items-center text-xs font-black text-sky-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Go to Inbox <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar Area */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-4 space-y-8">
                        {/* Feed / Activity */}
                        <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl flex flex-col h-full min-h-[500px]">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Feed</h2>
                                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                                {recentActivity.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <Activity className="w-12 h-12 mb-4 text-slate-300" />
                                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No recent activity</p>
                                    </div>
                                ) : (
                                    recentActivity.map((activity, idx) => (
                                        <div key={activity.id} className="relative pl-10 group">
                                            {/* Timeline track */}
                                            {idx !== recentActivity.length - 1 && (
                                                <div className="absolute left-[13px] top-10 bottom-[-32px] w-[2px] bg-slate-50 rounded-full" />
                                            )}

                                            {/* Status line effect */}
                                            <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-colors" />

                                            {/* Bubble Icon */}
                                            <div className={`absolute left-0 top-0 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white ring-4 ring-slate-50 shadow-sm transition-all group-hover:scale-125 z-10 ${
                                                activity.type === 'SESSION_COMPLETED' ? 'bg-indigo-600 text-white' :
                                                activity.type === 'MESSAGE_SENT' ? 'bg-sky-500 text-white' :
                                                'bg-emerald-500 text-white'
                                            }`}>
                                                {activity.type === 'SESSION_COMPLETED' ? <Video className="w-3.5 h-3.5" /> :
                                                 activity.type === 'MESSAGE_SENT' ? <MessageSquare className="w-3.5 h-3.5" /> :
                                                 <CheckCircle className="w-3.5 h-3.5" />}
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-base font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{activity.description}</h4>
                                                <p className="text-sm text-slate-500 font-bold">
                                                    <span className="text-slate-900">{activity.actor}</span>
                                                    <span className="mx-2 text-slate-300">•</span>
                                                    <span className="text-indigo-500/80">{formatRelativeTime(activity.timestamp)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="w-full mt-10 py-5 bg-slate-900 text-white font-black rounded-3xl transition-all shadow-xl active:scale-95 hover:bg-indigo-700">
                                Full History Log
                            </button>
                        </section>

                        {/* Quick Tips or Insights */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors" />
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl" />
                            
                            <div className="relative z-10">
                                <Activity className="w-10 h-10 text-sky-400 mb-6 group-hover:rotate-12 transition-transform" />
                                <h3 className="text-2xl font-black mb-3 tracking-tight leading-tight">Therapeutic Insight</h3>
                                <p className="text-indigo-100 font-medium leading-relaxed mb-8 opacity-90 text-lg">
                                    Focus on "Calm Transitions" today. Patients often reflect most deeply in the final 5 minutes of a session.
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-2xl border-2 border-white/20 bg-indigo-500/50 backdrop-blur-sm" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-sky-300">New Module: 12m</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Cancellation Modal - Redesigned */}
            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setSelectedApt(null); setCancelReason(''); }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-white/20 relative z-[101]"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] border-2 border-red-50 flex items-center justify-center text-rose-500 shrink-0">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Withdraw Session</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intervention needed</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <p className="text-lg font-medium text-slate-600 leading-relaxed">
                                    You are about to withdraw the scheduled session with <span className="font-black text-slate-900 underline decoration-indigo-200 decoration-4 underline-offset-4">{selectedApt.patientName}</span>. This will notify the patient immediately.
                                </p>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Reason for Withdrawal</label>
                                    <textarea
                                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 text-slate-700 font-bold min-h-[160px] resize-none transition-all"
                                        placeholder="Briefly explain why the session is being withdrawn..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                </div>

                                <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                                    <p className="text-red-700 text-sm font-bold leading-relaxed flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        This action includes an automatic 100% refund protocol.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setSelectedApt(null); setCancelReason(''); }}
                                        className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={!cancelReason.trim() || isCancelling}
                                        className="flex-[2] py-5 bg-red-600 text-white rounded-[1.5rem] font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 active:translate-y-1 hover:-translate-y-1"
                                    >
                                        {isCancelling ? 'Processing...' : 'Confirm Withdrawal'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
