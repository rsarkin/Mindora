import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Mail, MessageCircle, MapPin, Send, CheckCircle, Phone } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50/40 -z-10" />
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />
            <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-3xl -z-10" />

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

            <main className="max-w-6xl mx-auto px-6 py-16 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    {/* Hero */}
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-50 border border-sky-100/50 text-sky-600 text-xs font-black uppercase tracking-widest mb-6 shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4" /> Get in Touch
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">Contact <span className="text-sky-600">Us</span></h1>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Have a question, feedback, or just want to say hello? We'd love to hear from you. Our team is here to support you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-12 items-start">
                        {/* Left: Contact info */}
                        <div className="lg:col-span-2 space-y-6">
                            {[
                                {
                                    icon: Mail,
                                    label: 'General Enquiries',
                                    value: 'hello@mindora.app',
                                    gradient: 'from-sky-400 to-blue-500',
                                },
                                {
                                    icon: Mail,
                                    label: 'Support',
                                    value: 'support@mindora.app',
                                    gradient: 'from-blue-400 to-indigo-500',
                                },
                                {
                                    icon: Mail,
                                    label: 'Privacy & Legal',
                                    value: 'legal@mindora.app',
                                    gradient: 'from-indigo-400 to-violet-500',
                                },
                                {
                                    icon: MapPin,
                                    label: 'Built with ❤️ at',
                                    value: 'Mindora HQ, India',
                                    gradient: 'from-cyan-400 to-sky-500',
                                },
                            ].map(({ icon: Icon, label, value, gradient }) => (
                                <motion.div 
                                    whileHover={{ x: 8 }}
                                    key={label} 
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-slate-200/50 p-6 flex items-center gap-5 transition-all"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-blue-100 shrink-0`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{label}</p>
                                        <p className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{value}</p>
                                    </div>
                                </motion.div>
                            ))}

                            <div className="relative group overflow-hidden mt-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-600 group-hover:scale-105 transition-transform duration-500" />
                                <div className="relative p-8 text-white">
                                    <Heart className="w-10 h-10 text-white/50 mb-6" />
                                    <h3 className="font-black text-2xl mb-2 tracking-tight">Need immediate help?</h3>
                                    <p className="text-sky-100 font-medium mb-8 leading-relaxed">If you're in a mental health crisis, please reach out to Tele-MANAS immediately.</p>
                                    <a href="tel:14416" className="inline-flex items-center gap-3 bg-white text-blue-600 font-black px-8 py-4 rounded-2xl shadow-2xl hover:bg-sky-50 transition-all active:scale-95">
                                        Call 14416 <Phone className="w-4 h-4 animate-pulse" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="lg:col-span-3">
                            <motion.div 
                                className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white shadow-2xl shadow-sky-100/50 p-8 md:p-12 relative overflow-hidden"
                                layout
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                
                                {submitted ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-4">
                                        <div className="w-24 h-24 bg-sky-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                            <CheckCircle className="w-12 h-12 text-sky-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Message Received!</h3>
                                        <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed max-w-sm mx-auto">Thanks for reaching out. A human from our team will get back to you within 24 hours.</p>
                                        <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all shadow-xl active:scale-95">
                                            Send Another Message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Send a Message</h2>
                                            <p className="text-slate-400 font-medium tracking-tight">We usually respond in less than a day.</p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Your Name</label>
                                                <input
                                                    required
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder="Jane Doe"
                                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    placeholder="jane@example.com"
                                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Topic</label>
                                            <select
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Choose an option...</option>
                                                <option value="general">General Enquiry</option>
                                                <option value="support">Technical Support</option>
                                                <option value="therapist">Join as Therapist</option>
                                                <option value="billing">Billing & Payments</option>
                                                <option value="privacy">Privacy / Security</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                placeholder="Tell us what's on your mind..."
                                                className="w-full px-6 py-4 rounded-[24px] border border-slate-100 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all shadow-sm resize-none leading-relaxed"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            <Send className="w-6 h-6" /> Send Message
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="py-20 text-center relative z-10">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-sm">
                        <img src="/logo.png" alt="Mindora" className="w-6 h-6 grayscale opacity-30" />
                    </div>
                    <div className="flex items-center justify-center gap-8 mb-10">
                        {['Terms', 'Privacy', 'Helplines', 'Careers'].map(link => (
                            <button key={link} onClick={() => navigate(`/${link.toLowerCase()}`)} className="text-slate-400 hover:text-sky-600 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors">{link}</button>
                        ))}
                    </div>
                    <p className="text-slate-300 text-xs font-medium">© 2026 Mindora Mental Health Platform. Crafted with Care.</p>
                </div>
            </footer>
        </div>
    );
};