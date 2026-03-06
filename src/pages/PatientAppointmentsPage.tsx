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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'COMPLETED': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-red-50 text-red-700 border-red-200'; // Cancelled or No Show
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="w-full max-w-7xl mx-auto space-y-8"
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">My Appointments</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your upcoming and past therapy sessions.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${filter === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${filter === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Past
                    </button>
                </div>
            </motion.div>

            {filteredAppointments.length === 0 ? (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-12">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">No {filter} appointments</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {filter === 'upcoming' ? "You don't have any therapy sessions scheduled." : "You don't have any past therapy sessions yet."}
                    </p>
                    {filter === 'upcoming' && (
                        <button
                            onClick={() => navigate('/find-therapists')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/20"
                        >
                            Find a Therapist
                        </button>
                    )}
                </motion.div>
            ) : (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredAppointments.map(apt => {
                            const date = new Date(apt.scheduledAt);
                            const therapistName = apt.therapist?.user?.name || 'Therapist';
                            const therapistAvatar = apt.therapist?.user?.avatar || `https://ui-avatars.com/api/?name=${therapistName}&background=eff6ff&color=3b82f6`;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={apt._id}
                                    className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all overflow-hidden p-6"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${getStatusColor(apt.status)}`}>
                                            {apt.status.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{date.toLocaleDateString()}</p>
                                            <p className="text-xs font-medium text-slate-500">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => navigate(`/therapist-profile/${apt.therapist._id}`)}>
                                        <img src={therapistAvatar} alt={therapistName} className="w-14 h-14 rounded-full object-cover border-2 border-slate-50 shadow-sm" />
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 hover:text-primary-600 transition-colors">{therapistName}</h4>
                                            <p className="text-sm text-slate-500">{apt.type.replace(/_/g, ' ')} • {apt.durationMinutes} min</p>
                                        </div>
                                    </div>

                                    {filter === 'upcoming' && apt.status === 'CONFIRMED' && (
                                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    if (apt.googleMeetLink) {
                                                        window.open(apt.googleMeetLink, '_blank');
                                                    } else {
                                                        window.open('https://meet.google.com/abc-defg-hij', '_blank');
                                                    }
                                                }}
                                                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                            >
                                                <Video className="w-4 h-4" /> Join Session
                                            </button>
                                            <button
                                                onClick={() => setSelectedApt(apt)}
                                                className="px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {filter === 'past' && apt.status === 'COMPLETED' && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <button className="w-full py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold transition-all flex justify-center items-center gap-2">
                                                <FileText className="w-4 h-4" /> View Notes
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
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
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Cancel Appointment</h3>
                                    <p className="text-slate-500 text-sm">Please let us know why you're cancelling.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-700 font-medium min-h-[120px] resize-none"
                                    placeholder="Reason for cancellation..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                />

                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6">
                                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Refund Policy</p>
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        Patient cancellations are eligible for a <span className="font-bold underline">75% refund</span>. The remaining 25% covers administrative and therapist reservation costs.
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => { setSelectedApt(null); setCancelReason(''); }}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Keep Session
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={!cancelReason.trim() || isCancelling}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
                                    >
                                        {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
