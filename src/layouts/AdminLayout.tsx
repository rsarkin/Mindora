/* eslint-disable react-hooks/static-components, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, LayoutDashboard, Users, UserCog, Settings, LogOut,
    Menu, X, Search, Bell, ChevronDown, User, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Patient Directory', path: '/admin/patients', icon: Users },
        { name: 'Therapists Directory', path: '/admin/therapists', icon: UserCog },
        { name: 'Global Settings', path: '/admin/settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <>
            <div className="h-24 flex items-center px-8 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none opacity-50"></div>
                <div className="flex items-center gap-3 w-full relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 shadow-xl shadow-slate-900/10 flex items-center justify-center transform transition-transform hover:scale-105">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-heading font-black text-2xl tracking-tight text-slate-900">
                        Admin<span className="text-primary-600">OS</span>
                    </span>
                </div>
            </div>

            <div className="px-6 py-4 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">System Controls</p>
                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center px-4 py-3.5 text-[15px] font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'text-primary-700 bg-primary-50 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1.5 h-full bg-primary-600 rounded-r-full"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'
                                    }`} />
                                <span className="relative z-10 truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-6 shrink-0 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/admin/profile')}>
                    <div className="relative">
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=3b82f6&color=fff&size=48`} alt="Admin" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-50 bg-emerald-500"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors">{user?.name || 'Administrator'}</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate flex items-center gap-1 mt-0.5"><ShieldCheck className="w-3 h-3 text-primary-500" /> Super Admin</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 lg:w-80 flex-col bg-white border-r border-slate-200 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
                <SidebarContent />
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
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-80 bg-white flex flex-col z-50 shadow-2xl lg:hidden"
                        >
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Decorative background glow for main area */}
                <div className="fixed top-0 left-1/2 w-[800px] h-[400px] bg-primary-100/50 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>

                {/* Topbar */}
                <header
                    className={`h-24 shrink-0 flex items-center justify-between px-6 sm:px-10 transition-all duration-300 z-10 sticky top-0
                    ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' : 'bg-transparent'}`}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden sm:flex items-center relative group">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search users, IDs, settings..."
                                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm w-72 lg:w-96 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                            <div className="absolute right-3 flex items-center gap-1">
                                <span className="border border-slate-200 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm bg-slate-50">⌘</span>
                                <span className="border border-slate-200 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm bg-slate-50">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                        <button className="relative p-2.5 text-slate-400 hover:text-primary-600 transition-all rounded-xl hover:bg-white shadow-sm hover:shadow border border-transparent hover:border-slate-200">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#f8fafc]"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-200 hover:shadow-sm group"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=3b82f6&color=fff&size=40`}
                                    alt="Admin"
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                />
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors mr-1" />
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
                                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 24 }}
                                            className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-5 border-b border-slate-100 bg-slate-50/80 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
                                                <p className="text-[15px] font-black text-slate-900 relative z-10">{user?.name || 'System Administrator'}</p>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5 relative z-10">{user?.email || 'admin@mch-platform.com'}</p>
                                            </div>
                                            <div className="p-3 space-y-1">
                                                <Link to="/admin/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors">
                                                    <User className="w-4 h-4" /> Identity Profile
                                                </Link>
                                                <Link to="/admin/settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors">
                                                    <Settings className="w-4 h-4" /> Master Settings
                                                </Link>
                                            </div>
                                            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-bold text-rose-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                >
                                                    <LogOut className="w-4 h-4" /> End Session
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 z-10 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
