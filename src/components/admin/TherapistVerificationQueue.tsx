import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Shield, Check, X, Eye, Clock, FileText, AlertCircle } from 'lucide-react';

interface VerificationQueueItem {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        createdAt: string;
    };
    licenseNumber: string;
    specializations: string[];
    verificationDocuments: string[];
    createdAt: string;
}

const getDocUrl = (filename: string) => {
    if (!filename) return '#';
    if (filename.startsWith('http')) return filename;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const serverBase = apiBase.replace('/api', '');
    return `${serverBase}/uploads/${filename}`;
};

export const TherapistVerificationQueue = () => {
    const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<VerificationQueueItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getVerificationQueue();
            setQueue(data);
        } catch (error) {
            console.error("Failed to load queue", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await adminService.verifyTherapist(id);
            loadQueue();
            setSelectedItem(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) return alert("Please provide a rejection reason.");
        try {
            await adminService.rejectTherapist(id, rejectionReason);
            loadQueue();
            setSelectedItem(null);
            setRejectionReason('');
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading registration queue...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mt-8 max-w-7xl mx-auto">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" /> Pending Verification Queue
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full ml-2">{queue.length}</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Review applicant credentials to ensure platform integrity.</p>
                </div>
            </div>

            {queue.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4"><Shield className="w-8 h-8" /></div>
                    <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
                    <p className="text-slate-500">There are no new therapist registrations waiting for approval.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                                <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">License</th>
                                <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Specializations</th>
                                <th className="py-4 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {queue.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-8">
                                        <div className="font-bold text-slate-900">{item.userId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-500">{item.userId?.email || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">Applied: {new Date(item.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="py-4 px-8 font-mono text-sm text-slate-700">{item.licenseNumber}</td>
                                    <td className="py-4 px-8">
                                        <div className="flex flex-wrap gap-1">
                                            {item.specializations.slice(0, 2).map((spec, i) => (
                                                <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700">{spec}</span>
                                            ))}
                                            {item.specializations.length > 2 && <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">+{item.specializations.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" /> Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Review */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" /> Review Application
                            </h3>
                            <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Applicant Name</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedItem.userId?.name}</p>
                                    <p className="text-xs text-slate-500">{selectedItem.userId?.email}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">License No.</p>
                                    <p className="text-sm font-mono font-bold text-slate-900">{selectedItem.licenseNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-900">Verification Steps</p>
                                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm font-medium text-slate-700">Verified identity matches records</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm font-medium text-slate-700">License number is valid and active</span>
                                </label>
                            </div>

                            {/* View Uploaded Documents Section */}
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-900">Submitted Documents</p>
                                {selectedItem.verificationDocuments && selectedItem.verificationDocuments.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedItem.verificationDocuments.map((docUrl, idx) => (
                                            <a
                                                key={idx}
                                                href={getDocUrl(docUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                                    <span className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">Document {idx + 1}</span>
                                                </div>
                                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-center">
                                        <p className="text-sm text-slate-500 font-medium">No documents were uploaded.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                                <label className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-2">
                                    <AlertCircle className="w-4 h-4" /> Reject Application?
                                </label>
                                <textarea
                                    className="w-full text-sm p-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white font-medium"
                                    placeholder="Provide a required reason for rejection (e.g., 'Expired License', 'Invalid Credentials'). This will be sent to the applicant."
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end shrink-0">
                            {rejectionReason.length > 0 ? (
                                <button
                                    onClick={() => handleReject(selectedItem._id)}
                                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    <X className="w-4 h-4" /> Confirm Rejection
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleVerify(selectedItem._id)}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Approve & Verify
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
