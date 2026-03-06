import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTherapistStore } from '../store/useTherapistStore';
import api from '../services/api';
import {
    Home, Users, Calendar, Clock, User as UserIcon, DollarSign, Settings, LogOut, MessageSquare, Menu, X, Search, Bell, ChevronDown, Heart, TrendingUp
} from 'lucide-react';

export const TherapistLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, fetchProfile } = useTherapistStore();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        fetchProfile(api);
    }, [fetchProfile]);

    useEffect(() => {
        if (profile && !profile.profileComplete && !location.pathname.includes('/profile')) {
            navigate('/therapist/profile', { replace: true });
        }
    }, [profile, location.pathname, navigate]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/therapist/dashboard', icon: Home },
        { name: 'My Patients', href: '/therapist/patients', icon: Users },
        { name: 'Appointments', href: '/therapist/appointments', icon: Calendar },
        { name: 'Availability', href: '/therapist/slots', icon: Clock },
        { name: 'Messages', href: '/therapist/messages', icon: MessageSquare },
        { name: 'Community', href: '/therapist/community', icon: Users },
        { name: 'Earnings', href: '/therapist/earnings', icon: DollarSign },
        { name: 'Profile', href: '/therapist/profile', icon: UserIcon },
        { name: 'Settings', href: '/therapist/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderSidebarContent = () => (
        <>
            <div className="h-20 flex items-center px-6 shrink-0 pt-4 pb-2 border-b border-slate-100/50">
                <div className="flex items-center gap-3 w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/therapist/dashboard')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg flex items-center justify-center transform transition-transform hover:scale-105">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-heading font-bold text-xl tracking-tight text-slate-800 block leading-none">Mindora</span>
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">For Therapists</span>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 overflow-y-auto flex-1 scrollbar-hide">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</p>
                <nav className="space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href) || (item.href === '/therapist/dashboard' && location.pathname === '/therapist/dashboard');
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full group flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'text-white bg-primary-600 shadow-md shadow-primary-500/20'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'
                                    }`} />
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 mt-auto border-t border-slate-100/50">
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                    {profile && !profile.profileComplete && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">INC</div>
                    )}
                    <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate('/therapist/profile')}>
                        <div className="relative">
                            <img
                                src={profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Therapist'}&background=eff6ff&color=3b82f6`}
                                alt="Therapist"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-xs text-primary-600 font-medium truncate capitalize">Therapist</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <LogOut className="w-4 h-4" /> Sign out
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex bg-slate-50/50 min-h-screen font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200/60 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed inset-y-0">
                {renderSidebarContent()}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 shadow-2xl lg:hidden"
                        >
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {renderSidebarContent()}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-72 transition-all">
                {/* Topbar */}
                <header
                    className={`h-20 shrink-0 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 z-10 sticky top-0
                    ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm' : 'bg-transparent'}`}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3" />
                            <input
                                type="text"
                                placeholder="Search patients or appointments..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm w-80 transition-all font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2.5 text-slate-400 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                            >
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                <h3 className="font-bold text-slate-900">Patient Alerts</h3>
                                                <button className="text-xs font-semibold text-primary-600 hover:text-primary-800">Mark all read</button>
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto scrollbar-hide p-2 flex flex-col gap-1">
                                                <div className="p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                                            <TrendingUp className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800 line-clamp-2">Patient Alex Smith logged a Crisis Mood.</p>
                                                            <p className="text-xs text-slate-400 mt-1">Just now</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800 line-clamp-2">New appointment request from Emily D.</p>
                                                            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 border-t border-slate-100 text-center">
                                                <button className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">View all alerts</button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                            >
                                <img
                                    src={profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Therapist'}&background=eff6ff&color=3b82f6`}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
                            </button>

                            <AnimatePresence>
                                {isProfileDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                                                <p className="text-xs text-slate-500">{user?.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/therapist/profile'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors">
                                                    <UserIcon className="w-4 h-4" /> My Profile
                                                </button>
                                                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/therapist/settings'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors">
                                                    <Settings className="w-4 h-4" /> Settings
                                                </button>
                                            </div>
                                            <div className="p-2 border-t border-slate-100">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" /> Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-visible p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
