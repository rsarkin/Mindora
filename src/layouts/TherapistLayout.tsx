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
        navigate('/login/therapist');
    };

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full relative z-10">
            <div className="h-20 flex items-center px-8 shrink-0 border-b border-indigo-500/10">
                <div className="flex items-center gap-3 w-full cursor-pointer group" onClick={() => navigate('/therapist/dashboard')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-sky-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center transform transition-all group-hover:scale-110 group-hover:rotate-3">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-heading font-bold text-xl tracking-tight text-white block leading-none">Mindora</span>
                        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.2em] mt-1 block">Therapist Workspace</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 overflow-y-auto flex-1 scrollbar-hide">
                <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-[0.25em] mb-6 px-4">Workspace</p>
                <nav className="space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'text-white bg-white/10 shadow-xl shadow-indigo-900/20 ring-1 ring-white/20'
                                    : 'text-indigo-100/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-sky-500/5 -z-10"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-sky-300' : 'text-indigo-300/50 group-hover:text-sky-300'
                                    }`} />
                                <span>{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-6 mt-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {profile && !profile.profileComplete && (
                        <div className="absolute top-3 right-3 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-5 cursor-pointer" onClick={() => navigate('/therapist/profile')}>
                        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400">
                            <img
                                src={profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Therapist'}&background=1e1b4b&color=818cf8`}
                                alt="Therapist"
                                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-950 shadow-sm"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-sky-300 font-bold uppercase tracking-wider truncate">Pro Member</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-indigo-100 hover:bg-white hover:text-indigo-900 transition-all shadow-lg"
                    >
                        <LogOut className="w-4 h-4" /> Sign out
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex bg-[#f8fafc] min-h-screen font-sans overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] -ml-64 -mb-64" />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-indigo-950 z-30 fixed inset-y-0 overflow-hidden shadow-2xl">
                {/* Sidebar Background Elements */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                
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
                            className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                            className="fixed inset-y-0 left-0 w-80 bg-indigo-950 flex flex-col z-[70] shadow-2xl lg:hidden overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {renderSidebarContent()}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 relative">
                {/* Topbar */}
                <header
                    className={`h-20 shrink-0 flex items-center justify-between px-6 sm:px-10 transition-all duration-300 z-40 sticky top-0
                    ${isScrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-xl shadow-indigo-900/5' : 'bg-transparent'}`}
                >
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden md:flex items-center relative group">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search workspace..."
                                className="pl-11 pr-5 py-2.5 bg-white/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white shadow-sm w-72 lg:w-96 transition-all font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-3 transition-all rounded-2xl border ${
                                    isNotificationsOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 shadow-sm'
                                }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-indigo-50 animate-pulse"></span>
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-[360px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Notifications</h3>
                                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">2 New Updates</p>
                                                </div>
                                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-indigo-100 transition-all">Mark all read</button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto scrollbar-hide p-3 flex flex-col gap-2">
                                                <div className="p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer border border-indigo-100/50">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                                                            <TrendingUp className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 leading-tight">Emergency Protocol</p>
                                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">Patient Alex Smith logged a Crisis Mood. Intervention recommended.</p>
                                                            <p className="text-[10px] text-red-500 font-bold mt-2 uppercase">Critical · Just now</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-sm">
                                                            <Calendar className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 leading-tight">Booking Request</p>
                                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">Emily D. has requested a session for tomorrow at 10:00 AM.</p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Standard · 2h ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
                                                <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Clear all notifications</button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className={`flex items-center gap-3 p-1 rounded-2xl transition-all border ${
                                    isProfileDropdownOpen ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50 shadow-sm'
                                }`}
                            >
                                <div className="p-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400">
                                    <img
                                        src={profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Therapist'}&background=1e1b4b&color=818cf8`}
                                        alt="User"
                                        className="w-9 h-9 rounded-[10px] object-cover border border-white"
                                    />
                                </div>
                                <div className="hidden sm:block text-left mr-2">
                                    <p className="text-[11px] font-black text-slate-800 leading-none">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Online</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block mr-2 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
                                                <p className="text-xs text-slate-500 mt-2">{user?.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/therapist/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"><UserIcon className="w-4 h-4" /></div>
                                                    My Profile
                                                </button>
                                                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/therapist/settings'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"><Settings className="w-4 h-4" /></div>
                                                    Settings
                                                </button>
                                            </div>
                                            <div className="p-2 border-t border-slate-100 bg-slate-50/30">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-red-100/50 flex items-center justify-center text-red-600"><LogOut className="w-4 h-4" /></div>
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-visible p-6 sm:p-10 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
