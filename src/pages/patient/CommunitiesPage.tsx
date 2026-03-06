import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, HeartPulse, Activity, Brain, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const CommunitiesPage: React.FC<{ onJoin?: (podId: string) => void }> = ({ onJoin }) => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<any[]>([]);
    const [myPods, setMyPods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [commsData, podsData] = await Promise.all([
                    api.getCommunities(),
                    api.getMyPods()
                ]);
                setCommunities(commsData);
                setMyPods(podsData);
            } catch (err) {
                console.error("Failed to load community data", err);
                setError('Failed to load communities. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleJoin = async (communityId: string) => {
        try {
            setJoiningId(communityId);
            setError('');
            const response = await api.joinCommunity(communityId);
            if (onJoin) {
                onJoin(response.pod._id);
            } else {
                navigate(`../pod/${response.pod._id}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to join community');
        } finally {
            setJoiningId(null);
        }
    };

    const getIconMap = (category: string) => {
        switch (category) {
            case 'Rehab': return <Activity className="w-8 h-8 text-rose-500" />;
            case 'Anxiety': return <Brain className="w-8 h-8 text-indigo-500" />;
            case 'Grief': return <HeartPulse className="w-8 h-8 text-emerald-500" />;
            default: return <Users className="w-8 h-8 text-amber-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[120px] -z-10 -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] -z-10 -ml-48 -mb-48" />

            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="p-8 sm:p-12 max-w-7xl mx-auto space-y-12 relative z-10"
            >
                {/* Header */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold mb-6 tracking-wide uppercase">
                        <Users className="w-3.5 h-3.5" />
                        Safe Social Spaces
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                        Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Support Groups</span>
                    </h1>
                    <p className="text-slate-500 mt-6 text-xl max-w-2xl font-medium leading-relaxed">
                        Join an intimate, moderated 15-person pod. Share experiences, attend weekly video circles, and support each other in a safe space.
                    </p>
                </motion.div>

                {/* Error Banner */}
                {error && (
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <span className="font-bold">{error}</span>
                    </motion.div>
                )}

                {/* My Joined Pods */}
                {myPods.length > 0 && (
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Active Pods</h2>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myPods.map(pod => (
                                <button
                                    key={pod._id}
                                    onClick={() => onJoin ? onJoin(pod._id) : navigate(`../pod/${pod._id}`)}
                                    className="bg-white/70 backdrop-blur-2xl border-2 border-white/50 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-sky-200 hover:-translate-y-2 transition-all duration-500 text-left group profile-card-glow"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                                            <Users className="w-7 h-7" />
                                        </div>
                                        <span className="text-xs font-black px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full border border-sky-100">
                                            {pod.currentMemberCount}/15 Members
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">{pod.name}</h3>
                                    <p className="text-base text-slate-500 font-bold mb-6">{pod.communityId?.name || 'Community'}</p>
                                    <div className="flex items-center text-sky-600 text-sm font-black group-hover:translate-x-2 transition-transform duration-500">
                                        ENTER POD WORKSPACE <ArrowRight className="w-5 h-5 ml-2" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Discover Communities */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Discover Communities</h2>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {communities.map((community) => {
                            const isMember = myPods.some(p => p.communityId?._id === community._id);

                            return (
                                <div key={community._id} className="bg-white/70 backdrop-blur-2xl border border-white/80 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col h-full group">
                                    {community.imageUrl && (
                                        <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                            <img src={community.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                    )}
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-500">
                                        {getIconMap(community.category)}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{community.name}</h3>
                                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-8 flex-1">
                                        {community.description}
                                    </p>
                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleJoin(community._id)}
                                            disabled={joiningId === community._id || isMember}
                                            className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 
                                                 ${isMember ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' :
                                                    'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1 active:scale-95 shadow-lg shadow-blue-100'}`}
                                        >
                                            {joiningId === community._id ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> ASSIGNING POD...</>
                                            ) : isMember ? (
                                                <><CheckCircle2 className="w-5 h-5" /> ALREADY JOINED</>
                                            ) : (
                                                <><Shield className="w-5 h-5" /> JOIN SAFE SPACE</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .profile-card-glow:hover {
                    box-shadow: 0 20px 50px rgba(14, 165, 233, 0.15);
                }
            `}} />
        </div>
    );
};
