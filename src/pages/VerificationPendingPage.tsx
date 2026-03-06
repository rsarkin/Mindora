import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationPendingPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-primary-600 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold mb-2">Verification in Progress</h1>
                    <p className="text-primary-100">Thank you for joining Mindora!</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6 text-slate-600 mb-8">
                        <p className="text-lg text-center font-medium text-slate-800">
                            Our administration team is currently reviewing your professional credentials.
                        </p>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary-600" />
                                What happens next?
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-bold">1</span>
                                    <span>We verify your medical license standing and identity documents.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-bold">2</span>
                                    <span>You will receive an email notification once your account is verified.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-bold">3</span>
                                    <span>This process usually takes 24-48 hours.</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-center">
                            If you have questions, please contact <a href="mailto:support@mindora.com" className="text-primary-600 hover:underline">support@mindora.com</a>
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Log Out for Now <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
