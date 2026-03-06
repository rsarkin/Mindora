import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Video, FileText, X, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Appointment {
    _id: string;
    therapist: {
        _id: string;
        user?: {
            name: string;
            avatar?: string;
        };
        specializations: string[];
    };
    scheduledAt: string;
    durationMinutes: number;
    status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_PATIENT' | 'CANCELLED_BY_THERAPIST' | 'NO_SHOW';
    type: string;
    videoRoomId?: string;
    googleMeetLink?: string;
}

export const PatientAppointmentsPage = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments/my-appointments');
                setAppointments(response.data);
            } catch (error) {
                console.error('Failed to fetch appointments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleCancel = async () => {
        if (!selectedApt || !cancelReason.trim()) return;
        setIsCancelling(true);
        try {
            await api.post(`/appointments/${selectedApt._id}/cancel`, { reason: cancelReason });
            showToast('Appointment cancelled successfully', 'success');
            setSelectedApt(null);
            setCancelReason('');
            // Re-fetch appointments to update the list
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            showToast('Failed to cancel appointment', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const now = new Date();

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt);
        if (filter === 'upcoming') {
            return aptDate >= now && !['COMPLETED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_THERAPIST', 'NO_SHOW'].includes(apt.status);
        } else {
            return aptDate < now || ['COMPLETED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_THERAPIST', 'NO_SHOW'].includes(apt.status);
        }
    }).sort((a, b) => {
        const dateA = new Date(a.scheduledAt).getTime();
        const dateB = new Date(b.scheduledAt).getTime();
        return filter === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 right-0 -mr-32 w-80 h-80 bg-primary-100/30 rounded-full blur-[100px]" />
                <div className="absolute top-3/4 left-0 -ml-32 w-80 h-80 bg-sky-100/30 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="w-full max-w-7xl mx-auto space-y-12 relative z-10"
            >
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-sky-400 rounded-full" />
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Care Schedule</span>
                        </div>
                        <h1 className="text-5xl font-heading font-black text-slate-900 tracking-tight">Appointments</h1>
                        <p className="text-slate-500 mt-4 text-xl font-medium">Manage your healing journey and therapy sessions.</p>
                    </div>
                    <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] border border-white shadow-xl shadow-slate-100/50">
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-8 py-3 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all ${filter === 'upcoming' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`px-8 py-3 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all ${filter === 'past' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Past History
                        </button>
                    </div>
                </motion.div>

                {filteredAppointments.length === 0 ? (
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-24 text-center border border-white shadow-2xl max-w-2xl mx-auto mt-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-sky-400" />
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner text-slate-200">
                            <Calendar className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 font-heading tracking-tight">No {filter} appointments</h3>
                        <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                            {filter === 'upcoming' ? "Your schedule is clear for now. Take this time to breathe and reset." : "No session history found. Your journey is just beginning."}
                        </p>
                        {filter === 'upcoming' && (
                            <button
                                onClick={() => navigate('/find-therapists')}
                                className="px-10 py-4 bg-slate-900 text-white rounded-[24px] hover:shadow-2xl hover:shadow-slate-300 transition-all font-black text-[11px] uppercase tracking-widest active:scale-95"
                            >
                                Discover Therapists
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 px-2">
                        <AnimatePresence mode="popLayout">
                            {filteredAppointments.map(apt => {
                                const date = new Date(apt.scheduledAt);
                                const therapistName = apt.therapist?.user?.name || 'Therapist';
                                const therapistAvatar = apt.therapist?.user?.avatar || `https://ui-avatars.com/api/?name=${therapistName}&background=eff6ff&color=3b82f6`;

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={apt._id}
                                        className="bg-white/70 backdrop-blur-2xl rounded-[40px] border border-white shadow-[0_32px_80px_rgba(0,0,0,0.06)] hover:shadow-[0_48px_100px_rgba(0,0,0,0.1)] transition-all overflow-hidden p-8 group flex flex-col relative"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 group-hover:bg-primary-50 transition-colors -mr-16 -mt-16 rounded-full blur-3xl opacity-50" />
                                        
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                                apt.status === 'CONFIRMED' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none' :
                                                apt.status === 'SCHEDULED' ? 'bg-gradient-to-r from-primary-500 to-sky-500 text-white border-none' :
                                                apt.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {apt.status.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-slate-900 tracking-tight">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    <span className="text-primary-500 font-bold">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 mb-8 relative z-10 group/avatar cursor-pointer" onClick={() => navigate(`/therapist-profile/${apt.therapist._id}`)}>
                                            <div className="relative">
                                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary-400 to-sky-400 rounded-full blur-md opacity-0 group-hover/avatar:opacity-40 transition-opacity" />
                                                <img src={therapistAvatar} alt={therapistName} className="relative w-16 h-16 rounded-full object-cover border-4 border-white shadow-xl" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xl text-slate-900 group-hover:text-primary-600 transition-colors tracking-tight">{therapistName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{apt.type.replace(/_/g, ' ')}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{apt.durationMinutes}m</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-8 border-t border-slate-100 relative z-10">
                                            {filter === 'upcoming' && apt.status === 'CONFIRMED' ? (
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            if (apt.googleMeetLink) {
                                                                window.open(apt.googleMeetLink, '_blank');
                                                            } else {
                                                                window.open('https://meet.google.com/abc-defg-hij', '_blank');
                                                            }
                                                        }}
                                                        className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2.5"
                                                    >
                                                        <Video className="w-4 h-4 text-primary-400" /> Start Session
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-[20px] hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all flex items-center justify-center active:scale-90"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2 px-4 rounded-xl bg-slate-50/50 border border-slate-100">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Status locked</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </motion.div>

            {/* Cancellation Modal */}
            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            className="bg-white/80 backdrop-blur-2xl rounded-[48px] p-12 max-w-lg w-full shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-500" />
                            
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-rose-50 rounded-[24px] flex items-center justify-center text-rose-500 shadow-inner">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black font-heading text-slate-900 tracking-tight">Cancel Session</h3>
                                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest opacity-60">Action Required</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Reason for Cancellation</label>
                                    <textarea
                                        className="w-full p-6 bg-white/50 border-2 border-slate-100 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 font-bold min-h-[160px] resize-none transition-all placeholder:text-slate-300 shadow-inner"
                                        placeholder="Please let us know how we can support you better..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[32px] p-6 border border-amber-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.3em] mb-2 relative z-10">Transparent Policy</p>
                                    <p className="text-xs text-amber-900 font-bold leading-relaxed relative z-10">
                                        Patient cancellations are eligible for a <span className="underline decoration-amber-300 decoration-2">75% refund</span>. The remaining 25% covers administrative and therapist reservation costs.
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button
                                        onClick={() => { setSelectedApt(null); setCancelReason(''); }}
                                        className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95"
                                    >
                                        Keep Session
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={!cancelReason.trim() || isCancelling}
                                        className="flex-1 py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:shadow-2xl hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
                                    >
                                        {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
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
