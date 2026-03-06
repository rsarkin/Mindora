import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply delay-700 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply delay-1000 animate-pulse"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
                className="text-center relative z-10 w-full max-w-xl bg-white/60 backdrop-blur-3xl border border-slate-200/50 p-10 sm:p-16 rounded-[3rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)]"
            >
                <div className="mb-10 flex justify-center">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
                        <h1 className="text-[8rem] leading-none font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 drop-shadow-sm select-none relative z-10">
                            404
                        </h1>
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-6 -right-8"
                        >
                            <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 transform rotate-12">
                                <Ghost className="w-8 h-8 text-indigo-500" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 mb-4 tracking-tight">
                    Page not found
                </h2>

                <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed px-4">
                    The requested URL was not found on this server. Please check the address and try again, or navigate back to safety.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-slate-600 transition-all" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Return Home
                    </button>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-center w-full">
                <p className="text-sm font-bold text-slate-400">© 2026 Mindful Care Health. All rights reserved.</p>
            </div>
        </div>
    );
};
