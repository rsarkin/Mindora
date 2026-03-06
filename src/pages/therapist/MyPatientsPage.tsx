import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MessageSquare, Eye, Clock, Search, Filter, MoreHorizontal, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Patient {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    lastSession: string;
    totalSessions: number;
    moodTrend?: 'Stable' | 'Fluctuating' | 'Declining' | 'Improving';
}

export const MyPatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const response = await axios.get(`${API_BASE_URL}/therapists/my-patients`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.length === 0) {
                    setPatients(getMockData());
                } else {
                    setPatients(response.data);
                }
            } catch (error) {
                console.error('Error fetching patients:', error);
                setPatients(getMockData());
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const getMockData = (): Patient[] => [
        { _id: '1', name: 'Sarah Chen', email: 'sarah@example.com', lastSession: new Date(Date.now() - 86400000 * 2).toISOString(), totalSessions: 5, moodTrend: 'Improving', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=fff' },
        { _id: '2', name: 'David Lee', email: 'david@example.com', lastSession: new Date(Date.now() - 86400000 * 5).toISOString(), totalSessions: 8, moodTrend: 'Fluctuating', avatar: 'https://ui-avatars.com/api/?name=David+Lee&background=f59e0b&color=fff' },
        { _id: '3', name: 'Emily White', email: 'emily@example.com', lastSession: new Date(Date.now() - 86400000 * 10).toISOString(), totalSessions: 3, moodTrend: 'Declining', avatar: 'https://ui-avatars.com/api/?name=Emily+White&background=ef4444&color=fff' },
        { _id: '4', name: 'Michael Brown', email: 'michael@example.com', lastSession: new Date(Date.now() - 86400000 * 1).toISOString(), totalSessions: 12, moodTrend: 'Stable', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=3b82f6&color=fff' },
        { _id: '5', name: 'Jessica Garcia', email: 'jessica@example.com', lastSession: new Date(Date.now() - 86400000 * 4).toISOString(), totalSessions: 6, moodTrend: 'Improving', avatar: 'https://ui-avatars.com/api/?name=Jessica+Garcia&background=8b5cf6&color=fff' },
        { _id: '6', name: 'Chris R.', email: 'chris@example.com', lastSession: new Date(Date.now() - 86400000 * 3).toISOString(), totalSessions: 9, moodTrend: 'Stable', avatar: 'https://ui-avatars.com/api/?name=Chris+R&background=64748b&color=fff' },
    ];

    const getMoodIcon = (trend?: string) => {
        switch (trend) {
            case 'Improving': return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
            case 'Declining': return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
            case 'Fluctuating': return <Activity className="w-3.5 h-3.5 text-amber-500" />;
            case 'Stable':
            default: return <Minus className="w-3.5 h-3.5 text-blue-500" />;
        }
    };

    const getMoodColorBg = (trend?: string) => {
        switch (trend) {
            case 'Improving': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
            case 'Declining': return 'bg-rose-50 border-rose-100 text-rose-700';
            case 'Fluctuating': return 'bg-amber-50 border-amber-100 text-amber-700';
            case 'Stable':
            default: return 'bg-blue-50 border-blue-100 text-blue-700';
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading patient directory...</p>
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
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Patient Directory</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your {patients.length} active patients and view their progress.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all shadow-sm"
                        />
                    </div>
                    <button className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/20 text-slate-600 flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </motion.div>

            {/* Patients Grid */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                    <motion.div
                        key={patient._id}
                        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group relative"
                    >
                        {/* Top Accent Line */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary-400 to-indigo-500"></div>

                        <div className="p-6">
                            {/* Header Info */}
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            className="h-14 w-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                                            src={patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=slate&color=fff`}
                                            alt={patient.name}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold font-heading text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{patient.name}</h3>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{patient.totalSessions} Sessions</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Info Badges */}
                            <div className="flex flex-col gap-3 mb-6">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${getMoodColorBg(patient.moodTrend)}`}>
                                    {getMoodIcon(patient.moodTrend)}
                                    Mood: {patient.moodTrend}
                                </div>

                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Last Active: {new Date(patient.lastSession).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <button
                                    onClick={() => navigate(`/therapist/patients/${patient._id}`)}
                                    className="col-span-2 flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-colors"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Review Chart
                                </button>

                                <button onClick={() => navigate('/therapist/messages')} className="flex items-center justify-center px-4 py-2.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-sm font-bold transition-colors">
                                    <MessageSquare className="w-4 h-4 mr-1.5" />
                                    Message
                                </button>

                                <button onClick={() => navigate('/therapist/appointments')} className="flex items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredPatients.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No patients found</h3>
                        <p className="text-slate-500">We couldn't find any patients matching "{searchQuery}"</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
