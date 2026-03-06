/* eslint-disable react-hooks/static-components */
import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HelpCircle, Download, ArrowUpRight, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const EarningsPage: React.FC = () => {
    // Mock Data for Chart
    const earningsData = [
        { month: 'Jan', amount: 20000 },
        { month: 'Feb', amount: 35000 },
        { month: 'Mar', amount: 28000 },
        { month: 'Apr', amount: 32000 },
        { month: 'May', amount: 48000 },
        { month: 'Jun', amount: 45000 },
        { month: 'Jul', amount: 84500 }, // Matching Dashboard stat
    ];

    // Mock Data for Session History
    const sessionHistory = [
        { id: 1, date: 'July 15, 2024', client: 'Ethan Bennett', type: 'Individual Therapy', duration: '50 min', amount: 1500, status: 'Paid' },
        { id: 2, date: 'July 12, 2024', client: 'Olivia Harper', type: 'Couples Therapy', duration: '75 min', amount: 2000, status: 'Paid' },
        { id: 3, date: 'July 10, 2024', client: 'Noah Thompson', type: 'Individual Therapy', duration: '50 min', amount: 1500, status: 'Processing' },
        { id: 4, date: 'July 8, 2024', client: 'Sophia Clark', type: 'Group Therapy', duration: '90 min', amount: 3000, status: 'Paid' },
        { id: 5, date: 'July 5, 2024', client: 'Liam Foster', type: 'Individual Therapy', duration: '50 min', amount: 1500, status: 'Paid' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-xl">
                    <p className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">{label} Earnings</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        <p className="font-black font-heading text-2xl">
                            <span className="text-emerald-400">₹</span>{payload[0].value.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </motion.div>

            {/* Top Cards Grid */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <span className="text-emerald-300">₹</span>2,14,300
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-sm font-bold bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/20">
                                <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                                <span className="text-emerald-50">+24% vs Last Year</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto">
                            <p className="text-emerald-100 font-semibold mb-1 text-sm">Next Payout</p>
                            <p className="text-2xl font-black mb-1">₹45,000</p>
                            <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Aug 1, 2024</p>
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
                        <h3 className="text-4xl font-black font-heading text-slate-900 tracking-tight mb-2">142<span className="text-xl text-slate-400 ml-1">hrs</span></h3>
                        <p className="text-sm font-semibold flex items-center gap-1 text-emerald-600">
                            <ArrowUpRight className="w-3.5 h-3.5" /> +12 hrs this month
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Income Chart */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-50 to-transparent opacity-50 pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Revenue Over Time</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Monthly earnings breakdown for 2024.</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                        Year 2024
                    </div>
                </div>

                <div className="h-80 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                </div>
            </motion.div>

            {/* Session Ledger */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Detailed ledger of your latest completed sessions.</p>
                    </div>
                    <button className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-xl transition-colors">
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
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
                            {sessionHistory.map((session) => (
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
                                        <span className="text-sm font-black text-slate-900">₹{session.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${session.status === 'Paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {session.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {session.status}
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
