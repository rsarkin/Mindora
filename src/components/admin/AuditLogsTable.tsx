import { useEffect, useState } from 'react';
import type { AuditLogItem } from '../../services/adminService';
import { adminService } from '../../services/adminService';
import { History, Search, Download, CheckCircle, XCircle, UserCog } from 'lucide-react';

export const AuditLogsTable = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await adminService.getAuditLogs();
                setLogs(data);
            } catch (error) {
                console.error("Failed to load audit logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionIcon = (action: string) => {
        if (action.includes('REJECT')) return <XCircle className="w-5 h-5 text-rose-500" />;
        if (action.includes('VERIFY')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        return <UserCog className="w-5 h-5 text-indigo-500" />;
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading system audit logs...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mt-8 max-w-7xl mx-auto">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <History className="w-5 h-5 text-primary-500" /> Platform Audit Trail
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Read-only chronological record of all administrative actions.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all">
                        <Download className="w-4 h-4" /> CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                            <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                            <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Action Details</th>
                            <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">IP Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">No audit logs match your search.</td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-8">
                                        <div className="font-mono text-sm font-medium text-slate-700">
                                            {new Date(log.createdAt).toLocaleString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="py-4 px-8">
                                        <div className="font-bold text-slate-900">{log.adminId?.name || 'System Admin'}</div>
                                        <div className="text-xs text-slate-500">{log.adminId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="py-4 px-8">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getActionIcon(log.action)}</div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{log.action.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-md">{log.details}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-xs font-mono text-slate-400">{log.ipAddress || 'Unknown'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
