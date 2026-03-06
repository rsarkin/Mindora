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
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="p-8 max-w-7xl mx-auto space-y-10"
        >
            {/* Header */}
            <motion.div variants={STAGGER_CHILD_VARIANTS}>
                <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Users className="w-10 h-10 text-indigo-600" />
                    Community Support Groups
                </h1>
                <p className="text-slate-500 mt-2 text-lg max-w-2xl font-medium">
                    Join an intimate, moderated 15-person pod. Share experiences, attend weekly video circles, and support each other in a safe space.
                </p>
            </motion.div>

            {/* Error Banner */}
            {error && (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm">{error}</span>
                </motion.div>
            )}

            {/* My Joined Pods */}
            {myPods.length > 0 && (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">My Active Pods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myPods.map(pod => (
                            <button
                                key={pod._id}
                                onClick={() => onJoin ? onJoin(pod._id) : navigate(`../pod/${pod._id}`)}
                                className="bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                                        {pod.currentMemberCount}/15 Members
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{pod.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-4">{pod.communityId?.name || 'Community'}</p>
                                <div className="flex items-center text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                    Enter Pod Workspace <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Discover Communities */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Discover Communities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => {
                        const isMember = myPods.some(p => p.communityId?._id === community._id);

                        return (
                            <div key={community._id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                                {community.imageUrl && (
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                                        <img src={community.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                    </div>
                                )}
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 inner-shadow">
                                    {getIconMap(community.category)}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{community.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                    {community.description}
                                </p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleJoin(community._id)}
                                        disabled={joiningId === community._id || isMember}
                                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 
                                             ${isMember ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                                                'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg shadow-black/10'}`}
                                    >
                                        {joiningId === community._id ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Assigning Pod...</>
                                        ) : isMember ? (
                                            <><CheckCircle2 className="w-5 h-5" /> Already Joined</>
                                        ) : (
                                            <><Shield className="w-5 h-5" /> Join Safe Space</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
};
