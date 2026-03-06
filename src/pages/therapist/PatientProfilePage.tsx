/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Calendar,
    Activity, FileText, ChevronLeft, MessageSquare, Video, ShieldCheck, Download, MoreVertical, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface PatientProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    occupation: string;
    address: string;
    avatar: string;
    joinDate: string;
    status: 'Active' | 'Inactive';
    diagnosis: string[];
    medications: string[];
    nextAppointment: string;
    notes: Note[];
    moodHistory: { date: string; score: number }[];
}

interface Note {
    id: string;
    date: string;
    content: string;
    author: string;
}

export const PatientProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock Data Generation
        setTimeout(() => {
            setPatient({
                id: id || '1',
                name: 'Sarah Chen',
                email: 'sarah.chen@example.com',
                phone: '+1 (555) 123-4567',
                age: 28,
                gender: 'Female',
                occupation: 'Graphic Designer',
                address: '123 Wellness Ave, San Francisco, CA',
                avatar: `https://ui-avatars.com/api/?name=Sarah+Chen&background=3b82f6&color=fff`,
                joinDate: '2024-01-15',
                status: 'Active',
                diagnosis: ['Generalized Anxiety Disorder', 'Mild Depression'],
                medications: ['Sertraline 50mg', 'Melatonin 3mg'],
                nextAppointment: new Date(Date.now() + 86400000 * 2).toISOString(),
                notes: [
                    { id: 'n1', date: new Date(Date.now() - 86400000 * 5).toISOString(), content: 'Patient reported feeling better after breathing exercises. Discussed work stress triggers and implemented 4-7-8 breathing blocks.', author: 'Dr. Sarah' },
                    { id: 'n2', date: new Date(Date.now() - 86400000 * 12).toISOString(), content: 'Initial consultation phase 2. Signs of anxiety still prominent but manageable. Recommended daily journaling via Mindora.', author: 'Dr. Sarah' }
                ],
                moodHistory: [
                    { date: 'Jul 1', score: 6 },
                    { date: 'Jul 5', score: 5 },
                    { date: 'Jul 10', score: 7 },
                    { date: 'Jul 15', score: 6 },
                    { date: 'Jul 20', score: 8 },
                    { date: 'Jul 25', score: 7 },
                    { date: 'Jul 30', score: 9 },
                ]
            });
            setLoading(false);
        }, 800);
    }, [id]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl">
                    <p className="font-semibold text-sm mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                        <p className="text-primary-100 font-bold">
                            Score: <span className="text-white text-lg">{payload[0].value}</span><span className="text-slate-400 text-xs">/10</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };


    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading patient file securely...</p>
        </div>
    );

    if (!patient) return <div className="p-8 text-center text-slate-500 font-medium font-heading text-xl">Patient file could not be located.</div>;

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
            {/* Header Navigation */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/therapist/patients')}
                    className="flex items-center text-slate-500 hover:text-slate-900 font-bold transition-colors w-fit group"
                >
                    <div className="p-1 sm:p-1.5 bg-white border border-slate-200 rounded-lg mr-2 sm:mr-3 group-hover:border-slate-300 transition-colors">
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    Back to Directory
                </button>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold shadow-sm transition-all flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" /> Export records
                    </button>
                    <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Core Profile & Actions (Col-span 4) */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

                    {/* ID Card */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-5">
                                <img
                                    src={patient.avatar}
                                    alt={patient.name}
                                    className="h-28 w-28 rounded-full object-cover shadow-lg border-4 border-white bg-slate-50 ring-1 ring-slate-100"
                                />
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                            </div>

                            <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight leading-tight">{patient.name}</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">{patient.occupation}</p>

                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold tracking-wider uppercase">
                                    {patient.status}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> HIPAA
                                </span>
                            </div>
                        </div>

                        <hr className="my-6 border-slate-100" />

                        <div className="space-y-4">
                            <div className="flex items-center text-sm font-semibold text-slate-600">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="truncate">{patient.email}</span>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-slate-600">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                </div>
                                <span>{patient.phone}</span>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-slate-600">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <span>{patient.age} yrs • {patient.gender}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <button onClick={() => navigate('/therapist/messages')} className="flex-1 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                            <button className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-slate-900/10 text-sm">
                                Manage
                            </button>
                        </div>
                    </div>

                    {/* Next Appointment Mini-Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-xl shadow-indigo-600/20 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <h3 className="text-white/80 font-bold text-sm tracking-wider uppercase mb-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Next Session
                        </h3>
                        <p className="text-2xl font-black text-white font-heading mt-2">
                            {new Date(patient.nextAppointment).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-indigo-200 font-semibold mb-6">
                            at {new Date(patient.nextAppointment).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/session/${patient.id}`)}
                                className="flex-1 py-2.5 bg-white text-indigo-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
                            >
                                <Video className="w-4 h-4" /> Join Call
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Clinical Details & Charts (Col-span 8) */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-8 space-y-6">

                    {/* Clinical Overview */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Clinical Overview</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Diagnoses</h4>
                                <div className="flex flex-wrap gap-2">
                                    {patient.diagnosis.map((d, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-red-50/80 text-red-700 border border-red-100 rounded-xl text-sm font-bold shadow-sm">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Active Medications</h4>
                                <ul className="space-y-2">
                                    {patient.medications.map((m, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Mood Chart */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden group">
                        {/* Premium Chart Background FX */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary-50 to-transparent opacity-50 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Mood & Progress</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Self-reported mood scores (last 30 days)</p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-bold tracking-wide">
                                Trending Up ↗
                            </div>
                        </div>

                        <div className="h-72 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={patient.moodHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Session Notes */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Session Notes</h3>
                            </div>
                            <button className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Note
                            </button>
                        </div>

                        <div className="space-y-6">
                            {patient.notes.map((note) => (
                                <div key={note.id} className="relative pl-6 sm:pl-8 group">
                                    {/* Timeline Marker */}
                                    <div className="absolute left-0 top-1.5 w-3 h-3 bg-white border-2 border-violet-400 rounded-full z-10 group-hover:scale-125 transition-transform shadow-sm"></div>
                                    <div className="absolute left-[5px] top-4 bottom-[-32px] w-[2px] bg-slate-100 last:hidden"></div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-violet-100 hover:shadow-md hover:shadow-violet-500/5 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                {new Date(note.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 w-fit">
                                                Author: {note.author}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 font-medium leading-relaxed">{note.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
};
