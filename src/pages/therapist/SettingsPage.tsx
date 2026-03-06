/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Shield, Lock, CreditCard, User, Globe,
    Smartphone, Mail, Save, CheckCircle2, AlertCircle,
    Eye, EyeOff, Loader2, Landmark
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
    const [error, setError] = useState<string | null>(null);

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
    const [passwordSuccess, setPasswordSuccess] = useState(false);

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
            setError("Failed to load settings. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            await api.updateSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setPasswordSaving(true);
            setError(null);
            await api.changePassword({
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setPasswordSuccess(true);
            setPasswordData({ current: '', new: '', confirm: '' });
            setTimeout(() => setPasswordSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update password.");
        } finally {
            setPasswordSaving(false);
        }
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                <div className="h-20 bg-slate-100 rounded-3xl w-1/3" />
                <div className="flex gap-8">
                    <div className="w-64 h-64 bg-slate-100 rounded-3xl" />
                    <div className="flex-1 h-96 bg-slate-100 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage your clinical preferences, security, and notifications.</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    <AnimatePresence>
                        {saved && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="absolute right-full mr-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-sm whitespace-nowrap shadow-sm"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Changes Saved
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="absolute right-full mr-4 flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 font-bold text-sm whitespace-nowrap shadow-sm"
                            >
                                <AlertCircle className="w-4 h-4" /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Preferences'}
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
                                            <input
                                                type="text"
                                                value={settings.name}
                                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Professional Title</label>
                                            <input
                                                type="text"
                                                value={settings.professionalTitle}
                                                onChange={(e) => setSettings({ ...settings, professionalTitle: e.target.value })}
                                                placeholder="e.g. Clinical Psychologist, PhD"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Timezone</label>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium appearance-none"
                                        >
                                            <option value="UTC-05:00">(UTC-05:00) Eastern Time (US & Canada)</option>
                                            <option value="UTC-08:00">(UTC-08:00) Pacific Time (US & Canada)</option>
                                            <option value="UTC+00:00">(UTC+00:00) GMT - London</option>
                                            <option value="UTC+05:30">(UTC+05:30) IST - India</option>
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
                                        <Toggle enabled={settings.emergencyRequests} onChange={(val) => setSettings({ ...settings, emergencyRequests: val })} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" /> Public Profile Directory
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Allow new patients to find and book you via the platform search.</p>
                                        </div>
                                        <Toggle enabled={settings.publicProfile} onChange={(val) => setSettings({ ...settings, publicProfile: val })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-2">Security & Password</h2>
                            <p className="text-slate-500 font-medium mb-8">Update your password and manage account security.</p>

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.current}
                                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordData.new}
                                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordData.confirm}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {passwordSuccess && (
                                        <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-600 font-bold block">
                                            Password updated successfully!
                                        </motion.small>
                                    )}
                                </AnimatePresence>
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                                >
                                    {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </form>
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
                                    <Toggle
                                        enabled={settings.notificationPreferences.email}
                                        onChange={(val) => setSettings({ ...settings, notificationPreferences: { ...settings.notificationPreferences, email: val } })}
                                    />
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
                                    <Toggle
                                        enabled={settings.notificationPreferences.sms}
                                        onChange={(val) => setSettings({ ...settings, notificationPreferences: { ...settings.notificationPreferences, sms: val } })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            <Bell className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Push Notifications</h3>
                                            <p className="text-sm text-slate-500 mt-1">Real-time alerts in your browser.</p>
                                        </div>
                                    </div>
                                    <Toggle
                                        enabled={settings.notificationPreferences.push}
                                        onChange={(val) => setSettings({ ...settings, notificationPreferences: { ...settings.notificationPreferences, push: val } })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-2">Billing & Payouts</h2>
                            <p className="text-slate-500 font-medium mb-8">Manage your bank details for automated session payouts.</p>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Account Holder Name</label>
                                        <div className="relative text-slate-400 focus-within:text-primary-500">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={settings.bankAccount.holderName}
                                                onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, holderName: e.target.value } })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Bank Name</label>
                                        <div className="relative text-slate-400 focus-within:text-primary-500">
                                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={settings.bankAccount.bankName}
                                                onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, bankName: e.target.value } })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Account Number</label>
                                        <div className="relative text-slate-400 focus-within:text-primary-500">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                                            <input
                                                type="password"
                                                value={settings.bankAccount.accountNumber}
                                                onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, accountNumber: e.target.value } })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={settings.bankAccount.ifscCode}
                                            placeholder="e.g. SBIN0001234"
                                            onChange={(e) => setSettings({ ...settings, bankAccount: { ...settings.bankAccount, ifscCode: e.target.value.toUpperCase() } })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 font-medium font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4 items-start">
                                    <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-500 font-medium">Payouts are processed every Friday for sessions completed in the previous week.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};
