import { motion } from 'framer-motion';
import { User, Mail, Shield, Camera, Edit2, Save, ShieldCheck, Key, Lock, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const AdminProfilePage = () => {
    const { user } = useAuth();

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
            className="w-full max-w-5xl mx-auto space-y-8 pb-12"
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS}>
                <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Administrator Profile</h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Manage your security credentials and personal information.</p>
            </motion.div>

            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">

                {/* Header background with Abstract FX */}
                <div className="h-48 bg-slate-900 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-indigo-600/20 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

                    <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl px-4 py-2 transition-all backdrop-blur-md flex items-center gap-2 font-bold text-sm">
                        <Edit2 className="w-4 h-4" /> Edit Cover
                    </button>
                </div>

                {/* Profile Info & Actions */}
                <div className="px-8 pb-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-8 gap-6">
                        <div className="flex items-end gap-6">
                            <div className="relative group inline-block">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=0f172a&color=fff&size=128`}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover bg-white pointer-events-none"
                                />
                                <button className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:scale-105 border-2 border-white">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="pb-2">
                                <h2 className="text-2xl font-black font-heading text-slate-900 leading-tight">{user?.name || 'Administrator'}</h2>
                                <p className="text-primary-600 font-bold flex items-center gap-1.5 mt-1">
                                    <ShieldCheck className="w-4 h-4" /> Super Admin
                                </p>
                            </div>
                        </div>

                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all text-sm w-full md:w-auto">
                            <Save className="w-4 h-4" /> Save Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column - Personal Info */}
                        <div className="lg:col-span-7 space-y-8">

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8">
                                <h3 className="text-lg font-heading font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-500" /> Identity Information
                                </h3>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                defaultValue={user?.name || 'System Administrator'}
                                                className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Contact Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                defaultValue={user?.email || 'admin@mch-platform.com'}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                defaultValue="IT Infrastructure & Security"
                                                disabled
                                                className="w-full pl-4 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8">
                                <h3 className="text-lg font-heading font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <BellRing className="w-5 h-5 text-amber-500" /> Admin Notifications
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { label: 'System Outages Alerts', desc: 'Critical alerts for platform downtime.', active: true },
                                        { label: 'New Provider Signups', desc: 'Notify when therapists register.', active: true },
                                        { label: 'Security Breaches', desc: 'Failed logins and suspicious patterns.', active: true },
                                    ].map((pref, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{pref.label}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{pref.desc}</p>
                                            </div>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id={`toggle${i}`} checked={pref.active} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: pref.active ? '0' : 'auto', borderColor: pref.active ? '#3b82f6' : '#e2e8f0' }} />
                                                <label htmlFor={`toggle${i}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${pref.active ? 'bg-primary-500' : 'bg-slate-300'}`}></label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column - Security */}
                        <div className="lg:col-span-5 space-y-8">

                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                                <h3 className="text-lg font-heading font-black text-indigo-950 mb-6 flex items-center gap-2 relative z-10">
                                    <Shield className="w-5 h-5 text-indigo-600" /> Clearance Level
                                </h3>

                                <div className="space-y-5 relative z-10">
                                    <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                                                <Key className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm">Tier 1 root access</h4>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed pl-11">
                                            You are authorized to modify global system variables, configure databases, and manage roles.
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                            Actions performed under this identity are strictly audited in compliance with HIPAA guidelines.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8">
                                <h3 className="text-lg font-heading font-black text-slate-900 mb-6">Security Settings</h3>

                                <div className="space-y-4">
                                    <button className="w-full flex justify-between items-center py-4 px-5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-all shadow-sm">
                                        <span>Change Password</span>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>

                                    <button className="w-full flex justify-between items-center py-4 px-5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-all shadow-sm">
                                        <span className="flex items-center gap-2">Two-Factor Auth <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-black">Active</span></span>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>

                                    <button className="w-full flex justify-between items-center py-4 px-5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-all shadow-sm">
                                        <span>Active Sessions</span>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* Quick local ChevronRight helper since it wasn't specifically imported if missed above */
const ChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
);
