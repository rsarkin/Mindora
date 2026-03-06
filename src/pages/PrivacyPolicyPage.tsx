import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, Bell, Trash2, Heart } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full inline-block" />
            {title}
        </h2>
        <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
);

export const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
            {/* Header */}
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
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold mb-6">
                            <Shield className="w-3.5 h-3.5" /> Legal Document
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Your privacy is the foundation of everything we build. Last updated: <strong>March 2026</strong></p>
                    </div>

                    {/* Highlight cards */}
                    <div className="grid sm:grid-cols-3 gap-5 mb-12">
                        {[
                            { icon: Lock, title: 'End-to-End Encrypted', desc: 'All conversations are encrypted in transit and at rest.' },
                            { icon: Eye, title: 'No Selling of Data', desc: 'We never sell, rent, or trade your personal data to third parties.' },
                            { icon: Database, title: 'Minimal Data Storage', desc: 'We collect only what is strictly necessary for the service.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-3">
                                    <Icon className="w-5 h-5 text-sky-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
                        <Section title="Information We Collect">
                            <p>When you use Mindora, we may collect the following types of information:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li><strong>Account information:</strong> email address, name, and password (hashed).</li>
                                <li><strong>Session data:</strong> conversation history with our AI, appointment records, and mood tracking entries.</li>
                                <li><strong>Device information:</strong> browser type, IP address, and operating system for security purposes.</li>
                                <li><strong>Anonymous users:</strong> If you use the anonymous chat, we collect only the conversation content — no identifying information.</li>
                            </ul>
                        </Section>

                        <Section title="How We Use Your Information">
                            <p>We use your information solely to:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Provide, maintain, and improve our mental health services.</li>
                                <li>Match you with appropriate licensed therapists.</li>
                                <li>Send important service notifications (never marketing without consent).</li>
                                <li>Detect and prevent security threats and abuse.</li>
                                <li>Fulfill legal obligations under applicable mental health regulations.</li>
                            </ul>
                        </Section>

                        <Section title="HIPAA Compliance">
                            <p>Mindora is designed to comply with the Health Insurance Portability and Accountability Act (HIPAA). All protected health information (PHI) is handled with the highest level of care, including:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Encryption of all data in transit (TLS 1.3) and at rest (AES-256).</li>
                                <li>Strict access controls — only authorized personnel can access PHI.</li>
                                <li>Regular security audits and penetration testing.</li>
                                <li>Business Associate Agreements (BAAs) with all third-party vendors who may access PHI.</li>
                            </ul>
                        </Section>

                        <Section title="Data Sharing">
                            <p>We do not sell your data. We share your information only in these limited circumstances:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li><strong>With your therapist:</strong> Only the information you explicitly share in sessions.</li>
                                <li><strong>Legal requirements:</strong> If required by law, court order, or to prevent imminent harm.</li>
                                <li><strong>Service providers:</strong> Trusted vendors who process data on our behalf under strict agreements (e.g., cloud hosting, payment processor).</li>
                            </ul>
                        </Section>

                        <Section title="Your Rights">
                            <p>You have the following rights regarding your personal data:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
                                <li><strong>Correction:</strong> Update inaccurate or incomplete information.</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and all associated data.</li>
                                <li><strong>Portability:</strong> Export your data in a machine-readable format.</li>
                                <li><strong>Objection:</strong> Opt out of certain types of data processing.</li>
                            </ul>
                            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@mindora.app" className="text-sky-600 hover:underline">privacy@mindora.app</a></p>
                        </Section>

                        <Section title="Data Retention">
                            <p>We retain your data for as long as your account is active or as needed to provide services. If you delete your account, we will delete your data within 30 days, except where retention is required by law.</p>
                        </Section>

                        <Section title="Cookies">
                            <p>We use only essential cookies required for authentication and security. We do not use tracking or advertising cookies. You can manage cookie preferences in your browser settings.</p>
                        </Section>

                        <Section title="Contact">
                            <p>For privacy-related questions or concerns, please contact our Data Protection Officer:</p>
                            <div className="mt-3 bg-sky-50 rounded-xl p-4 text-sm">
                                <p className="font-semibold text-slate-800">Mindora Data Protection Officer</p>
                                <p className="text-slate-600 mt-1">Email: <a href="mailto:privacy@mindora.app" className="text-sky-600 hover:underline">privacy@mindora.app</a></p>
                            </div>
                        </Section>
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