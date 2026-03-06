import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, Mail, Loader2 } from 'lucide-react';

interface LoginPageProps {
    role?: 'patient' | 'therapist' | 'admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({ role }) => {
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 capitalize">
                        Welcome Back {role ? `- ${role}` : ''}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to access your mental health dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-t-md relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
                                className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="min-h-[24px]">
                        {error && (
                            <p className="text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
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
                                'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <span className="text-slate-600">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
