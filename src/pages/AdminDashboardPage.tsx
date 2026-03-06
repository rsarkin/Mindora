import { useEffect, useState } from 'react';
import type { AdminStats, AdminCharts } from '../services/adminService';
import { adminService } from '../services/adminService';
import {
    Users, Activity, ShieldCheck, CreditCard
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TherapistVerificationQueue } from '../components/admin/TherapistVerificationQueue';
import { AuditLogsTable } from '../components/admin/AuditLogsTable';

export const AdminDashboardPage = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [charts, setCharts] = useState<AdminCharts | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, chartsData] = await Promise.all([
                    adminService.getStats(),
                    adminService.getCharts()
                ]);
                setStats(statsData);
                setCharts(chartsData);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (isLoading) return <div className="flex animate-pulse space-x-4 p-8"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div></div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <h1 className="text-3xl font-bold text-slate-900">System Command Center</h1>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Overview' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('Overview')}
                    >Overview</button>
                    <button
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${activeTab === 'Verifications' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('Verifications')}
                    >Queue <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">{stats?.pendingApprovals || 0}</span></button>
                    <button
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'Logs' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('Logs')}
                    >Audit Trail</button>
                </div>
            </div>

            {activeTab === 'Overview' && (
                <>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Active Patients', value: stats?.activePatients || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Verified Therapists', value: stats?.verifiedTherapists || 0, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Active Sessions', value: stats?.sessionsCount || 0, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
                            { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Growth Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">User Growth (Last 30 Days)</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={charts?.userGrowth || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Categories Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Therapy Categories</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts?.categoryStats || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {(charts?.categoryStats || []).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'Verifications' && <TherapistVerificationQueue />}
            {activeTab === 'Logs' && <AuditLogsTable />}
        </div>
    );
};
