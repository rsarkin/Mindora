import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HelpCircle, Download, DollarSign, Clock, FileText, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.getEarningsStats();
            setStats(data);
        } catch (err: any) {
            console.error("Failed to fetch earnings stats", err);
            setError(err.response?.data?.message || "Failed to load financial data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-xl">
                    <p className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">{label} Earnings</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        <p className="font-black font-heading text-2xl">
                            {formatCurrency(payload[0].value)}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const SkeletonCard = ({ className }: { className?: string }) => (
        <div className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse ${className}`}>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-6"></div>
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-slate-100 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
                <p className="text-slate-500 font-medium mb-8 max-w-md">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
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
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Financial Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Track your practice revenue, session hours, and upcoming payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        disabled={isLoading || !stats?.transactions?.length}
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </motion.div>

            {/* Top Cards Grid */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <SkeletonCard className="md:col-span-2 bg-emerald-50/50" />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* Total Balance Card */}
                        <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:opacity-20 transition-opacity"></div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                                <div>
                                    <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> Total Balance (YTD)
                                    </p>
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-5xl md:text-6xl font-black font-heading tracking-tight leading-none">
                                            {formatCurrency(stats?.metrics?.totalBalanceYTD || 0)}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-sm font-bold bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/20">
                                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                                        <span className="text-emerald-50">Active Practice</span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto">
                                    <p className="text-emerald-100 font-semibold mb-1 text-sm">Pending Payout</p>
                                    <p className="text-2xl font-black mb-1">{formatCurrency(stats?.metrics?.nextPayout || 0)}</p>
                                    <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Estimated next cycle</p>
                                </div>
                            </div>
                        </div>

                        {/* Hours Logged Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 relative z-10">
                                <Clock className="w-6 h-6" />
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Billable Hours</p>
                                <h3 className="text-4xl font-black font-heading text-slate-900 tracking-tight mb-2">
                                    {stats?.metrics?.billableHours || 0}<span className="text-xl text-slate-400 ml-1">hrs</span>
                                </h3>
                                <p className="text-sm font-semibold flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lifetime sessions
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Income Chart */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-50 to-transparent opacity-50 pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Revenue Over Time</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Rolling revenue breakdown based on completed sessions.</p>
                    </div>
                </div>

                <div className="h-80 w-full relative z-10">
                    {isLoading ? (
                        <div className="w-full h-full flex flex-col gap-4">
                            <div className="h-4 bg-slate-50 w-full rounded animate-pulse" />
                            <div className="h-full bg-slate-50/50 w-full rounded-2xl animate-pulse" />
                        </div>
                    ) : stats?.chartData?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                                    dy={10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-bold">No revenue data available yet</p>
                            <p className="text-xs">Complete your first session to see insights</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Session Ledger */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Detailed ledger of your latest completed sessions.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : stats?.transactions?.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent">Date</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent">Client</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent">Service</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent">Amount</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent">Status</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.transactions.map((session: any) => (
                                    <tr key={session.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                            {session.date}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-900 group-hover:text-primary-600 transition-colors">{session.client}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{session.type}</span>
                                                <span className="text-xs font-semibold text-slate-400">{session.duration}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-900">{formatCurrency(session.amount)}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100`}>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Paid
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100 inline-flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 text-center flex flex-col items-center justify-center bg-slate-50/30">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-slate-600">No transactions recorded</h3>
                            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Once your clients complete payments, they will appear here in detailed view.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Help Footer */}
            <div className="flex justify-center text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors cursor-pointer w-fit mx-auto group">
                <HelpCircle className="w-4 h-4 mr-2 group-hover:text-primary-500 transition-colors" />
                <span>Financial Support & Help Center</span>
            </div>

        </motion.div>
    );
};
