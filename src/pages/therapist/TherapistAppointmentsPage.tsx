import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Calendar, 
    Clock, 
    Video, 
    MessageSquare, 
    XCircle, 
    Search, 
    Check, 

    ArrowUpRight,
    ExternalLink,
    Filter
} from 'lucide-react';
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
            setAppointments(getMockData());
        } finally {
            setLoading(false);
        }
    };

    const getMockData = (): Appointment[] => [
        {
            _id: '1',
            patientId: { _id: 'p1', name: 'Emily R.', avatar: 'https://ui-avatars.com/api/?name=Emily+R&background=6366f1&color=fff&bold=true' },
            scheduledAt: new Date().toISOString(),
            durationMinutes: 60,
            type: 'VIDEO_CALL',
            status: 'CONFIRMED',
            googleMeetLink: 'https://meet.google.com/abc-def-ghi'
        },
        {
            _id: '2',
            patientId: { _id: 'p2', name: 'Michael B.', avatar: 'https://ui-avatars.com/api/?name=Michael+B&background=0ea5e9&color=fff&bold=true' },
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 45,
            type: 'CHAT_ONLY',
            status: 'SCHEDULED'
        },
        {
            _id: '3',
            patientId: { _id: 'p3', name: 'Sarah K.', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=8b5cf6&color=fff&bold=true' },
            scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            durationMinutes: 60,
            type: 'VIDEO_CALL',
            status: 'CONFIRMED',
            googleMeetLink: 'https://meet.google.com/jkl-mno-pqr'
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
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            setAppointments(prev => prev.map(apt => apt._id === id ? { ...apt, status: status as any } : apt));
        }
    };

    const filteredAppointments = appointments
        .filter(apt => filter === 'all' ? true : apt.status === filter)
        .filter(apt => apt.patientId.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Appointments...</p>
        </div>
    );

    return (
        <div className="relative">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] -ml-20 pointer-events-none" />

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
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Schedule Hub</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Organizing <span className="text-indigo-600 font-bold">{appointments.length} clinical sessions</span> across your calendar.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-5 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm group-hover:bg-white"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Glassmorphic Tabs */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-wrap gap-2 p-2 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm w-fit">
                    {(['all', 'SCHEDULED', 'CONFIRMED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap relative ${filter === f
                                ? "bg-slate-900 text-white shadow-xl translate-y-[-1px]"
                                : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                }`}
                        >
                            <span className="relative z-10">
                                {f === 'all' ? 'Everything' : f.replace(/_/g, ' ')}
                            </span>
                            {f === 'SCHEDULED' && appointments.filter(a => a.status === 'SCHEDULED').length > 0 && (
                                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] rounded-full border-2 border-white font-black ${filter === f ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {appointments.filter(a => a.status === 'SCHEDULED').length}
                                </span>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Main List */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-6">
                    {filteredAppointments.length === 0 ? (
                        <div className="bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center border border-indigo-100 mb-8">
                                <Calendar className="w-10 h-10 text-indigo-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Workspace Clear</h3>
                            <p className="text-slate-500 font-medium max-w-sm">
                                {searchQuery ? `No records matching "${searchQuery}" in this view.` : "Your clinical schedule is open. New bookings will appear here."}
                            </p>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence mode='popLayout'>
                                {filteredAppointments.map((appt) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={appt._id}
                                        className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-1 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="bg-slate-50/50 group-hover:bg-white rounded-[2.25rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-colors border border-white">
                                            {/* Left side: Patient & Type */}
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                                    <img
                                                        src={appt.patientId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patientId.name)}&background=1e1b4b&color=ffffff&bold=true`}
                                                        alt={appt.patientId.name}
                                                        className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] object-cover shadow-xl relative z-10 border-2 border-white transition-transform group-hover:scale-105"
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-xl border-4 border-white flex items-center justify-center z-20 shadow-sm ${
                                                        appt.type === 'VIDEO_CALL' ? 'bg-indigo-600 text-white' : 'bg-sky-500 text-white'
                                                    }`}>
                                                        {appt.type === 'VIDEO_CALL' ? <Video className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {appt.patientId.name}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
                                                            appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            appt.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                                                            'bg-slate-100 text-slate-400 border-slate-200'
                                                        }`}>
                                                            {appt.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-500 shadow-sm">
                                                            <Calendar className="w-4 h-4" /> 
                                                            {new Date(appt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100/50 text-indigo-500 shadow-sm">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="text-[10px] ml-1 opacity-60">({appt.durationMinutes || 60}m)</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side: Actions */}
                                            <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                                                {appt.status === 'SCHEDULED' && (
                                                    <div className="flex gap-3 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => updateStatus(appt._id, 'CANCELLED_BY_THERAPIST')}
                                                            className="flex-1 sm:flex-none p-5 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-2xl transition-all h-full flex items-center justify-center"
                                                        >
                                                            <XCircle className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(appt._id, 'CONFIRMED')}
                                                            className="flex-[3] sm:flex-none px-10 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl active:translate-y-1 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                                                        >
                                                            <Check className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                                                            Confirm Call
                                                        </button>
                                                    </div>
                                                )}

                                                {appt.status === 'CONFIRMED' && (
                                                    <div className="flex gap-4 w-full sm:w-auto items-center">
                                                        <button className="p-5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                                                            <Filter className="w-6 h-6 rotate-90" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const link = appt.googleMeetLink || appt.meetingLink || 'https://meet.google.com';
                                                                window.open(link, '_blank');
                                                            }}
                                                            className="flex-1 sm:flex-none px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 active:translate-y-1 hover:-translate-y-1"
                                                        >
                                                            {appt.type === 'VIDEO_CALL' ? <Video className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                                            Open Workspace
                                                            <ArrowUpRight className="w-4 h-4 opacity-50" />
                                                        </button>
                                                    </div>
                                                )}

                                                {appt.status === 'COMPLETED' && (
                                                    <button className="w-full sm:w-auto px-8 py-5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                        <ExternalLink className="w-4 h-4" /> 
                                                        Review Notes
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};
