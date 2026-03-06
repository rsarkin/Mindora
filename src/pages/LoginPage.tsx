import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
    role?: 'patient' | 'therapist' | 'admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({ role = 'patient' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, response.data.user);
            if (response.data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (response.data.user.role === 'therapist') {
                navigate('/therapist/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (status === 403) {
                setError('Your account is pending admin verification.');
            } else if (status === 404) {
                setError('No account found with this email.');
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Failed to login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Background Decorative Elements (from LandingPage) */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white -z-10" />
            <div
                className="absolute inset-0 -z-10 opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />
            <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-sky-200/60 to-blue-100/40 rounded-full blur-3xl -z-10" />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/50 to-sky-100/30 rounded-full blur-3xl -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full p-8 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-sky-100/50 border border-white/50 relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-white to-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-100/50 group transition-transform border border-sky-100 p-2"
                    >
                        <img src="/logo.png" alt="Mindora Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
                        Welcome Back
                    </h2>
                    <p className="mt-3 text-slate-500 font-medium">
                        Access your {role} dashboard
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all disabled:opacity-70 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                        <div className="text-sm text-center">
                            <span className="text-slate-500 font-medium">Don't have an account? </span>
                            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
                                Sign up
                            </Link>
                        </div>

                        {role === 'patient' && (
                            <Link
                                to="/login/therapist"
                                className="text-sm text-center font-bold text-slate-400 hover:text-sky-500 transition-colors"
                            >
                                Are you a therapist? Login here
                            </Link>
                        )}
                        {role === 'therapist' && (
                            <Link
                                to="/login/patient"
                                className="text-sm text-center font-bold text-slate-400 hover:text-sky-500 transition-colors"
                            >
                                Are you a patient? Login here
                            </Link>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
