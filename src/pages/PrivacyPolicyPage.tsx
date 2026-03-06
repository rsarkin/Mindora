import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 group transition-all duration-500"
    >
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-4 group-hover:translate-x-2 transition-transform">
            <span className="w-1.5 h-8 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full inline-block shadow-lg shadow-sky-100" />
            {title}
        </h2>
        <div className="text-slate-500 font-medium leading-[1.8] space-y-4 pl-5 border-l-2 border-slate-50 group-hover:border-sky-100 transition-colors">
            {children}
        </div>
    </motion.div>
);

export const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
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
                    {/* Hero */}
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 border border-red-100/50 text-red-600 text-xs font-black uppercase tracking-widest mb-6 shadow-sm"
                        >
                            <Shield className="w-3.5 h-3.5" /> Privacy First
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">Privacy <span className="text-sky-600">Policy</span></h1>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Your privacy is the foundation of everything we build. Last updated: <strong className="text-slate-800 font-black">March 2026</strong>
                        </p>
                    </div>

                    {/* Highlight cards */}
                    <div className="grid sm:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Lock, title: 'End-to-End Encrypted', desc: 'All conversations are encrypted in transit and at rest.' },
                            { icon: Eye, title: 'No Selling of Data', desc: 'We never sell, rent, or trade your personal data.' },
                            { icon: Database, title: 'Minimal Storage', desc: 'We collect only what is strictly necessary.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <motion.div 
                                whileHover={{ y: -5 }}
                                key={title} 
                                className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-xl shadow-slate-200/50"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-6 shadow-inner">
                                    <Icon className="w-6 h-6 text-sky-600" />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-2 tracking-tight">{title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-white shadow-2xl shadow-slate-200/50 p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -mr-48 -mt-48" />

                        <Section title="Information We Collect">
                            <p>When you use Mindora, we may collect the following types of information:</p>
                            <ul className="grid gap-4 mt-6">
                                {[
                                    { label: 'Account Information', desc: 'Email address, name, and hashed password.' },
                                    { label: 'Session Data', desc: 'Conversation history, appointment records, and mood tracker entries.' },
                                    { label: 'Device Information', desc: 'Browser type, IP address, and OS for security purposes.' },
                                    { label: 'Anonymous Users', desc: 'Only conversation content — no identifying information is stored.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                        <div className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0" />
                                        <div>
                                            <span className="font-black text-slate-800 block mb-0.5">{item.label}</span>
                                            <span className="text-slate-500">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Section>

                        <Section title="How We Use Your Information">
                            <p>We use your information solely to:</p>
                            <ul className="list-disc list-inside space-y-2 mt-4 marker:text-sky-500">
                                <li>Provide, maintain, and improve our mental health services.</li>
                                <li>Match you with appropriate licensed therapists.</li>
                                <li>Send service notifications (never marketing without consent).</li>
                                <li>Detect and prevent security threats and abuse.</li>
                                <li>Fulfill legal obligations under mental health regulations.</li>
                            </ul>
                        </Section>

                        <Section title="HIPAA Compliance">
                            <p>Mindora handles protected health information (PHI) with industry-leading security standards:</p>
                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                {[
                                    'TLS 1.3 & AES-256 Encryption',
                                    'Strict RBAC Access Controls',
                                    'Regular Penetration Testing',
                                    'BAAs with Cloud Vendors'
                                ].map((item, i) => (
                                    <div key={i} className="px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700 font-black text-sm flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Data Sharing">
                            <p>We do not sell your data. We share information only with your explicit consent or in critical situations:</p>
                            <ul className="space-y-4 mt-6">
                                <li className="p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors">
                                    <strong className="text-slate-800 block mb-1">With Your Therapist</strong>
                                    Only the info you explicitly discuss in sessions is shared with matched professionals.
                                </li>
                                <li className="p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors">
                                    <strong className="text-slate-800 block mb-1">Preventing Harm</strong>
                                    If required by law or to prevent imminent self-harm or harm to others.
                                </li>
                            </ul>
                        </Section>

                        <Section title="Your Rights">
                            <p>You have the right to access, correct, or request deletion of your information at any time. Simply reach out to us.</p>
                            <div className="mt-8 p-8 bg-slate-900 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <h3 className="font-black text-xl mb-1">Exercise your rights</h3>
                                    <p className="text-slate-400 font-medium">Contact our Data Protection Officer</p>
                                </div>
                                <a href="mailto:privacy@mindora.app" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black shadow-2xl hover:bg-sky-50 transition-all active:scale-95">
                                    Email DPO
                                </a>
                            </div>
                        </Section>
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
                    <p className="text-slate-300 text-xs font-medium">© 2026 Mindora Mental Wellness. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};