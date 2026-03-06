import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Clock, Calendar, Activity, Save, Key, Camera, Edit2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: 'I am on a journey to better mental health and personal growth.',
        birthdate: '',
        gender: 'prefer_not_to_say'
    });

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
        }, 800);
    };

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
            className="w-full max-w-5xl mx-auto space-y-8"
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your personal information and preferences.</p>
                </div>
            </motion.div>

            {/* Header Section */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6 relative z-10">
                        <div className="relative group cursor-pointer">
                            <div className="h-28 w-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg relative">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=eff6ff&color=3b82f6&size=200`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{formData.name}</h2>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
                                <Shield className="w-4 h-4 text-primary-500" />
                                {user?.role === 'therapist' ? 'Licensed Therapist' : 'Premium Member'}
                            </p>
                        </div>

                        <div className="mb-2">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${isEditing
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-0.5'
                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : isEditing ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Save Changes</>
                                ) : (
                                    <><Edit2 className="w-4 h-4" /> Edit Profile</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Info */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-slate-900">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        disabled={true}
                                        value={formData.email}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 ml-2">Email address cannot be changed directly. Contact support.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Birthdate</label>
                                <input
                                    type="date"
                                    disabled={!isEditing}
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Gender</label>
                                <select
                                    disabled={!isEditing}
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non_binary">Non-binary</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Bio</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                                    placeholder="Tell us a little about yourself..."
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex justify-end pt-6 mt-6 border-t border-slate-100"
                                >
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all"
                                    >
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Key className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-slate-900">Security</h2>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">Account Password</p>
                                <p className="text-sm font-medium text-slate-500">Last changed 3 months ago</p>
                            </div>
                            <button className="px-4 py-2 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-white transition-colors">
                                Update
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Stats & Activity */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-8">
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-secondary-50 text-secondary-600 rounded-xl">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-slate-900">My Journey</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100/50 group hover:-translate-y-0.5 transition-transform">
                                <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-xl ring-4 ring-indigo-50">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tight">12</p>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hours Recorded</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-100/50 group hover:-translate-y-0.5 transition-transform">
                                <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-xl ring-4 ring-emerald-50">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tight">5</p>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sessions Attended</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-sm font-medium text-slate-500 text-center">
                                Member since {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
