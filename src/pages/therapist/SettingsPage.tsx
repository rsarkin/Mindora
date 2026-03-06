import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, 
    Shield, 
    Lock, 
    CreditCard, 
    User, 
    Smartphone, 
    Mail, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    Eye, 
    EyeOff, 
    Loader2, 
    Landmark,
    ChevronRight,
    Fingerprint,
    Zap
} from 'lucide-react';
import api from '../../services/api';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface SettingsState {
    name: string;
    email: string;
    avatar?: string;
    professionalTitle: string;
    timezone: string;
    emergencyRequests: boolean;
    publicProfile: boolean;
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    bankAccount: {
        holderName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
}

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing'>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState<SettingsState>({
        name: '',
        email: '',
        professionalTitle: '',
        timezone: 'UTC+05:30',
        emergencyRequests: false,
        publicProfile: true,
        notificationPreferences: { email: true, sms: false, push: true },
        bankAccount: { holderName: '', accountNumber: '', bankName: '', ifscCode: '' }
    });

    // Security Tab State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.getSettings();
            setSettings(data);
        } catch (err) {
            console.error("Error fetching settings:", err);
            // Non-blocking fallback for UI demonstration
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.updateSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error(err.response?.data?.error || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            console.error("Passwords do not match.");
            return;
        }

        try {
            setPasswordSaving(true);
            await api.changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            console.error(err.response?.data?.error || "Failed to update password.");
        } finally {
            setPasswordSaving(false);
        }
    };

    const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: (val: boolean) => void }) => (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ring-offset-2 ${enabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-200'}`}
        >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 p-10 animate-pulse">
                <div className="h-16 bg-slate-100 rounded-[2rem] w-1/3" />
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="w-full lg:w-72 h-80 bg-slate-100 rounded-[2.5rem]" />
                    <div className="flex-1 h-[600px] bg-slate-100 rounded-[3rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-x-1/2 -mt-20 pointer-events-none" />

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
                className="max-w-6xl mx-auto space-y-12 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control Center</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Fine-tuning your clinical configuration and workspace security.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <AnimatePresence>
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Config Synchronized
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 active:translate-y-1 hover:-translate-y-1 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 text-xs uppercase tracking-widest"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Processing...' : 'Deploy Changes'}
                        </button>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
                    {/* Navigation Sidebar */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="w-full lg:col-span-3 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl p-3 sticky top-24">
                        <nav className="space-y-2">
                            {[
                                { id: 'general', icon: User, label: 'Workspace' },
                                { id: 'security', icon: Lock, label: 'Vault & Shield' },
                                { id: 'notifications', icon: Bell, label: 'Relay Nodes' },
                                { id: 'billing', icon: CreditCard, label: 'Capital Ops' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.75rem] text-sm font-black transition-all relative overflow-hidden group ${activeTab === item.id
                                        ? 'bg-slate-900 text-white shadow-2xl'
                                        : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                                    }`}
                                >
                                    {activeTab === item.id && (
                                        <motion.div 
                                            layoutId="tabBg"
                                            className="absolute inset-0 bg-slate-900 -z-10"
                                        />
                                    )}
                                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    <span className="uppercase tracking-[0.1em]">{item.label}</span>
                                    {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Content Matrix */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="lg:col-span-9 w-full space-y-10">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <section className="bg-white rounded-[3rem] p-1 border border-slate-100 shadow-xl overflow-hidden group">
                                        <div className="bg-slate-50/30 rounded-[2.75rem] p-8 md:p-12 border border-white">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
                                                <Zap className="w-6 h-6 text-indigo-500" />
                                                Workspace Profile
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Identity</label>
                                                    <input
                                                        type="text"
                                                        value={settings.name}
                                                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Title</label>
                                                    <input
                                                        type="text"
                                                        value={settings.professionalTitle}
                                                        onChange={(e) => setSettings({ ...settings, professionalTitle: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all shadow-sm"
                                                        placeholder="Clinical Psychologist, PhD"
                                                    />
                                                </div>
                                                <div className="space-y-3 md:col-span-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Temporal Node (Timezone)</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={settings.timezone}
                                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all appearance-none shadow-sm"
                                                        >
                                                            <option value="UTC-05:00">Eastern Time Node (US & Canada)</option>
                                                            <option value="UTC-08:00">Pacific Time Node (US & Canada)</option>
                                                            <option value="UTC+00:00">GMT Standard - London</option>
                                                            <option value="UTC+05:30">IST Node - India Hub</option>
                                                        </select>
                                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-white rounded-[3rem] p-1 border border-slate-100 shadow-xl overflow-hidden">
                                        <div className="bg-slate-50/30 rounded-[2.75rem] p-8 md:p-12 border border-white">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
                                                <Shield className="w-6 h-6 text-emerald-500" />
                                                Clinical Protocols
                                            </h2>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Crisis Intervention Mode</h3>
                                                        <p className="text-slate-500 font-medium text-xs leading-relaxed">Allow platform to route emergency cases to your queue when active.</p>
                                                    </div>
                                                    <Toggle enabled={settings.emergencyRequests} onChange={(val) => setSettings({ ...settings, emergencyRequests: val })} />
                                                </div>
                                                <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Public Directory Beacon</h3>
                                                        <p className="text-slate-500 font-medium text-xs leading-relaxed">Broadcast your availability to new patients within the Mindora network.</p>
                                                    </div>
                                                    <Toggle enabled={settings.publicProfile} onChange={(val) => setSettings({ ...settings, publicProfile: val })} />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[3.5rem] p-1 border border-slate-100 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="bg-slate-50/30 rounded-[3.25rem] p-10 md:p-12 border border-white">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                                    <Lock className="w-8 h-8 text-indigo-500" />
                                                    Access Vault
                                                </h2>
                                                <p className="text-slate-500 font-medium text-base">Secure your clinical credentials with high-entropy encryption.</p>
                                            </div>
                                            <div className="flex h-16 w-16 items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl group">
                                                <Fingerprint className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors cursor-zoom-in" />
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master Key (Current Password)</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? "text" : "password"}
                                                        value={passwordData.current}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all shadow-sm"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Entry Sequence</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.new ? "text" : "password"}
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all shadow-sm"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verify Entry Sequence</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        value={passwordData.confirm}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all shadow-sm"
                                                        required
                                                    />
                                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="md:col-span-2 pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={passwordSaving}
                                                    className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 active:translate-y-1 hover:-translate-y-1 transition-all shadow-xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                                                >
                                                    {passwordSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                                    Re-key Vault
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notifications' && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[3.5rem] p-1 border border-slate-100 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="bg-slate-50/30 rounded-[3.25rem] p-10 md:p-12 border border-white">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-10">
                                            <Bell className="w-7 h-7 text-sky-500" />
                                            Relay Nodes
                                        </h2>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'email', icon: Mail, label: 'Email Protocol', desc: 'Secure briefings and audit logs sent to your primary address.', color: 'bg-indigo-50 text-indigo-600' },
                                                { key: 'sms', icon: Smartphone, label: 'SMS Frequency', desc: 'Real-time cellular dispatch for time-critical alerts.', color: 'bg-sky-50 text-sky-600' },
                                                { key: 'push', icon: Zap, label: 'Live Pulse', desc: 'Instant browser signals for incoming session packets.', color: 'bg-amber-50 text-amber-600' }
                                            ].map((pref) => (
                                                <div key={pref.key} className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-transparent shadow-sm ${pref.color}`}>
                                                            <pref.icon className="w-7 h-7" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="font-black text-slate-900 uppercase tracking-tight">{pref.label}</h3>
                                                            <p className="text-slate-500 font-medium text-xs max-w-sm">{pref.desc}</p>
                                                        </div>
                                                    </div>
                                                    <Toggle
                                                        enabled={(settings.notificationPreferences as any)[pref.key]}
                                                        onChange={(val) => setSettings({ ...settings, notificationPreferences: { ...settings.notificationPreferences, [pref.key]: val } })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'billing' && (
                                <motion.div
                                    key="billing"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[3.5rem] p-1 border border-slate-100 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="bg-slate-50/30 rounded-[3.25rem] p-10 md:p-12 border border-white">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4 mb-10">
                                            <CreditCard className="w-7 h-7 text-emerald-500" />
                                            Capital Matrix
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Beneficiary Name</label>
                                                <div className="relative group">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={settings.bankAccount.holderName}
                                                        onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, holderName: e.target.value } })}
                                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-800 transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hub Institution</label>
                                                <div className="relative group">
                                                    <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={settings.bankAccount.bankName}
                                                        onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, bankName: e.target.value } })}
                                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-800 transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vault Path (Account Number)</label>
                                                <input
                                                    type="password"
                                                    value={settings.bankAccount.accountNumber}
                                                    onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, accountNumber: e.target.value } })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-800 transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gateway Identity (IFSC)</label>
                                                <input
                                                    type="text"
                                                    value={settings.bankAccount.ifscCode}
                                                    onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, ifscCode: e.target.value.toUpperCase() } })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-slate-800 transition-all shadow-sm font-mono tracking-tighter"
                                                    placeholder="HUB-0001-X"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-6 items-center">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                                Earnings are automatically dispatched to this vault every Friday at <span className="text-emerald-600">00:00 UTC</span>.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Secure Footer */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex justify-center flex-col items-center gap-6 pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Therapist Workspace Node 07</p>
                    <button className="text-xs font-black text-rose-500 hover:text-rose-600 opacity-60 hover:opacity-100 transition-all uppercase tracking-widest flex items-center gap-2">
                        Decommission Account <AlertCircle className="w-4 h-4" />
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};
