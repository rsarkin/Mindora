import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, AlertTriangle, MessageCircle, Globe } from 'lucide-react';

const HELPLINES = [
    {
        category: '🆘 Emergency Services',
        color: 'from-red-500 to-rose-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        lines: [
            { name: 'National Emergency (Police/Fire/Ambulance)', number: '112', available: '24/7' },
        ],
    },
    {
        category: '🧠 Mental Health Crisis',
        color: 'from-sky-500 to-blue-600',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        lines: [
            { name: 'Tele-MANAS (Govt. Mental Health Helpline)', number: '14416', available: '24/7' },
            { name: 'iCall (TISS)', number: '9152987821', available: 'Mon–Sat, 8am–10pm' },
            { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' },
            { name: 'NIMHANS Mental Health Helpline', number: '080-46110007', available: '24/7' },
            { name: 'Snehi', number: '044-24640050', available: '24/7' },
        ],
    },
    {
        category: '💙 Suicide Prevention',
        color: 'from-indigo-500 to-violet-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        lines: [
            { name: 'iCall Suicide Prevention', number: '9152987821', available: '24/7' },
            { name: 'Aasra', number: '9820466627', available: '24/7' },
            { name: 'Sumaitri', number: '011-23389090', available: '2pm–10pm daily' },
            { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' },
        ],
    },
    {
        category: '👩 Women & Domestic Violence',
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        lines: [
            { name: "Women's Helpline (National)", number: '1091', available: '24/7' },
            { name: 'iWomen Helpline', number: '181', available: '24/7' },
            { name: 'NCW Helpline', number: '7827170170', available: '24/7' },
        ],
    },
    {
        category: '🧒 Child Helpline',
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        lines: [
            { name: 'Childline India', number: '1098', available: '24/7' },
        ],
    },
];

export const CrisisHelplinesPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50/40 -z-10" />
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />

            <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-100 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-all font-bold text-sm group">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Home
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-200/50 p-1.5 border border-white/20">
                            <img src="/logo.png" alt="Mindora" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="font-black text-2xl text-slate-800 tracking-tight">Mindora</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    {/* Hero Section */}
                    <div className="text-center mb-16 px-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 border border-red-100/50 text-red-600 text-xs font-black uppercase tracking-widest mb-8 shadow-sm"
                        >
                            <AlertTriangle className="w-4 h-4" /> Immediate Support Required
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                            Crisis <span className="text-red-600">Helplines</span>
                        </h1>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            India-specific mental health support lines accessible 24/7. You don't have to carry this burden alone.
                        </p>
                    </div>

                    {/* Primary Emergency Card */}
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className="relative group mb-12"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition" />
                        <div className="relative bg-white rounded-[32px] p-8 md:p-10 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="text-center md:text-left relative z-10">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">In immediate danger?</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">National Emergency Hotline</p>
                            </div>
                            <a href="tel:112" className="group/btn relative inline-flex items-center gap-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-3xl px-12 py-5 rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-red-200 active:scale-95">
                                <Phone className="w-8 h-8 animate-pulse" /> 112
                            </a>
                        </div>
                    </motion.div>

                    <div className="space-y-10">
                        {HELPLINES.slice(1).map((category, idx) => (
                            <motion.div
                                key={category.category}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx + 0.3 }}
                                className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden"
                            >
                                <div className={`bg-gradient-to-r ${category.color} px-8 py-6 flex items-center justify-between`}>
                                    <h2 className="font-black text-white text-xl tracking-tight uppercase">{category.category}</h2>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-50 p-4">
                                    {category.lines.map((line) => (
                                        <div key={line.name} className="flex flex-col sm:flex-row items-center justify-between px-6 py-8 hover:bg-slate-50/50 transition-all rounded-3xl group/row">
                                            <div className="mb-6 sm:mb-0 text-center sm:text-left">
                                                <p className="font-black text-slate-800 text-lg mb-1 group-hover/row:text-sky-600 transition-colors">{line.name}</p>
                                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5" /> {line.available}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${line.number.replace(/-/g, '')}`}
                                                className={`flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-sky-600 transition-all shadow-xl hover:shadow-sky-100 hover:-translate-y-1 active:scale-95`}
                                            >
                                                <Phone className="w-5 h-5 group-hover/row:animate-bounce" /> {line.number}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chat Alternative Section */}
                    <div className="mt-24 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-[48px] blur-3xl opacity-10" />
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[48px] p-10 md:p-16 text-center border border-slate-700/50 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -ml-40 -mt-40" />
                            <MessageCircle className="w-16 h-16 text-sky-400 mx-auto mb-8 animate-bounce" />
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Not in crisis but <span className="text-sky-400">need to talk</span>?</h3>
                            <p className="text-slate-400 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                                Our anonymous AI companion is available 24/7 to listen, provide focus, and help you process your thoughts in a safe, judgment-free space.
                            </p>
                            <button 
                                onClick={() => navigate('/bot/public')} 
                                className="px-12 py-6 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-sky-50 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                            >
                                Chat Anonymously Now <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="py-20 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-200">
                        <img src="/logo.png" alt="Mindora" className="w-6 h-6 grayscale opacity-50" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Mindora Mental Wellness Platform</p>
                    <div className="flex items-center justify-center gap-8 mb-8">
                        <button onClick={() => navigate('/terms')} className="text-slate-500 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-colors">Terms</button>
                        <button onClick={() => navigate('/privacy')} className="text-slate-500 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-colors">Privacy</button>
                        <button onClick={() => navigate('/contact')} className="text-slate-500 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-colors">Support</button>
                    </div>
                    <p className="text-slate-400 text-xs font-medium">© 2026 Mindora. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};