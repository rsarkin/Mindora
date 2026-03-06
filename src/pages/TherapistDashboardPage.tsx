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
    pendingMessages: number;
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
        pendingMessages: 0,
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
        // Mock data for demonstration
        const mockAppointments: Appointment[] = [
            {
                id: '1',
                patientId: 'p1',
                patientName: 'Rahul M.',
                scheduledAt: new Date(Date.now() + 3600000 * 2),
                durationMinutes: 50,
                type: 'VIDEO_CALL',
                status: 'CONFIRMED',
                avatar: 'https://ui-avatars.com/api/?name=Rahul+M&background=3b82f6&color=fff'
            },
            {
                id: '2',
                patientId: 'p2',
                patientName: 'Priya S.',
                scheduledAt: new Date(Date.now() + 3600000 * 4),
                durationMinutes: 50,
                type: 'VIDEO_CALL',
                status: 'CONFIRMED',
                avatar: 'https://ui-avatars.com/api/?name=Priya+S&background=10b981&color=fff'
            },
            {
                id: '3',
                patientId: 'p3',
                patientName: 'Anonymous #4521',
                scheduledAt: new Date(Date.now() + 3600000 * 5),
                durationMinutes: 30,
                type: 'CHAT_ONLY',
                status: 'SCHEDULED',
                avatar: 'https://ui-avatars.com/api/?name=Anon&background=64748b&color=fff'
            }
        ];

        const mockActivity: ActivityItem[] = [
            {
                id: '1',
                type: 'SESSION_COMPLETED',
                description: 'Completed 50min session',
                actor: 'Aditya K.',
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                id: '2',
                type: 'MESSAGE_SENT',
                description: 'Replied to secure message',
                actor: 'Neha P.',
                timestamp: new Date(Date.now() - 7200000)
            },
            {
                id: '3',
                type: 'APPOINTMENT_APPROVED',
                description: 'Approved new booking request',
                actor: 'Rajesh T.',
                timestamp: new Date(Date.now() - 10800000)
            }
        ];

        try {
            const response = await api.get('/therapists/dashboard/stats');
            const metrics = response.data.metrics;
            setStats({
                upcomingSessions: metrics.appointments,
                pendingMessages: metrics.pendingRequests, // mapping pending requests here since messages aren't live
                totalEarningsINR: metrics.totalEarnings || 0,
                completedThisMonth: metrics.completedSessions
            });
        } catch (error) {
            console.error("Failed to fetch live stats", error);
        }

        setAppointments(mockAppointments);
        setRecentActivity(mockActivity);
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
        <>
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
                {/* Header */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Overview</h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Welcome back, Dr. {user?.name?.split(' ')[0] || 'Therapist'}. {crisisAlerts.length > 0 && (
                                <span className="text-red-500 font-semibold ml-1">
                                    You have {crisisAlerts.length} emergency alert{crisisAlerts.length > 1 ? 's' : ''} pending!
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/therapist/settings')} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold shadow-sm transition-all">
                            Manage Availability
                        </button>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5">
                            Start Next Session
                        </button>
                    </div>
                </motion.div>

                {/* Crisis Alerts - High Priority */}
                <AnimatePresence>
                    {crisisAlerts.length > 0 && (
                        <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-4">
                            {crisisAlerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-3xl p-6 shadow-lg shadow-red-500/10 relative overflow-hidden group"
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-red-400 opacity-5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-10 transition-opacity"></div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                                        <div className="flex items-start gap-5 flex-1">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-red-400 blur-md opacity-40 rounded-full animate-pulse"></div>
                                                <div className="p-4 bg-red-100 rounded-2xl relative z-10 border border-red-200">
                                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-heading font-black text-red-900 tracking-tight">
                                                        Emergency Protocol Activated
                                                    </h3>
                                                    <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] uppercase font-black tracking-widest rounded-md shadow-sm">
                                                        Level {alert.crisisLevel}
                                                    </span>
                                                </div>
                                                <p className="text-red-800/80 font-medium mb-1 line-clamp-2 md:line-clamp-1">"{alert.message}"</p>
                                                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
                                                    Patient ID: {alert.userId} • Reported {formatRelativeTime(new Date(alert.timestamp))}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex w-full md:w-auto gap-3">
                                            <button
                                                onClick={() => dismissAlert(alert.id)}
                                                className="flex-1 md:flex-none px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-sm border border-red-100"
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleAcceptCrisis(alert.id)}
                                                className="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 hover:-translate-y-0.5 flex justify-center items-center gap-2"
                                            >
                                                <Video className="w-5 h-5" />
                                                Intervene Now
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Upcoming Sessions", value: stats.upcomingSessions, icon: CalendarIcon, color: "blue" as const, prefix: "" },
                        { label: "Pending Messages", value: stats.pendingMessages, icon: MessageSquare, color: "fuchsia" as const, prefix: "" },
                        { label: "Monthly Earnings", value: stats.totalEarningsINR.toLocaleString('en-IN'), icon: DollarSign, color: "emerald" as const, prefix: "₹" },
                        { label: "Completed Sessions", value: stats.completedThisMonth, icon: CheckCircle, color: "indigo" as const, prefix: "" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500 blur-[80px] opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
                            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl ring-1 ring-${stat.color}-100 relative z-10 shadow-inner`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.prefix}{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Appointments */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Today's Schedule</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">You have {todaysAppointments.length} sessions today.</p>
                            </div>
                            <button
                                onClick={() => navigate('/therapist/appointments')}
                                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold bg-primary-50 px-4 py-2 rounded-xl transition-colors text-sm"
                            >
                                View Calendar <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {todaysAppointments.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <CalendarIcon className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Clear Schedule</h3>
                                <p className="text-slate-500 font-medium">You have no appointments scheduled for today.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary-100 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                            <div className="relative">
                                                <img src={apt.avatar} alt={apt.patientName} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                                {apt.type === 'VIDEO_CALL' ? (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-100 border-2 border-white rounded-md flex items-center justify-center text-blue-600"><Video className="w-2.5 h-2.5" /></div>
                                                ) : (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-100 border-2 border-white rounded-md flex items-center justify-center text-slate-600"><MessageSquare className="w-2.5 h-2.5" /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors text-lg leading-tight">{apt.patientName}</h3>
                                                <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{formatTime(apt.scheduledAt)}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full mx-0.5"></span>
                                                    <span>{apt.durationMinutes} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {apt.status === 'SCHEDULED' ? (
                                                <div className="flex w-full gap-2">
                                                    <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors text-sm">
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold transition-colors text-sm"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (apt.googleMeetLink) {
                                                                window.open(apt.googleMeetLink, '_blank');
                                                            } else {
                                                                window.open(`https://meet.google.com/abc-defg-hij`, '_blank');
                                                            }
                                                        }}
                                                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold shadow-md shadow-slate-900/10"
                                                    >
                                                        Join Room
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                                                        title="Cancel Session"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Recent Activity</h2>
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1">
                            {recentActivity.map((activity, idx) => (
                                <div key={activity.id} className="relative pl-6">
                                    {/* Timeline Line */}
                                    {idx !== recentActivity.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-slate-100 rounded-full"></div>
                                    )}

                                    {/* Icon */}
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-slate-50 shadow-sm ${activity.type === 'SESSION_COMPLETED' ? 'bg-indigo-500 text-white' :
                                        activity.type === 'MESSAGE_SENT' ? 'bg-blue-500 text-white' :
                                            'bg-emerald-500 text-white'
                                        }`}>
                                        {activity.type === 'SESSION_COMPLETED' ? <Video className="w-3 h-3" /> :
                                            activity.type === 'MESSAGE_SENT' ? <MessageSquare className="w-3 h-3" /> :
                                                <CheckCircle className="w-3 h-3" />}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{activity.description}</h4>
                                        <p className="text-sm text-slate-500 font-medium mt-0.5"><span className="text-slate-700">{activity.actor}</span> • {formatRelativeTime(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-sm border border-slate-200/60">
                            View All Activity
                        </button>
                    </motion.div>
                </div>

                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => navigate('/therapist/patients')} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white cursor-pointer hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold font-heading mb-1">Patient Directory</h3>
                        <p className="text-slate-400 font-medium text-sm">Manage files and patient notes.</p>
                    </div>
                    <div onClick={() => navigate('/therapist/messages')} className="bg-white border border-slate-200 p-6 rounded-3xl cursor-pointer hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary-100 transition-colors"></div>
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">Secure Messages</h3>
                        <p className="text-slate-500 font-medium text-sm">Respond to patient inquiries.</p>
                    </div>
                    <div onClick={() => navigate('/therapist/earnings')} className="bg-white border border-slate-200 p-6 rounded-3xl cursor-pointer hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5 hover:-translate-y-1 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-4 group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">Performance Analytics</h3>
                        <p className="text-slate-500 font-medium text-sm">View hours and earnings data.</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Cancellation Modal */}
            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Cancel Session</h3>
                                    <p className="text-slate-500 text-sm">This will notify the patient immediately.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium text-slate-600">
                                    Are you sure you want to cancel the session with <span className="font-bold text-slate-900">{selectedApt.patientName}</span>?
                                </p>

                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700 font-medium min-h-[120px] resize-none"
                                    placeholder="Enter reason for cancellation..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                />

                                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-6">
                                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Refund Policy</p>
                                    <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                        As a therapist, cancelling results in a <span className="font-bold underline">100% refund</span> to the patient.
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => { setSelectedApt(null); setCancelReason(''); }}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={!cancelReason.trim() || isCancelling}
                                        className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-lg shadow-rose-600/20"
                                    >
                                        {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
