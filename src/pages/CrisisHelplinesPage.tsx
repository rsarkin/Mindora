import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Heart, AlertTriangle, MessageCircle, Globe } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
            <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
                            <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800">Mindora</span>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-semibold mb-6">
                            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Resources
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Crisis Helplines</h1>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">India-specific mental health crisis lines. You are not alone — help is always available.</p>
                    </div>

                    {/* Emergency alert */}
                    <div className="bg-red-500 rounded-2xl p-6 mb-10 text-white text-center">
                        <p className="text-lg font-bold mb-1">⚡ In immediate danger?</p>
                        <p className="text-red-100 text-sm mb-4">Call emergency services right now</p>
                        <a href="tel:112" className="inline-flex items-center gap-2 bg-white text-red-600 font-extrabold text-xl px-8 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg">
                            <Phone className="w-6 h-6" /> 112
                        </a>
                    </div>

                    <div className="space-y-7">
                        {HELPLINES.map((category) => (
                            <motion.div
                                key={category.category}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-3xl border ${category.border} shadow-sm overflow-hidden`}
                            >
                                <div className={`bg-gradient-to-r ${category.color} px-6 py-4`}>
                                    <h2 className="font-bold text-white text-lg">{category.category}</h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {category.lines.map((line) => (
                                        <div key={line.name} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{line.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />{line.available}
                                                </p>
                                            </div>
                                            <a
                                                href={`tel:${line.number.replace(/-/g, '')}`}
                                                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm shadow-blue-200 whitespace-nowrap ml-4"
                                            >
                                                <Phone className="w-3.5 h-3.5" /> {line.number}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chat CTA */}
                    <div className="mt-12 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-3xl p-8 text-center">
                        <MessageCircle className="w-10 h-10 text-sky-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Not in crisis but need to talk?</h3>
                        <p className="text-slate-500 mb-5">Our anonymous AI companion is available 24/7 with no signup required.</p>
                        <button onClick={() => navigate('/bot/public')} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-sky-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200">
                            Chat Anonymously →
                        </button>
                    </div>
                </motion.div>
            </div>

            <footer className="bg-slate-900 py-8 mt-16">
                <div className="max-w-4xl mx-auto px-5 text-center text-slate-500 text-sm">
                    © 2026 Mindora. <button onClick={() => navigate('/')} className="text-sky-400 hover:underline ml-1">Back to Homepage</button>
                </div>
            </footer>
        </div>
    );
};