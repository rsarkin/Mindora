import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Mail, MessageCircle, MapPin, Send, CheckCircle } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would POST to the backend
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
            <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
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

            <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Hero */}
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold mb-6">
                            <MessageCircle className="w-3.5 h-3.5" /> Get in Touch
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Contact Us</h1>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Have a question, feedback, or just want to say hello? We'd love to hear from you.</p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-10">
                        {/* Left: Contact info */}
                        <div className="md:col-span-2 space-y-5">
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
                                    label: 'Built at',
                                    value: 'Hackathon 2026, India',
                                    gradient: 'from-cyan-400 to-sky-500',
                                },
                            ].map(({ icon: Icon, label, value, gradient }) => (
                                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
                                <Heart className="w-8 h-8 text-white/80 mb-3" />
                                <h3 className="font-bold text-lg mb-2">Mental health emergency?</h3>
                                <p className="text-sky-100 text-sm mb-4">Please call Tele-MANAS immediately — they're available 24/7.</p>
                                <a href="tel:14416" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-sky-50 transition-colors">
                                    Call 14416
                                </a>
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="md:col-span-3">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                {submitted ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <CheckCircle className="w-8 h-8 text-sky-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                        <p className="text-slate-500 mb-6">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                                        <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="text-sm text-sky-600 font-semibold hover:underline">
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Your Name</label>
                                                <input
                                                    required
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder="Jane Doe"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    placeholder="jane@example.com"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Subject</label>
                                            <select
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                                            >
                                                <option value="">Select a topic…</option>
                                                <option value="general">General Enquiry</option>
                                                <option value="support">Technical Support</option>
                                                <option value="therapist">Becoming a Therapist</option>
                                                <option value="billing">Billing Issue</option>
                                                <option value="privacy">Privacy / Data Request</option>
                                                <option value="press">Press / Media</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                placeholder="Tell us how we can help…"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:from-sky-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-4 h-4" /> Send Message
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <footer className="bg-slate-900 py-8 mt-16">
                <div className="max-w-5xl mx-auto px-5 text-center text-slate-500 text-sm">
                    © 2026 Mindora. <button onClick={() => navigate('/')} className="text-sky-400 hover:underline ml-1">Back to Homepage</button>
                </div>
            </footer>
        </div>
    );
};