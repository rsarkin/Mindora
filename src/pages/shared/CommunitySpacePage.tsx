import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield, Loader2, AlertCircle, Plus, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import { CommunitiesPage } from '../patient/CommunitiesPage';
import { PodDashboard } from '../patient/PodDashboard';
export const CommunitySpacePage: React.FC = () => {
    const [myPods, setMyPods] = useState<any[]>([]);
    const [activePodId, setActivePodId] = useState<string | null>(null);
    const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const fetchPods = async () => {
        try {
            setIsLoading(true);
            const pods = await api.getMyPods();
            setMyPods(pods);
            setError('');

            if (pods.length > 0 && !activePodId && !isDiscoveryMode) {
                // By default, open the first pod or go to discovery if none
                setActivePodId(pods[0]._id);
            } else if (pods.length === 0) {
                setIsDiscoveryMode(true);
            }
        } catch (err: any) {
            console.error('Failed to load pods:', err);
            setError('Failed to load your communities.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPods();
    }, []);

    // Filter pods based on search query
    const filteredPods = myPods.filter(pod =>
        (pod.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (pod.communityId?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] w-full max-w-[1600px] mx-auto flex bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
            {/* Left Sidebar - Pods List & Navigation */}
            <motion.div
                animate={{ width: activePodId ? 300 : 384 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex-shrink-0 bg-slate-50/50 flex flex-col border-r border-slate-100 z-20 hidden md:flex relative overflow-hidden`}
            >
                <div className="p-6 pb-4 bg-white/50 backdrop-blur-md sticky top-0 border-b border-slate-100 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Communities</h1>
                        <button
                            onClick={() => { setIsDiscoveryMode(true); setActivePodId(null); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDiscoveryMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                }`}
                            title="Discover Communities"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a pod..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium shadow-sm transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2">
                    {/* Error State */}
                    {error && (
                        <div className="px-3 py-2">
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin opacity-50" />
                        </div>
                    )}

                    {/* Pods List */}
                    {!isLoading && (
                        <div>
                            <div className="flex items-center gap-2 px-3 mb-3">
                                <Users className="w-4 h-4 text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Active Pods</h3>
                            </div>

                            <div className="space-y-1">
                                {filteredPods.map(pod => (
                                    <button
                                        key={pod._id}
                                        onClick={() => { setActivePodId(pod._id); setIsDiscoveryMode(false); }}
                                        className={`w-full p-3 rounded-2xl transition-all text-left flex items-center gap-3 group relative overflow-hidden ${activePodId === pod._id
                                            ? 'bg-indigo-50 ring-1 ring-indigo-200 shadow-sm'
                                            : 'hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-100 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${activePodId === pod._id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 border border-indigo-200 group-hover:bg-indigo-100'
                                            }`}>
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h4 className={`font-bold text-sm truncate ${activePodId === pod._id ? 'text-indigo-900' : 'text-slate-900 group-hover:text-indigo-700 transition-colors'}`}>
                                                {pod.name}
                                            </h4>
                                            <p className="text-xs truncate font-medium text-slate-500 mt-0.5">
                                                {pod.communityId?.name || 'Community'}
                                            </p>
                                        </div>

                                        {/* Activity Indicator (If Needed) */}
                                        {activePodId === pod._id && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                        )}
                                    </button>
                                ))}

                                {!isLoading && myPods.length === 0 && !isDiscoveryMode && (
                                    <div className="px-4 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 m-2">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">You haven't joined any pods.</p>
                                        <p className="text-xs text-slate-400 mb-4 px-2">Find a safe space to connect with others.</p>
                                        <button
                                            onClick={() => { setIsDiscoveryMode(true); setActivePodId(null); }}
                                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            Browse Communities
                                        </button>
                                    </div>
                                )}

                                {!isLoading && myPods.length > 0 && filteredPods.length === 0 && (
                                    <div className="px-4 py-6 text-center text-sm text-slate-500 font-medium">
                                        No pods match your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Mobile Navigation Header (Only visible on small screens when deeply navigated) */}
            <div className={`md:hidden absolute top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 z-30 flex items-center px-4 ${(!isDiscoveryMode && !activePodId) ? 'hidden' : ''}`}>
                <button
                    onClick={() => { setIsDiscoveryMode(false); setActivePodId(null); }}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> Back to Pods
                </button>
            </div>

            {/* Main Content Area - Expansive Right Side */}
            <div className={`flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[length:400px_400px] overflow-hidden ${(!isDiscoveryMode && !activePodId) ? 'hidden md:flex' : 'pt-14 md:pt-0'}`}>
                {isDiscoveryMode ? (
                    <div className="flex-1 overflow-y-auto">
                        <CommunitiesPage
                            onJoin={(podId) => {
                                fetchPods();
                                setActivePodId(podId);
                                setIsDiscoveryMode(false);
                            }}
                        />
                    </div>
                ) : activePodId ? (
                    <div className="flex-1 overflow-hidden">
                        <PodDashboard
                            podId={activePodId}
                            onBack={() => setIsDiscoveryMode(true)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                        <div className="text-center p-10 bg-white/80 rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-w-md mx-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-indigo-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-inner transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                                <Users className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-heading font-black text-slate-900 mb-3 tracking-tight">Community Space</h3>
                            <p className="text-[15px] font-medium text-slate-500 leading-relaxed mb-8">
                                Select a community pod from the sidebar to join the conversation, or explore new groups to find your safe space.
                            </p>
                            <button
                                onClick={() => setIsDiscoveryMode(true)}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Discover Communities
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Default View (Shows Pods list) */}
            <div className={`md:hidden flex-1 overflow-y-auto ${(!isDiscoveryMode && !activePodId) ? 'block' : 'hidden'}`}>
                <div className="p-6">
                    <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight mb-6">My Communities</h1>

                    <button
                        onClick={() => setIsDiscoveryMode(true)}
                        className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-indigo-700 font-bold mb-6 shadow-sm"
                    >
                        <span className="flex items-center gap-3"><Plus className="w-5 h-5" /> Discover New Pods</span>
                    </button>

                    <div className="space-y-3">
                        {myPods.map(pod => (
                            <button
                                key={pod._id}
                                onClick={() => setActivePodId(pod._id)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4 text-left"
                            >
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{pod.name}</h4>
                                    <p className="text-sm text-slate-500 truncate">{pod.communityId?.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
