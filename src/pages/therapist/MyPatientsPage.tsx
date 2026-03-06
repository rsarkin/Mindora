/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
    Calendar, 
    MessageSquare, 
    Eye, 
    Clock, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Activity, 
    TrendingUp, 
    TrendingDown, 
    Minus,
    ArrowRight,
    UserCircle,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { showToast } = useToast();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await api.getMyPatients();
                setPatients(data);
            } catch (error) {
                console.error('Error fetching patients:', error);
                showToast('Failed to load patient directory', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const getMoodIcon = (trend?: string) => {
        switch (trend) {
            case 'Improving': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'Declining': return <TrendingDown className="w-4 h-4 text-rose-500" />;
            case 'Fluctuating': return <Activity className="w-4 h-4 text-amber-500" />;
            case 'Stable':
            default: return <Minus className="w-4 h-4 text-sky-500" />;
        }
    };

    const getMoodColor = (trend?: string) => {
        switch (trend) {
            case 'Improving': return 'emerald';
            case 'Declining': return 'rose';
            case 'Fluctuating': return 'amber';
            case 'Stable':
            default: return 'sky';
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh]">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-indigo-200 animate-pulse" />
                </div>
            </div>
            <p className="text-slate-500 font-bold mt-8 animate-pulse uppercase tracking-[0.2em] text-xs">Accessing Directory...</p>
        </div>
    );

    return (
        <div className="relative">
            {/* Page header atmospheric background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] -ml-20 pointer-events-none" />

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
                className="max-w-7xl mx-auto space-y-10 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Overseeing <span className="text-indigo-600 font-bold">{patients.length} active journeys</span> in your practice.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-5 py-3.5 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm group-hover:bg-white"
                            />
                        </div>
                        <button className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 font-black shadow-sm transition-all focus:outline-none text-slate-600 flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1">
                            <Filter className="w-4 h-4" /> Filter Views
                        </button>
                    </div>
                </motion.div>

                {/* Patient Summary Board (New Concept) */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Stability", value: "84%", trend: "Up 2%", icon: Activity, color: "emerald" },
                        { label: "Active Now", value: "3", sub: "Patients", icon: CheckCircle2, color: "sky" },
                        { label: "Risk Level", value: "Low", sub: "Priority", icon: TrendingDown, color: "slate" },
                        { label: "Monthly Avg", value: "12", sub: "Sessions/Patient", icon: Calendar, color: "indigo" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white/40 backdrop-blur-sm p-5 rounded-[2rem] border border-white/60 shadow-sm flex items-center gap-4 group hover:bg-white transition-all">
                            <div className={`w-12 h-12 rounded-[1.25rem] bg-${item.color}-50 flex items-center justify-center border border-${item.color}-100 group-hover:scale-110 transition-transform`}>
                                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                                <p className="text-xl font-black text-slate-800 tracking-tight">{item.value} <span className="text-[10px] font-bold text-slate-400 ml-1">{item.sub || item.trend}</span></p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Patients Grid */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPatients.map((patient) => (
                        <motion.div
                            key={patient._id}
                            className="group relative bg-white rounded-[2.5rem] p-1 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
                            layout
                        >
                            <div className="bg-slate-50/50 rounded-[2.25rem] p-6 md:p-8 relative z-10 transition-colors group-hover:bg-white flex flex-col h-full border border-white">
                                {/* Header Info */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                            <img
                                                className="h-16 w-16 md:h-20 md:w-20 rounded-[1.75rem] object-cover border-2 border-white shadow-xl relative z-10 transition-transform group-hover:scale-105 duration-500"
                                                src={patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=1e1b4b&color=ffffff&bold=true`}
                                                alt={patient.name}
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full z-20 shadow-sm"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors mb-1">{patient.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-500 py-0.5 px-2 bg-indigo-50 border border-indigo-100/50 rounded-full">
                                                    {patient.totalSessions} Sessions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all h-fit">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Status Dashboard in Card */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className={`p-4 rounded-3xl border border-${getMoodColor(patient.moodTrend)}-100 bg-${getMoodColor(patient.moodTrend)}-50/50 flex flex-col gap-2 transition-transform hover:scale-[1.02]`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest text-${getMoodColor(patient.moodTrend)}-600/70`}>Mood Trend</span>
                                        <div className="flex items-center gap-2">
                                            {getMoodIcon(patient.moodTrend)}
                                            <span className={`text-sm font-black text-${getMoodColor(patient.moodTrend)}-800`}>{patient.moodTrend || 'Stable'}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-3xl border border-slate-100 bg-white/50 flex flex-col gap-2 transition-transform hover:scale-[1.02]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last Session</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-black text-slate-700">
                                                {new Date(patient.lastSession).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 mt-auto pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => navigate(`/therapist/patients/${patient._id}`)}
                                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-[1.25rem] text-sm font-black shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:translate-x-1 group/btn"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Eye className="w-5 h-5 text-indigo-400" />
                                            Open Treatment Chart
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-indigo-400 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => navigate('/therapist/messages')} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-100 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 rounded-[1.15rem] text-sm font-black transition-all">
                                            <MessageSquare className="w-4 h-4" /> Message
                                        </button>
                                        <button onClick={() => navigate('/therapist/appointments')} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-100 text-slate-700 hover:border-sky-200 hover:text-sky-600 rounded-[1.15rem] text-sm font-black transition-all">
                                            <Calendar className="w-4 h-4" /> Book Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <AnimatePresence>
                        {filteredPatients.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-20 px-8 text-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-indigo-100 border-dashed"
                            >
                                <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-indigo-100">
                                    <Search className="w-10 h-10 text-indigo-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Patient Not Found</h3>
                                <p className="text-slate-500 font-medium max-w-sm">We couldn't find any records matching "<span className="text-indigo-600 font-bold">{searchQuery}</span>". Try searching by first name or check for typos.</p>
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all"
                                >
                                    Clear search
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
};
