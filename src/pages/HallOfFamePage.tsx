import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Zap, Heart, Award, Star, Leaf, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HallOfFamePage: React.FC = () => {
    const navigate = useNavigate();

    const REWARDS = [
        { action: 'Daily Sign-in', points: '+10 MP', description: 'Log in daily to maintain your streak.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
        { action: 'Quick Mood Log', points: '+5 MP', description: 'Record how you feel to stay mindful.', icon: <Heart className="w-5 h-5 text-rose-500" /> },
        { action: 'Breathing Completion', points: '+20 MP', description: 'Complete a guided breathing session.', icon: <Leaf className="w-5 h-5 text-sky-500" /> },
        { action: 'Therapy Session', points: '+50 MP', description: 'Attend a scheduled session with a professional.', icon: <Sparkles className="w-5 h-5 text-purple-500" /> }
    ];

    const LEVELS = [
        { name: 'Seedling', threshold: '0 - 99 MP', description: 'Your journey begins as a tiny sprout reaching for the light.', icon: <Leaf className="w-8 h-8" />, color: 'from-sky-400 to-blue-500' },
        { name: 'Sprouting Mind', threshold: '100 - 299 MP', description: 'Roots are deep, and focus is growing.', icon: <Zap className="w-8 h-8" />, color: 'from-emerald-400 to-teal-500' },
        { name: 'Blooming Soul', threshold: '300 - 599 MP', description: 'Compassion and self-awareness are in full bloom.', icon: <Sparkles className="w-8 h-8" />, color: 'from-pink-400 to-rose-500' },
        { name: 'Radiant Spirit', threshold: '600+ MP', description: 'A beacon of tranquility and inner strength.', icon: <Star className="w-8 h-8" />, color: 'from-yellow-400 to-orange-500' }
    ];

    const BADGES = [
        { name: 'Zen Seeker', requirement: '1 Breathing Session', icon: <Heart className="w-6 h-6" />, color: 'bg-rose-50 text-rose-500 border-rose-100' },
        { name: 'Consistency Starter', requirement: '3-Day Streak', icon: <Zap className="w-6 h-6" />, color: 'bg-orange-50 text-orange-500 border-orange-100' },
        { name: 'Consistency Champion', requirement: '7-Day Streak', icon: <Award className="w-6 h-6" />, color: 'bg-purple-50 text-purple-500 border-purple-100' }
    ];

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-12 space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-4 rounded-2xl bg-white/60 hover:bg-white border border-white backdrop-blur-md transition-all shadow-xl shadow-slate-200/50 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:text-sky-600 active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Sanctuary
                    </button>
                    <div className="text-right">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Hall of Fame</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Your Wellness Journey Protocol</p>
                    </div>
                </div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-[50px] p-12 md:p-16 text-white relative overflow-hidden shadow-3xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-24 h-24 rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                            <Star className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Level Up Your Mental Vitality</h2>
                            <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                                Experience a new dimension of mental health. Every action you take towards wellness is quantified and rewarded. Grow your spirit, earn badges, and reach the pinnacle of inner peace.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Points Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-10 border border-white shadow-2xl shadow-slate-200/20"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">How to Earn Points</h3>
                        </div>
                        <div className="space-y-4">
                            {REWARDS.map((reward, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-white transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            {reward.icon}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 tracking-tight">{reward.action}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{reward.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-100/50 px-4 py-1.5 rounded-full border border-emerald-100">
                                        {reward.points}
                                    </span >
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Level Roadmap */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-10 border border-white shadow-2xl shadow-slate-200/20"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Level Roadmap</h3>
                        </div>
                        <div className="relative space-y-8 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                            {LEVELS.map((level, i) => (
                                <div key={i} className="relative pl-16 flex items-start gap-6 group">
                                    <div className={`absolute left-0 w-16 h-16 rounded-[24px] bg-gradient-to-br ${level.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                        {level.icon}
                                    </div>
                                    <div className="pt-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-black text-slate-900 tracking-tight">{level.name}</h4>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-0.5 rounded-full uppercase tracking-tighter">
                                                {level.threshold}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">{level.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Badge Gallery */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[40px] p-12 border border-white shadow-2xl shadow-slate-200/30 overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-purple-500 to-rose-400" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Achievement Gallery</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Gilded Milestones of Progress</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                            <Info className="w-5 h-5 text-sky-500" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Badges are awarded automatically</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {BADGES.map((badge, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-8 rounded-[32px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all cursor-default group">
                                <div className={`w-20 h-20 rounded-[28px] ${badge.color} flex items-center justify-center mb-6 shadow-xl border-4 border-white transform group-hover:rotate-12 transition-transform`}>
                                    {badge.icon}
                                </div>
                                <h4 className="font-black text-slate-900 tracking-tight mb-2 underline decoration-sky-200 decoration-4 underline-offset-4">{badge.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{badge.requirement}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HallOfFamePage;
