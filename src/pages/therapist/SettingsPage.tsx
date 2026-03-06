/* eslint-disable react-hooks/static-components */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Shield, Lock, CreditCard, User, Globe,
    Smartphone, Mail, Save, CheckCircle2
} from 'lucide-react';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing'>('general');
    const [saved, setSaved] = useState(false);

    // Toggle States
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);
    const [emergencyStatus, setEmergencyStatus] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: (val: boolean) => void }) => (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${enabled ? 'bg-primary-500' : 'bg-slate-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
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
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage your clinical preferences, security, and notifications.</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="absolute right-full mr-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-sm whitespace-nowrap shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Changes Saved
                        </motion.div>
                    )}
                    <button onClick={handleSave} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Preferences
                    </button>
                </div>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar Navigation */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="w-full md:w-64 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 shrink-0 sticky top-24">
                    <nav className="space-y-1">
                        {[
                            { id: 'general', icon: User, label: 'General & Profile' },
                            { id: 'security', icon: Lock, label: 'Security & Access' },
                            { id: 'notifications', icon: Bell, label: 'Notifications' },
                            { id: 'billing', icon: CreditCard, label: 'Billing & Payouts' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary-600' : 'text-slate-400'}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Main Content Area */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex-1 space-y-6 min-w-0">

                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>

                                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6">Profile Settings</h2>

                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Display Name</label>
                                            <input type="text" defaultValue="Dr. Evelyn Reed" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Professional Title</label>
                                            <input type="text" defaultValue="Clinical Psychologist, PhD" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Timezone</label>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium appearance-none">
                                            <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                                            <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                                            <option>(UTC+00:00) GMT - London</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6">Clinical Preferences</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-emerald-500" /> Accept Emergency Requests
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Allow platform to route crisis patients to you if available.</p>
                                        </div>
                                        <Toggle enabled={emergencyStatus} onChange={setEmergencyStatus} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" /> Public Profile Directory
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Allow new patients to find and book you via the platform search.</p>
                                        </div>
                                        <Toggle enabled={publicProfile} onChange={setPublicProfile} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-2">Notification Routing</h2>
                            <p className="text-slate-500 font-medium mb-8">Choose how you want to be alerted for sessions and messages.</p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Email Notifications</h3>
                                            <p className="text-sm text-slate-500 mt-1">Daily summaries and appointment reminders.</p>
                                        </div>
                                    </div>
                                    <Toggle enabled={emailNotifs} onChange={setEmailNotifs} />
                                </div>

                                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                                            <Smartphone className="w-5 h-5 text-sky-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">SMS Alerts</h3>
                                            <p className="text-sm text-slate-500 mt-1">Critical alerts only (cancellations &lt;24hrs, emergency requests).</p>
                                        </div>
                                    </div>
                                    <Toggle enabled={smsNotifs} onChange={setSmsNotifs} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder content for other tabs */}
                    {(activeTab === 'security' || activeTab === 'billing') && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'security' ? <Lock className="w-8 h-8 text-slate-300" /> : <CreditCard className="w-8 h-8 text-slate-300" />}
                            </div>
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-2">
                                {activeTab === 'security' ? 'Security Options' : 'Billing & Payouts'}
                            </h2>
                            <p className="text-slate-500 font-medium">This module is currently integrated with your organizational SSO and Finance portal.</p>
                        </div>
                    )}

                </motion.div>
            </div>
        </motion.div>
    );
};
