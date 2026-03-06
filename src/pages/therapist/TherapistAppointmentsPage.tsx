import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, MessageSquare, XCircle, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        avatar?: string;
    };
    scheduledAt: string;
    durationMinutes?: number;
    type: 'VIDEO_CALL' | 'CHAT_ONLY';
    status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_BY_PATIENT' | 'CANCELLED_BY_THERAPIST' | 'NO_SHOW' | 'IN_PROGRESS';
    meetingLink?: string;
    googleMeetLink?: string;
}

export const TherapistAppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'SCHEDULED' | 'CONFIRMED'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await axios.get(`${API_BASE_URL}/appointments/therapist`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.length === 0) {
                setAppointments(getMockData());
            } else {
                setAppointments(response.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Fallback mock data for demo if API fails
            setAppointments(getMockData());
        } finally {
            setLoading(false);
        }
    };

    const getMockData = (): Appointment[] => [
        {
            _id: '1',
            patientId: { _id: 'p1', name: 'Emily R.', avatar: 'https://ui-avatars.com/api/?name=Emily+R&background=3b82f6&color=fff' },
            scheduledAt: new Date().toISOString(),
            durationMinutes: 60,
            type: 'VIDEO_CALL',
            status: 'CONFIRMED',
            meetingLink: 'https://meet.jit.si/mental-health-1'
        },
        {
            _id: '2',
            patientId: { _id: 'p2', name: 'Michael B.', avatar: 'https://ui-avatars.com/api/?name=Michael+B&background=10b981&color=fff' },
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 60,
            type: 'CHAT_ONLY',
            status: 'SCHEDULED'
        },
        {
            _id: '3',
            patientId: { _id: 'p3', name: 'Sarah K.', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=8b5cf6&color=fff' },
            scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            durationMinutes: 60,
            type: 'VIDEO_CALL',
            status: 'CONFIRMED',
            meetingLink: 'https://meet.jit.si/mental-health-3'
        },
        {
            _id: '4',
            patientId: { _id: 'p4', name: 'David W.', avatar: 'https://ui-avatars.com/api/?name=David+W&background=f59e0b&color=fff' },
            scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            durationMinutes: 60,
            type: 'VIDEO_CALL',
            status: 'SCHEDULED'
        }
    ];

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const meetingLink = status === 'CONFIRMED' ? `mindora-session-${id}` : undefined;

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            await axios.patch(`${API_BASE_URL}/appointments/${id}/status`,
                { status, meetingLink },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAppointments(); // Re-fetch from server if successful
        } catch (error) {
            console.error('Error updating status:', error);
            // Optimistic update for demo purposes
            setAppointments(prev => prev.map(apt => apt._id === id ? { ...apt, status: status as any } : apt));
        }
    };

    const filteredAppointments = appointments
        .filter(apt => filter === 'all' ? true : apt.status === filter)
        .filter(apt => apt.patientId.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading schedule...</p>
            </div>
        </div>
    );

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
            {/* Header Section */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your schedule and upcoming therapy sessions.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all shadow-sm"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/60 shadow-sm w-fit overflow-x-auto">
                {(['all', 'SCHEDULED', 'CONFIRMED'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all capitalize whitespace-nowrap ${filter === f
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                    >
                        {f === 'all' ? 'All' : f.replace(/_/g, ' ')} Sessions
                        {f === 'SCHEDULED' && appointments.filter(a => a.status === 'SCHEDULED').length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
                                {appointments.filter(a => a.status === 'SCHEDULED').length}
                            </span>
                        )}
                    </button>
                ))}
            </motion.div>

            {/* Appointments List */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                {filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6 shadow-inner transform -rotate-6">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">No appointments found</h3>
                        <p className="text-slate-500 max-w-sm">
                            {searchQuery ? "No patients matching your search query." : "You have no appointments matching this filter."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <AnimatePresence>
                            {filteredAppointments.map((appt) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={appt._id}
                                    className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img
                                                src={appt.patientId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patientId.name)}&background=slate&color=fff`}
                                                alt={appt.patientId.name}
                                                className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-slate-100 border border-slate-200/50"
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center ${appt.type === 'VIDEO_CALL' ? 'bg-blue-100 text-blue-600' : 'bg-fuchsia-100 text-fuchsia-600'
                                                }`}>
                                                {appt.type === 'VIDEO_CALL' ? <Video className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors leading-tight">
                                                    {appt.patientId.name}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    appt.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600 border border-amber-100 bg-amber-500/10 animate-pulse' :
                                                        'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {appt.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {new Date(appt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                        {appt.status === 'SCHEDULED' && (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => updateStatus(appt._id, 'CONFIRMED')}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 group/btn border border-emerald-100 hover:border-emerald-500 hover:shadow-emerald-500/20"
                                                >
                                                    <Check className="w-4 h-4" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(appt._id, 'CANCELLED_BY_THERAPIST')}
                                                    className="flex-1 sm:flex-none p-2.5 bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                                                    title="Decline"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}

                                        {appt.status === 'CONFIRMED' && (
                                            <div className="flex gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => {
                                                        if (appt.googleMeetLink) {
                                                            window.open(appt.googleMeetLink, '_blank');
                                                        } else {
                                                            // Fallback to old behavior or show toast if needed
                                                            window.open(`https://meet.google.com/abc-defg-hij`, '_blank');
                                                        }
                                                    }}
                                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-slate-900/10"
                                                >
                                                    {appt.type === 'VIDEO_CALL' ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                                    Join Session
                                                </button>
                                            </div>
                                        )}
                                        {appt.status === 'COMPLETED' && (
                                            <button className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm bg-slate-50">
                                                View Notes
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
