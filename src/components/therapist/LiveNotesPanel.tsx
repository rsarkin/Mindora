import React, { useState, useEffect, useRef } from 'react';
import { FileText, Clock, Save, History, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface LiveNotesPanelProps {
    appointmentId: string;
    patientId: string;
}

export const LiveNotesPanel: React.FC<LiveNotesPanelProps> = ({ appointmentId, patientId }) => {
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
    const [note, setNote] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const isInitialMount = useRef(true);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial load of current session note
    useEffect(() => {
        const fetchCurrentNote = async () => {
            try {
                const data = await api.getSessionNote(appointmentId);
                if (data && data.content) {
                    setNote(data.content);
                }
            } catch (error) {
                console.error("Failed to load current session note:", error);
            }
        };
        fetchCurrentNote();
    }, [appointmentId]);

    // Debounced Auto-Save
    useEffect(() => {
        if (isInitialMount.current) {
             isInitialMount.current = false;
             return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setSaveStatus('saving');

        saveTimeoutRef.current = setTimeout(async () => {
             try {
                 await api.saveSessionNote(appointmentId, { content: note, status: 'DRAFT' });
                 setSaveStatus('saved');
             } catch (error) {
                 console.error("Auto-save failed:", error);
                 setSaveStatus('error');
             }
        }, 1500);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [note, appointmentId]);

    // Fetch History when tab switches
    useEffect(() => {
        const fetchHistory = async () => {
            if (activeTab === 'history' && history.length === 0) {
                setLoadingHistory(true);
                try {
                    const data = await api.getPatientNoteHistory(patientId);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to load history:", error);
                } finally {
                    setLoadingHistory(false);
                }
            }
        };
        fetchHistory();
    }, [activeTab, patientId, history.length]);

    const handleSaveFinal = async () => {
         try {
             setSaveStatus('saving');
             await api.saveSessionNote(appointmentId, { content: note, status: 'FINAL' });
             setSaveStatus('saved');
         } catch (error) {
             setSaveStatus('error');
         }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header Tabs */}
            <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-2">
                <button 
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-white shadow-sm text-indigo-700 border border-slate-200/60' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" /> Live Notes
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-700 border border-slate-200/60' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                >
                    <History className="w-4 h-4" /> Past Notes
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'current' ? (
                    <div className="absolute inset-0 flex flex-col p-5">
                       <textarea
                            className="flex-1 w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 text-[15px] leading-relaxed custom-scrollbar transition-all"
                            placeholder="Type secure clinical notes here. These auto-save continuously and are encrypted..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        
                        <div className="mt-4 flex items-center justify-between px-1">
                             <div className="flex items-center text-xs font-bold">
                                {saveStatus === 'saving' && (
                                     <span className="flex items-center text-slate-400 gap-1.5 animate-pulse">
                                         <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                                     </span>
                                )}
                                {saveStatus === 'saved' && (
                                     <span className="flex items-center text-emerald-500 gap-1.5">
                                         <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved securely
                                     </span>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="flex items-center text-rose-500 gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" /> Save failed. Retrying...
                                    </span>
                                )}
                             </div>
                             
                             <button onClick={handleSaveFinal} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold gap-2">
                                <Save className="w-4 h-4" /> Finish
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/30">
                        {loadingHistory ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="font-semibold text-sm">Decrypting history...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                                <History className="w-12 h-12 mb-3 opacity-20" />
                                <p className="font-semibold">No previous session notes found for this patient.</p>
                            </div>
                        ) : (
                            history.map((histNode) => (
                                <div key={histNode._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                            <Clock className="w-4 h-4" />
                                            {new Date(histNode.appointmentId?.scheduledAt || histNode.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${histNode.status === 'FINAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                                            {histNode.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {histNode.content || <span className="italic text-slate-400">Empty note</span>}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
