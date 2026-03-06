import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, AlertCircle } from 'lucide-react';

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

export const TermsOfServicePage: React.FC = () => {
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
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 border border-slate-100/50 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Scale className="w-3.5 h-3.5" /> Legal Agreement
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">Terms Of <span className="text-sky-600">Service</span></h1>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Please read these terms carefully before using our platform. Last updated: <strong className="text-slate-800 font-black">March 2026</strong>
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-white shadow-2xl shadow-slate-200/50 p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -mr-48 -mt-48" />

                        <Section title="Acceptance of Terms">
                            <p>By accessing or using Mindora, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform.</p>
                        </Section>

                        <Section title="Medical Disclaimer">
                            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                <p className="text-amber-600 font-black flex items-center gap-3 mb-3 text-lg tracking-tight uppercase">
                                    <AlertCircle className="w-6 h-6" /> Important Notice
                                </p>
                                <p className="text-amber-800 font-bold leading-relaxed relative z-10">
                                    Mindora is NOT a replacement for emergency medical services. If you are experiencing a life-threatening emergency or are at risk of harming yourself or others, please call emergency services (112 in India) immediately.
                                </p>
                            </div>
                            <p>Mindora provides AI-assisted support and connects users with licensed therapists. Our AI tool is designed for emotional support and wellness guidance, not for medical diagnosis.</p>
                        </Section>

                        <Section title="Eligibility">
                            <p>You must be at least 18 years old to use Mindora independently. Users between 13 and 17 years old may use the platform only with parental or legal guardian consent. Mindora is not intended for children under 13.</p>
                        </Section>

                        <Section title="User Accounts">
                            <p>When you create an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
                            <p>We reserve the right to suspend or terminate accounts that provide false information or violate these terms.</p>
                        </Section>

                        <Section title="Prohibited Conduct">
                            <p>You agree not to:</p>
                            <ul className="grid sm:grid-cols-1 gap-4 mt-4">
                                {[
                                    'Use the platform for any illegal purpose.',
                                    'Harass, abuse, or threaten therapists or other users.',
                                    'Attempt to gain unauthorized access to our systems.',
                                    'Upload malicious code or interfere with security.',
                                    'Use AI responses to spread misinformation.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-sky-50 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                        </div>
                                        <span className="font-bold text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>

                        <Section title="Therapist Services">
                            <p>Mindora facilitates connections between users and independent licensed therapists. While we verify credentials, the professional relationship is strictly between you and the therapist.</p>
                            <p>Mindora is not liable for the advice or treatment provided by therapists.</p>
                        </Section>

                        <Section title="Payments and Refunds">
                            <p>Payments for therapist sessions are handled through our secure payment processor (Razorpay). Refund policies vary by therapist and session type. Cancellations made less than 24 hours before a session may be subject to a fee.</p>
                        </Section>

                        <Section title="Intellectual Property">
                            <p>All content on Mindora, including text, graphics, logos, and software, is the property of Mindora or its licensors and is protected by intellectual property laws.</p>
                        </Section>

                        <Section title="Limitation of Liability">
                            <p>To the maximum extent permitted by law, Mindora shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the platform.</p>
                        </Section>

                        <Section title="Changes to Terms">
                            <p>We may update these terms from time to time. We will notify you of any significant changes by posting the new terms on this page and updating the "Last updated" date.</p>
                        </Section>

                        <Section title="Contact Us">
                            <div className="bg-sky-50 border border-sky-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-black text-slate-800 mb-1">Have legal questions?</h3>
                                    <p className="text-slate-500 font-medium">Our legal team is here to help clarify our terms.</p>
                                </div>
                                <a href="mailto:legal@mindora.app" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all shadow-xl active:scale-95 whitespace-nowrap">
                                    Email Legal Team
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
