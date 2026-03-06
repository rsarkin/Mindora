import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { TherapistRegistrationForm } from '../components/auth/TherapistRegistrationForm';

interface RegisterPageProps {
    role?: 'patient' | 'therapist' | 'admin';
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ role: initialRole }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'patient' | 'therapist'>(initialRole === 'therapist' ? 'therapist' : 'patient');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = { name, email, password, role };
            const response = await api.post('/auth/register', payload);
            login(response.data.token, response.data.user);
            if (response.data.user.role === 'therapist') {
                navigate('/therapist/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.response?.data?.error
                || (typeof err.response?.data === 'string' ? err.response?.data : null)
                || err.message
                || 'Failed to register';
            console.error('Registration Error:', err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className={`w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl transition-all duration-300 ${role === 'therapist' ? 'max-w-2xl' : 'max-w-md'}`}>
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                        Create your Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join our mental health support platform
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-8">
                    <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'patient' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        I'm a Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('therapist')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'therapist' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        I'm a Therapist
                    </button>
                </div>

                {role === 'patient' && (
                    <form className="mt-8 space-y-6 animate-in slide-in-from-left-4 fade-in duration-300" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-t-md relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm border-t-0"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm border-t-0"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Sign up'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {role === 'therapist' && (
                    <div className="mt-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <TherapistRegistrationForm />
                    </div>
                )}

                <div className="text-sm text-center mt-6 pt-6 border-t border-slate-100">
                    <span className="text-slate-600">Already have an account? </span>
                    <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                        Sign in here
                    </Link>
                </div>

            </div>
        </div>
    );
};
