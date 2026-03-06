import React, { useState, useEffect } from 'react';
import { User, Activity } from 'lucide-react';
import api from '../services/api';

interface Patient {
    id: string;
    name: string;
    lastSession: string;
    status: 'Active' | 'Inactive';
}

// Mock data for assigned patients
const MOCK_PATIENTS: Patient[] = [
    { id: 'test-user-id', name: 'Test User 4', lastSession: '2023-10-25', status: 'Active' },
    { id: 'p2', name: 'Sarah Connor', lastSession: '2023-10-20', status: 'Active' },
    { id: 'p3', name: 'John Doe', lastSession: '2023-10-15', status: 'Inactive' },
];

export const TherapistDashboard: React.FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [moodHistory, setMoodHistory] = useState<any[]>([]);

    useEffect(() => {
        if (selectedPatient) {
            const fetchHistory = async () => {
                try {
                    const history = await api.getMoodHistory(selectedPatient.id);
                    setMoodHistory(history);
                } catch (error) {
                    console.error('Failed to fetch mood history', error);
                    // Fallback for demo if backend is empty/error
                    setMoodHistory([
                        { id: '1', mood: 'Good', timestamp: new Date().toISOString() },
                        { id: '2', mood: 'Low', timestamp: new Date(Date.now() - 86400000).toISOString() }
                    ]);
                }
            };
            fetchHistory();
        }
    }, [selectedPatient]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Therapist Dashboard</h1>
                <p className="text-slate-500">Manage your patients and track their progress.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Patient List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[600px] overflow-y-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" />
                        Assigned Patients
                    </h2>
                    <div className="space-y-4">
                        {MOCK_PATIENTS.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPatient?.id === patient.id
                                    ? 'border-teal-500 bg-teal-50 shadow-md'
                                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{patient.name}</h3>
                                        <p className="text-sm text-slate-500">Last Session: {patient.lastSession}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {patient.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Details & Mood History */}
                <div className="lg:col-span-2 space-y-8">
                    {selectedPatient ? (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.name}'s Overview</h2>
                                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                                        Schedule Session
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Mood History
                                </h3>

                                {moodHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {moodHistory.map((log) => (
                                            <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${log.mood === 'Great' ? 'bg-green-100' :
                                                    log.mood === 'Good' ? 'bg-blue-100' :
                                                        log.mood === 'Okay' ? 'bg-slate-200' :
                                                            log.mood === 'Low' ? 'bg-orange-100' : 'bg-red-100'
                                                    }`}>
                                                    {log.mood === 'Great' ? '😄' :
                                                        log.mood === 'Good' ? '🙂' :
                                                            log.mood === 'Okay' ? '😐' :
                                                                log.mood === 'Low' ? '😔' : '😫'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{log.mood}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">No mood logs available for this patient.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-2xl">
                            <User className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Select a patient to view their details and mood history.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
