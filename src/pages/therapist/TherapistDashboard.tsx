import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, MessageSquare, ChevronRight, Clock } from 'lucide-react';
import axios from 'axios';
import { Skeleton, CardSkeleton } from '../../components/Skeleton';


interface DashboardStats {
    totalPatients: number;
    appointments: number;
    completedSessions: number;
    pendingRequests: number;
    totalEarnings: number;
    rating: number;
}

export const TherapistDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const response = await axios.get(`${API_BASE_URL}/therapists/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data.metrics);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Mock data for UI development matches the reference
    const todayAppointments = [
        { id: 1, name: 'Emily Johnson', time: '10:00 AM - 11:00 AM', type: 'Initial Consultation', color: 'bg-blue-50 text-blue-700' },
        { id: 2, name: 'David Lee', time: '02:00 PM - 03:00 PM', type: 'Follow-up Session', color: 'bg-indigo-50 text-indigo-700' },
        { id: 3, name: 'Sarah Chen', time: '04:30 PM - 05:30 PM', type: 'Group Therapy', color: 'bg-purple-50 text-purple-700' },
    ];

    const recentActivity = [
        { id: 1, text: 'Added a new note for Patient Alice Green.', time: '2 hours ago', icon: 'file' },
        { id: 2, text: 'Completed session with Patient Robert Brown.', time: 'Yesterday', icon: 'video' },
        { id: 3, text: 'Replied to Patient Carol White regarding follow-up.', time: '3 days ago', icon: 'message' },
        { id: 4, text: 'Reviewed treatment plan for Patient David Black.', time: '5 days ago', icon: 'file' },
    ];

    if (loading) {
        return (
            <div className="p-8 bg-slate-50 min-h-screen font-sans">
                <div className="mb-8">
                    <Skeleton variant="text" className="w-64 h-8 mb-2" />
                    <Skeleton variant="text" className="w-24 h-5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <Skeleton variant="card" className="h-80" />
                        <div className="space-y-3">
                            <Skeleton variant="rectangular" className="h-20" />
                            <Skeleton variant="rectangular" className="h-20" />
                            <Skeleton variant="rectangular" className="h-20" />
                        </div>
                    </div>
                    <Skeleton variant="card" className="h-full min-h-[500px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Therapist Dashboard</h1>
                <p className="text-slate-500 mt-1 text-lg">Overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Upcoming Sessions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Upcoming Sessions</p>
                            <h3 className="text-4xl font-bold text-slate-900">{stats?.pendingRequests || 5}</h3>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Pending Messages */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Pending Messages</p>
                            <h3 className="text-4xl font-bold text-slate-900">3</h3>
                        </div>
                        <div className="bg-green-100 p-2 rounded-xl text-green-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Estimated Earnings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Estimated Earnings</p>
                            <h3 className="text-4xl font-bold text-slate-900">${stats?.totalEarnings?.toLocaleString() || '1,250'}</h3>
                        </div>
                        <div className="text-slate-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Calendar & Appointments */}
                <div className="space-y-8">
                    {/* Calendar Widget (Simplified for UI reference) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <button className="text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                            <h3 className="text-lg font-bold text-slate-900">September 2025</h3>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5" /></button>
                                <button className="text-xs font-semibold px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">Today</button>
                            </div>
                        </div>

                        {/* Mock Calendar Grid */}
                        <div className="grid grid-cols-7 text-center mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-xs text-slate-400 font-medium py-2">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-2">
                            {/* Mock dates for visual similarity to reference */}
                            {[...Array(6)].map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                            {[...Array(30)].map((_, i) => {
                                const day = i + 1;
                                const isSelected = day === 6;
                                const isToday = day === 24; // Mock today
                                return (
                                    <div key={day} className="flex justify-center">
                                        <button className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-200' :
                                            isToday ? 'bg-slate-100 text-slate-900 font-bold' :
                                                'text-slate-600 hover:bg-slate-50'
                                            }`}>
                                            {day}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Today's Appointments */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Appointments (Sep 6)</h3>
                        <div className="space-y-3">
                            {todayAppointments.map(appt => (
                                <div key={appt.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{appt.time} - <span className="text-slate-700">{appt.name}</span></p>
                                            <p className="text-xs text-slate-500 mt-0.5">{appt.type}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="bg-white rounded-3xl p-8 shadow-sm h-full">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="relative pl-10 flex justify-between items-start group">
                                {/* Timeline Node */}
                                <div className="absolute left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></div>

                                <div>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{activity.text}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                                <button className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
