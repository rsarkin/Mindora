/* eslint-disable react-hooks/static-components */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Paintbrush, Globe, Save, Server, Database, CheckCircle2 } from 'lucide-react';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('General');
    const [saved, setSaved] = useState(false);

    // Toggles
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'General', icon: Settings },
        { id: 'Security', icon: Shield },
        { id: 'Infrastructure', icon: Server },
        { id: 'Appearance', icon: Paintbrush },
        { id: 'Notifications', icon: Bell },
        { id: 'Localization', icon: Globe },
    ];

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
            className="w-full max-w-6xl mx-auto space-y-8 pb-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div variants={STAGGER_CHILD_VARIANTS}>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage global platform settings and organizational policies.</p>
                </motion.div>

                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex items-center gap-4 relative">
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="absolute right-full mr-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-sm whitespace-nowrap shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Config Applied
                        </motion.div>
                    )}
                    <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all text-sm w-full md:w-auto">
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </motion.div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar Navigation */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="w-full lg:w-64 shrink-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 sticky top-24">
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                                {tab.id}
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Content Area */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex-1 min-w-0">

                    {activeTab === 'General' && (
                        <div className="space-y-6">

                            {/* App Identity */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>

                                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary-500" /> Platform Details
                                </h2>

                                <div className="grid gap-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Organization Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Mindful Care Health"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Support Contact</label>
                                            <input
                                                type="email"
                                                defaultValue="support@mch-platform.com"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Base URL</label>
                                        <input
                                            type="text"
                                            defaultValue="https://app.mch-platform.com"
                                            disabled
                                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* System Status Toggles */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6">Operations</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-5 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-colors group">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-rose-900 flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-rose-500" /> Maintenance Mode
                                            </h3>
                                            <p className="text-sm text-rose-700/80 font-medium mt-1">Disables platform access for all non-admin users immediately. Shows 503 Maintenance page.</p>
                                        </div>
                                        <Toggle enabled={maintenanceMode} onChange={setMaintenanceMode} />
                                    </div>

                                    <div className="flex items-center justify-between p-5 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors group">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                                <Server className="w-4 h-4 text-amber-500" /> API Debug Mode
                                            </h3>
                                            <p className="text-sm text-amber-700/80 font-medium mt-1">Logs verbose request/response payloads to Datadog for troubleshooting.</p>
                                        </div>
                                        <Toggle enabled={debugMode} onChange={setDebugMode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Infrastructure' && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[60px] -mr-32 -mt-32 pointer-events-none"></div>

                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2 relative z-10">
                                <Database className="w-5 h-5 text-indigo-500" /> Database & Storage
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Region</p>
                                    <p className="text-lg font-black text-slate-900 font-heading">us-east-1</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 mb-1">Status</p>
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Healthy
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Storage Usage</p>
                                    <p className="text-lg font-black text-slate-900 font-heading">
                                        242 <span className="text-sm text-slate-500">/ 500 GB</span>
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                                            <div className="h-full bg-indigo-500 rounded-full w-[48%]"></div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 text-right">48% Capacity</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Appearance' && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>

                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2 relative z-10">
                                <Paintbrush className="w-5 h-5 text-amber-500" /> Interface Theming
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1">Default Platform Mode</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['Light (Default)', 'Dark', 'System Auto'].map((theme, idx) => (
                                            <button
                                                key={idx}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all ${idx === 0 ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full mb-3 shadow-sm ${idx === 0 ? 'bg-white border border-slate-200' : idx === 1 ? 'bg-slate-900 border border-slate-700' : 'bg-gradient-to-br from-white to-slate-900 border border-slate-300'
                                                    }`} />
                                                <p className={`font-bold text-sm ${idx === 0 ? 'text-primary-900' : 'text-slate-700'}`}>{theme}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['Notifications', 'Security', 'Localization'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm rotate-3">
                                {activeTab === 'Security' ? <Shield className="w-8 h-8 text-slate-300 -rotate-3" /> :
                                    activeTab === 'Notifications' ? <Bell className="w-8 h-8 text-slate-300 -rotate-3" /> :
                                        <Globe className="w-8 h-8 text-slate-300 -rotate-3" />}
                            </div>
                            <h3 className="text-2xl font-heading font-black text-slate-900 mb-2">{activeTab} Config</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Requires elevated IAM permissions to modify global {activeTab.toLowerCase()} parameters.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};
