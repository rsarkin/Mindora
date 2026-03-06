import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, FileText, CheckCircle, AlertCircle, Heart } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full inline-block" />
            {title}
        </h2>
        <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
);

export const TermsOfServicePage: React.FC = () => {
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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
                            <Scale className="w-3.5 h-3.5" /> Agreement
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Please read these terms carefully before using our platform. Last updated: <strong>March 2026</strong></p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
                        <Section title="Acceptance of Terms">
                            <p>By accessing or using Mindora, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform.</p>
                        </Section>

                        <Section title="Medical Disclaimer">
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
                                <p className="text-amber-800 font-bold flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5" /> IMPORTANT NOTICE
                                </p>
                                <p className="text-amber-700 text-sm leading-relaxed">
                                    Mindora is NOT a replacement for emergency medical services. If you are experiencing a life-threatening emergency or are at risk of harming yourself or others, please call emergency services (112 in India) or visit the nearest emergency room immediately.
                                </p>
                            </div>
                            <p>Mindora provides AI-assisted support and connects users with licensed therapists. Our AI tool is designed for emotional support and wellness guidance, not for medical diagnosis or psychiatric treatment.</p>
                        </Section>

                        <Section title="Eligibility">
                            <p>You must be at least 18 years old to use Mindora independently. Users between 13 and 17 years old may use the platform only with parental or legal guardian consent. Mindora is not intended for children under 13.</p>
                        </Section>

                        <Section title="User Accounts">
                            <p>When you create an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                            <p>We reserve the right to suspend or terminate accounts that provide false information or violate these terms.</p>
                        </Section>

                        <Section title="Prohibited Conduct">
                            <p>You agree not to:</p>
                            <ul className="list-decimal list-inside space-y-1 mt-2">
                                <li>Use the platform for any illegal purpose.</li>
                                <li>Harass, abuse, or threaten therapists or other users.</li>
                                <li>Attempt to gain unauthorized access to our systems.</li>
                                <li>Upload malicious code or interfere with the platform's security.</li>
                                <li>Use AI-generated responses to spread misinformation.</li>
                            </ul>
                        </Section>

                        <Section title="Therapist Services">
                            <p>Mindora facilitates connections between users and independent licensed therapists. While we verify the credentials of therapists on our platform, the professional relationship is strictly between you and the therapist.</p>
                            <p>Mindora is not liable for the advice or treatment provided by therapists.</p>
                        </Section>

                        <Section title="Payments and Refunds">
                            <p>Payments for therapist sessions are handled through our secure payment processor (Razorpay). Refund policies vary by therapist and session type. Generally, cancellations made less than 24 hours before a session may be subject to a fee.</p>
                        </Section>

                        <Section title="Intellectual Property">
                            <p>All content on Mindora, including text, graphics, logos, and software, is the property of Mindora or its licensors and is protected by intellectual property laws.</p>
                        </Section>

                        <Section title="Limitation of Liability">
                            <p>To the maximum extent permitted by law, Mindora shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</p>
                        </Section>

                        <Section title="Changes to Terms">
                            <p>We may update these terms from time to time. We will notify you of any significant changes by posting the new terms on this page and updating the "Last updated" date.</p>
                        </Section>

                        <Section title="Contact Us">
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@mindora.app" className="text-sky-600 hover:underline">legal@mindora.app</a></p>
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
