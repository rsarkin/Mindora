/* eslint-disable react-hooks/static-components */
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, MessageSquare, Calendar, TrendingUp, BookOpen, User as UserIcon, LogOut, Menu, X, Search, Bell, ChevronDown, Wind, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const PatientLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        // Fetch Notifications
        const fetchNotifs = async () => {
            try {
                const data = await api.getNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications");
            }
        };
        fetchNotifs();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await api.markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark notifications read");
        }
    };

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: Home },
        { name: 'Messages', path: '/messages', icon: MessageSquare },
        { name: 'Find Therapists', path: '/find-therapists', icon: Search },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Breathing Space', path: '/breathing', icon: Wind },
        { name: 'Community', path: '/community', icon: Users },
        { name: 'TARA AI', path: '/bot', icon: MessageSquare },
        { name: 'Resources', path: '/resources', icon: BookOpen },
    ];

    return (
        <div className="flex bg-slate-50/50 min-h-screen font-sans selection:bg-sky-100 selection:text-sky-900">
            {/* Background Gradients (consistent with LandingPage) */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/50 -z-10" />
            <div
                className="fixed inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                }}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 2 }} className="fixed top-0 right-0 w-[500px] h-[500px] bg-sky-200 rounded-full blur-[120px] -z-10 -mr-64 -mt-64" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2, delay: 0.5 }} className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px] -z-10 -ml-48 -mb-48" />
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed inset-y-0">
                <div className="h-20 flex items-center px-6 shrink-0 pt-4 pb-2 border-b border-slate-100/50">
                    <div className="flex items-center gap-3 w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-200/50 flex items-center justify-center p-1.5 transform transition-transform hover:scale-105 border border-white/20">
                            <img src="/logo.png" alt="Mindora" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="font-black text-2xl tracking-tight text-slate-800">
                            Mindora
                        </span>
                    </div>
                </div>

                <div className="px-4 py-6 overflow-y-auto flex-1 scrollbar-hide">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Workspace</p>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/dashboard');
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`w-full group flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                        ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-xl shadow-blue-200/50'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'
                                        }`} />
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive && (
                                        <motion.div layoutId="activeNav" className="absolute right-0 w-1 h-6 bg-white/30 rounded-l-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 mt-auto border-t border-slate-100/50">
                    <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => navigate('/dashboard/profile')}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-100 border-2 border-white transition-transform group-hover:scale-105">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{user?.name}</p>
                                <p className="text-[10px] text-sky-600 font-black uppercase tracking-widest truncate">{user?.role || 'Patient'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/';
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-500 hover:text-red-500 hover:border-red-50 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Sign out
                        </button>
                    </div>
                </div>
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
                            className="fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-2xl flex flex-col z-50 shadow-2xl lg:hidden"
                        >
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="h-20 flex items-center px-6 shrink-0 pt-4 pb-2 border-b border-slate-100/50">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg flex items-center justify-center p-1.5 border border-white/20">
                                        <img src="/logo.png" alt="Mindora" className="w-full h-full object-contain brightness-0 invert" />
                                    </div>
                                    <span className="font-black text-2xl tracking-tight text-slate-800">
                                        Mindora
                                    </span>
                                </div>
                            </div>

                            <div className="px-4 py-6 overflow-y-auto flex-1 scrollbar-hide">
                                <nav className="space-y-2">
                                    {navItems.map((item) => {
                                        const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/dashboard');
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`w-full group flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${isActive
                                                    ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-xl shadow-blue-200/50'
                                                    : 'text-slate-500'
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5 mr-3" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="p-4 border-t border-slate-100/50">
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/';
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl"
                                >
                                    <LogOut className="w-4 h-4" /> Sign out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-72 transition-all">
                {/* Topbar */}
                <header
                    className={`h-24 shrink-0 flex items-center justify-between px-6 sm:px-12 transition-all duration-500 z-40 sticky top-0
                    ${isScrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'bg-transparent'}`}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-3 rounded-2xl bg-white border border-slate-200/50 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/20 transition-all hover:scale-105"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {location.pathname === '/resources' && (
                            <div className="hidden sm:flex items-center relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3" />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm w-72 transition-all font-medium text-slate-700"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2.5 text-slate-400 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
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
                                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary-600 hover:text-primary-800">Mark all read</button>
                                                )}
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto scrollbar-hide p-2 flex flex-col gap-1">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-400">
                                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                        <p className="text-sm font-medium">No notifications yet.</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => {
                                                        const date = new Date(n.createdAt);
                                                        return (
                                                            <div key={n._id} className={`p-3 rounded-2xl transition-colors cursor-pointer border border-transparent ${n.isRead ? 'hover:bg-slate-50 hover:border-slate-100' : 'bg-primary-50/30 border-primary-100/50 hover:bg-primary-50/60'}`}>
                                                                <div className="flex gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'APPOINTMENT' ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                        {n.type === 'APPOINTMENT' ? <Calendar className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm line-clamp-2 ${n.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>{n.message}</p>
                                                                        <p className="text-xs text-slate-400 mt-1">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            <div className="p-3 border-t border-slate-100 text-center">
                                                <button className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">View all notifications</button>
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
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=eff6ff&color=3b82f6`}
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
                                            className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white z-50 overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                                <p className="text-sm font-black text-slate-900">{user?.name}</p>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5">{user?.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <button onClick={() => { setIsProfileDropdownOpen(false); navigate('/dashboard/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-2xl transition-all">
                                                    <UserIcon className="w-4 h-4" /> My Profile
                                                </button>
                                            </div>
                                            <div className="p-2 border-t border-slate-50">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        window.location.href = '/';
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
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

                <main className="flex-1 overflow-visible p-6 sm:p-12 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
