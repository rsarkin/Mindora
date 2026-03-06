import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
    HelpCircle, 
    Download, 
    DollarSign, 
    Clock, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp,
    ArrowUpRight,
    Wallet,
    ArrowDownLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const EarningsPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.getEarningsStats();
            setStats(data);
        } catch (err: any) {
            console.error("Failed to fetch earnings stats", err);
            // Fallback to mock data for demonstration if API fails or is empty
            setStats(getMockData());
        } finally {
            setIsLoading(false);
        }
    };

    const getMockData = () => ({
        metrics: {
            totalBalanceYTD: 142500,
            nextPayout: 12400,
            billableHours: 156,
            growth: 12.5
        },
        chartData: [
            { month: 'Jan', amount: 45000 },
            { month: 'Feb', amount: 52000 },
            { month: 'Mar', amount: 48000 },
            { month: 'Apr', amount: 61000 },
            { month: 'May', amount: 55000 },
            { month: 'Jun', amount: 142500 }
        ],
        transactions: [
            { id: '1', date: 'Oct 24, 2023', client: 'Emily Rodriguez', type: 'Video Therapy', duration: '60 min', amount: 2500, status: 'PAID' },
            { id: '2', date: 'Oct 23, 2023', client: 'Michael Chen', type: 'Crisis Support', duration: '45 min', amount: 3200, status: 'PAID' },
            { id: '3', date: 'Oct 22, 2023', client: 'Sarah Williams', type: 'Chat Therapy', duration: '30 min', amount: 1800, status: 'PAID' },
            { id: '4', date: 'Oct 21, 2023', client: 'David Miller', type: 'Video Therapy', duration: '60 min', amount: 2500, status: 'PAID' }
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl">
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-2">{label} Revenue</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                        <p className="font-black text-2xl tracking-tight">
                            {formatCurrency(payload[0].value)}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2.25rem] flex items-center justify-center mb-6 border border-rose-100 shadow-xl">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Vault Access Issue</h2>
                <p className="text-slate-500 font-medium mb-8 max-w-md">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:translate-y-1 hover:-translate-y-1"
                >
                    Retry Handshake
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Atmospheric Backgrounds */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] -ml-20 pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                className="max-w-7xl mx-auto space-y-12 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Sanctuary</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Managing your clinical revenue and practice growth insights.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-[1.5rem] hover:bg-slate-50 shadow-sm transition-all flex items-center gap-3 disabled:opacity-50"
                            disabled={isLoading || !stats?.transactions?.length}
                        >
                            <Download className="w-5 h-5 text-indigo-500" /> 
                            <span className="text-xs uppercase tracking-widest">Reports</span>
                        </button>
                        <button
                            className="px-8 py-4 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-indigo-600 shadow-xl transition-all active:translate-y-1 hover:-translate-y-1 flex items-center gap-3"
                        >
                            <Wallet className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest">Payout Settings</span>
                        </button>
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Main Balance Card */}
                    <div className="md:col-span-8 group relative bg-slate-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-sky-500/10 rounded-full blur-[80px] -ml-30 -mb-30 pointer-events-none" />
                        
                        <div className="relative z-10 bg-slate-800/50 rounded-[2.75rem] p-10 md:p-12 border border-white/5 backdrop-blur-sm h-full flex flex-col justify-between overflow-hidden">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                        <DollarSign className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">Total Balance (YTD)</p>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                                        {isLoading ? '---' : formatCurrency(stats?.metrics?.totalBalanceYTD || 0)}
                                    </h2>
                                    <div className="bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                                        <span className="text-indigo-400 font-black text-xs">+{stats?.metrics?.growth || 12}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 pt-10 border-t border-white/5">
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pending Payout</p>
                                    <p className="text-3xl font-black text-white">{formatCurrency(stats?.metrics?.nextPayout || 0)}</p>
                                    <p className="text-[10px] text-indigo-500/60 font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                                        <ArrowDownLeft className="w-3 h-3" /> Auto-processing Friday
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Clinical Hours</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-3xl font-black text-white">{stats?.metrics?.billableHours || 0}</p>
                                        <span className="text-slate-600 font-black">HRS</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Accumulated This Quarter</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="md:col-span-4 space-y-8">
                        <section className="bg-white rounded-[2.5rem] p-1 dark:bg-slate-900 border border-slate-100 shadow-xl group h-full">
                            <div className="bg-slate-50/50 rounded-[2.25rem] p-8 h-full border border-white flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                                        <Clock className="w-7 h-7 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Session Flow</h3>
                                        <p className="text-slate-500 font-medium text-sm mt-1 leading-relaxed">
                                            Average billable rate of <span className="text-indigo-600 font-bold">₹2,800 / hr</span> across all patient interactions.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Quarter Target</span>
                                        <span className="text-slate-900">75% Achieved</span>
                                    </div>
                                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '75%' }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </motion.div>

                {/* Revenue Visualization */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-12 bg-white rounded-[3.5rem] p-1 border border-slate-100 shadow-2xl relative overflow-hidden group">
                        <div className="bg-slate-50/30 rounded-[3.25rem] p-10 md:p-12 border border-white flex flex-col lg:flex-row gap-12">
                            <div className="lg:w-1/3 space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Dynamics</h2>
                                    <p className="text-slate-500 font-medium text-base mt-2">
                                        A visual breakdown of your practice's financial performance over the fiscal year.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Peaks</p>
                                        <p className="text-xl font-black text-slate-900">May '23</p>
                                        <p className="text-[10px] text-indigo-500 font-black mt-1">+24% High</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Steady</p>
                                        <p className="text-xl font-black text-slate-900">Apr '23</p>
                                        <p className="text-[10px] text-sky-500 font-black mt-1">Consistency</p>
                                    </div>
                                </div>
                                <button className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 group">
                                    View Detailed Forecasts <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>

                            <div className="lg:w-2/3 h-96 relative">
                                {isLoading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8h0" strokeOpacity={0.5} />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' as any }}
                                                dy={15}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '6 6' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#6366f1"
                                                strokeWidth={5}
                                                fillOpacity={1}
                                                fill="url(#colorAmount)"
                                                animationDuration={2000}
                                                activeDot={{ r: 8, fill: "#6366f1", stroke: "#fff", strokeWidth: 4 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Secure Ledger */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-[3.5rem] p-1 border border-slate-100 shadow-2xl overflow-hidden group">
                    <div className="bg-white rounded-[3.25rem] overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-indigo-500" />
                                    Clinical Ledger
                                </h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">Audit log of your professional services and payouts.</p>
                            </div>
                            
                            <div className="relative w-full md:w-80 group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find transaction..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / Date</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner Hub</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Profile</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Record</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Certificate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-10 py-8"><div className="h-8 bg-slate-50 rounded-xl" /></td>
                                            </tr>
                                        ))
                                    ) : (stats?.transactions || [])
                                        .filter((t: any) => t.client.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((tx: any) => (
                                        <tr key={tx.id} className="hover:bg-indigo-50/30 transition-all group/row">
                                            <td className="px-10 py-7">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID-{tx.id.padStart(4, '0')}</span>
                                                    <span className="text-sm font-black text-slate-700">{tx.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tx.client)}&background=1e1b4b&color=fff&bold=true`} alt="" />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 group-hover/row:text-indigo-600 transition-colors uppercase tracking-tight">{tx.client}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3">
                                                    <span className={`p-2 rounded-xl flex items-center justify-center ${
                                                        tx.type.includes('Video') ? 'bg-indigo-50 text-indigo-500' : 'bg-sky-50 text-sky-500'
                                                    }`}>
                                                        {tx.type.includes('Video') ? <Clock className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-700 uppercase">{tx.type}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.duration}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-slate-900">{formatCurrency(tx.amount)}</span>
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Help */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex justify-center flex-col items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-6">
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">Tax Documents</button>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">Payout History</button>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">Dispute Resolution</button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
