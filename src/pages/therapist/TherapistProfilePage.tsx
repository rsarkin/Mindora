import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTherapistStore } from '../../store/useTherapistStore';
import api from '../../services/api';
import { Star, MapPin, CheckCircle, Shield, X, Save, Edit2, Video, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const TherapistProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { profile, updateProfile, isLoading } = useTherapistStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        specialization: [] as string[],
        hourlyRateINR: 0
    });

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditForm({
                bio: profile.bio || '',
                specialization: profile.specializations || [],
                hourlyRateINR: profile.hourlyRateINR || 2500
            });
            if (!profile.profileComplete) {
                setIsEditing(true);
            }
        }
    }, [profile]);

    const handleSave = async () => {
        await updateProfile(api, {
            bio: editForm.bio,
            specializations: editForm.specialization,
            hourlyRateINR: editForm.hourlyRateINR
        } as any);
        setIsEditing(false);
    };

    if (isLoading || !profile) return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading practitioner profile...</p>
        </div>
    );

    const certifications = [
        "Licensed Professional Counselor (LPC)",
        "Certified EMDR Therapist",
        "National Certified Counselor (NCC)"
    ];

    const reviews = [
        { id: 1, name: "S*** M.", date: "2 weeks ago", rating: 5, comment: "Dr. Reed has been incredibly supportive and insightful. She helped me through a very difficult period with her compassionate approach. Highly recommend!" },
        { id: 2, name: "J*** D.", date: "1 month ago", rating: 5, comment: "Professional and understanding. The sessions have given me practical tools to manage my anxiety. Very grateful for her guidance." }
    ];

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
            className="max-w-7xl mx-auto space-y-8 pb-12"
        >
            {/* Premium Header Banner Card */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-[80px] -ml-32 -mb-32 opacity-30"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                    <div className="relative">
                        <img
                            src={profile.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Therapist')}&background=3b82f6&color=fff`}
                            alt={user?.name}
                            className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white ring-1 ring-slate-100 bg-slate-50"
                        />
                        {profile.verificationStatus === 'APPROVED' && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white shadow-sm" title="Verified Professional">
                                <Shield className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
                                    {user?.name || "Therapist"}
                                </h1>
                                <p className="text-primary-600 font-bold text-lg mt-0.5">Clinical Psychologist, PhD</p>
                            </div>

                            <div className="flex gap-3">
                                {profile.googleRefreshToken ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm">
                                        <CheckCircle className="w-4 h-4" /> Google Calendar Connected
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await api.get('/auth/google');
                                                if (res.data.url) window.location.href = res.data.url;
                                            } catch (err) {
                                                console.error('Failed to get Google Auth URL', err);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm shadow-sm"
                                    >
                                        <Calendar className="w-4 h-4 text-primary-500" /> Connect Google Calendar
                                    </button>
                                )}
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditForm({ bio: profile.bio || '', specialization: profile.specializations || [], hourlyRateINR: profile.hourlyRateINR || 2500 });
                                            }}
                                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4 mr-1.5" /> Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 flex items-center justify-center"
                                        >
                                            <Save className="w-4 h-4 mr-1.5" /> Save Profile
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 flex items-center justify-center"
                                    >
                                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <MapPin className="w-4 h-4 text-slate-400" /> Licensed in NY & CA
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Video className="w-4 h-4 text-slate-400" /> Telehealth & In-person
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 5.0 Rating (120+)
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Content (Col-Span 8) */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-8 space-y-8">

                    {/* Bio Section */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-primary-500" /> Professional Summary
                        </h2>

                        {isEditing ? (
                            <textarea
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700 font-medium min-h-[160px] resize-y transition-all"
                                value={editForm.bio}
                                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Enter your professional summary..."
                            />
                        ) : (
                            <p className="text-slate-600 font-medium leading-relaxed text-[15px]">
                                {profile.bio || "No professional summary provided."}
                            </p>
                        )}
                    </div>

                    {/* Specializations & Certs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Specializations */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6">
                                <Star className="w-5 h-5 text-fuchsia-500" /> Areas of Focus
                            </h2>

                            {isEditing ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Separate by commas</p>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 text-slate-700 font-medium min-h-[120px] transition-all"
                                        value={editForm.specialization.join(', ')}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value.split(',').map(s => s.trim()) }))}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2.5">
                                    {(profile.specializations || []).map((spec, idx) => (
                                        <span key={idx} className="px-3.5 py-1.5 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 rounded-xl text-sm font-bold shadow-sm">
                                            {spec}
                                        </span>
                                    ))}
                                    {(!profile.specializations || profile.specializations.length === 0) && <p className="text-slate-500 font-medium text-sm">No specializations listed.</p>}
                                </div>
                            )}
                        </div>

                        {/* Certifications */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 h-full">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6">
                                <GraduationCap className="w-5 h-5 text-indigo-500" /> Credentials
                            </h2>
                            <ul className="space-y-4">
                                {certifications.map((cert, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-[15px]">
                                        <div className="mt-0.5 text-indigo-500"><CheckCircle className="w-5 h-5" /></div>
                                        {cert}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Patient Reviews Segment */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Recent Feedback</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Anonymized reviews from your latest sessions.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-amber-700">5.0</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative">
                                    <div className="flex text-amber-400 mb-3 gap-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-slate-700 font-medium mb-4 leading-relaxed line-clamp-4">"{review.comment}"</p>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mt-auto">
                                        <span>{review.name}</span>
                                        <span>{review.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>

                {/* Right Sidebar (Col-Span 4) */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">

                    {/* Rate & Services Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl shadow-slate-900/10 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>

                        <h2 className="text-xl font-heading font-black tracking-tight mb-8">Consultation Fees</h2>

                        <div className="space-y-6 relative z-10">
                            <div className="flex flex-col gap-2 pb-6 border-b border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium text-sm">Individual Session (50 min)</span>
                                    {isEditing ? (
                                        <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 focus-within:border-primary-400 transition-colors">
                                            <span className="text-slate-400 font-bold mr-1.5">₹</span>
                                            <input
                                                type="number"
                                                className="w-20 bg-transparent outline-none font-black text-right"
                                                value={editForm.hourlyRateINR}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRateINR: Number(e.target.value) }))}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-black font-heading leading-none">₹{profile.hourlyRateINR || 2500}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pb-6 border-b border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium text-sm">Couples Session (75 min)</span>
                                    <span className="text-2xl font-black font-heading leading-none">₹{(profile.hourlyRateINR || 2500) + 500}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium text-sm">Initial Call (15 min)</span>
                                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-black uppercase tracking-widest">Free</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Analytics Mini Card */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <h2 className="text-lg font-heading font-black text-slate-900 tracking-tight mb-6">Metrics this Month</h2>
                        <div className="space-y-4 text-sm font-bold">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Sessions Completed</span>
                                <span className="text-slate-900 text-lg">42</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 w-[75%] rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                                <span className="text-slate-500">New Patients</span>
                                <span className="text-emerald-600 text-lg">+8</span>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
};
