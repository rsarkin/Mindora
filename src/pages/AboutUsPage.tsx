import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Zap, Users, Trophy, Github, Star, Sparkles, Brain, Shield } from 'lucide-react';

const TEAM = [
    {
        name: 'Arkin Shinganapurkar',
        role: 'UI/UX Designer',
        initials: 'AS',
        gradient: 'from-sky-400 to-blue-500',
        contribution: 'UI/UX, Design, Research',
        badge: '🎨 Designer',
    },
    {
        name: 'Vinit Majethiya',
        role: 'FullStack Engineer',
        initials: 'VM',
        gradient: 'from-blue-400 to-indigo-500',
        contribution: 'Frontend, AI Features, Full Stack',
        badge: '⚙️ Developer',
    },
    {
        name: 'Akshay Teke',
        role: 'FullStack Engineer',
        initials: 'AT',
        gradient: 'from-indigo-400 to-violet-500',
        contribution: 'Research, Business Analysis, Frontend Design',
        badge: '⚙️ Developer',
    },
    {
        name: 'Rehan Jamadar',
        role: 'Fullstack Developer',
        initials: 'RJ',
        gradient: 'from-cyan-400 to-sky-500',
        contribution: 'Backend, System Architecture, Database',
        badge: '⚙️ Developer',
    },
];

const TIMELINE = [
    { time: 'Hour 0', event: 'Hackathon begins — Problem statement revealed', icon: '🚀' },
    { time: 'Hour 2', event: 'Idea finalized: Mental health platform for India', icon: '💡' },
    { time: 'Hour 6', event: 'Core architecture designed, repos set up', icon: '📐' },
    { time: 'Hour 16', event: 'AI chat, auth, and basic dashboard functional', icon: '⚡' },
    { time: 'Hour 28', event: 'Therapist portal, payments & communities added', icon: '🏗️' },
    { time: 'Hour 36', event: 'Landing page polished, crisis detection live', icon: '✨' },
    { time: 'Hour 48', event: 'Submitted & presented — Mindora is live!', icon: '🏆' },
];

const TECH = [
    { name: 'React + TypeScript', icon: '⚛️', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { name: 'Node.js + Express', icon: '🟢', color: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'MongoDB Atlas', icon: '🍃', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Google Gemini AI', icon: '✦', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Framer Motion', icon: '🎞️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Tailwind CSS', icon: '🎨', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { name: 'Socket.io', icon: '🔌', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { name: 'Razorpay', icon: '💳', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { name: 'JWT Auth', icon: '🔒', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Vite', icon: '⚡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

export const AboutUsPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white text-slate-800 antialiased overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
                            <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800">Mindora</span>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative py-24 overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50/40 to-white">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold mb-8">
                            <Trophy className="w-3.5 h-3.5" /> Built at a 24-Hour Hackathon
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                            Our Story
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Mindora was born from a single belief — that <strong className="text-slate-700">mental health support should be accessible to everyone</strong>, regardless of stigma, affordability, or geography.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Origin story */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-5">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-sky-600 bg-sky-100 px-3 py-1 rounded-full mb-5">The Spark</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-5 leading-tight">A problem we lived, not just studied</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                As engineering students, we watched classmates and friends struggle silently with anxiety, burnout, and depression — with no accessible, stigma-free way to seek help.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Existing platforms were either too expensive, required insurance, or lacked the anonymity that first-time help-seekers desperately needed.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                When our college announced a 24-hour hackathon, we knew exactly what we had to build. Four of us locked ourselves in a room, fuelled by coffee and purpose — and Mindora was born.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: Brain, text: '1 in 7 Indians experiences mental illness', color: 'text-sky-600', bg: 'bg-sky-50' },
                                { icon: Users, text: 'Only 3 psychiatrists per 10 lakh population', color: 'text-blue-600', bg: 'bg-blue-50' },
                                { icon: Shield, text: '80% who need help never seek it due to stigma', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: Sparkles, text: 'AI can bridge the gap — immediately & anonymously', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                            ].map(({ icon: Icon, text, color, bg }) => (
                                <div key={text} className={`flex items-center gap-4 ${bg} rounded-2xl p-4 border border-white/60`}>
                                    <Icon className={`w-5 h-5 ${color} shrink-0`} />
                                    <p className="text-sm font-semibold text-slate-700">{text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Hackathon timeline */}
            <section className="py-20 bg-gradient-to-b from-sky-50/60 to-white">
                <div className="max-w-4xl mx-auto px-5">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-sky-600 bg-sky-100 px-3 py-1 rounded-full mb-4">The Journey</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">24 Hours to Build Mindora</h2>
                    </div>
                    <div className="relative">
                        <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 to-indigo-400 md:left-1/2" />
                        <div className="space-y-8">
                            {TIMELINE.map((item, i) => (
                                <motion.div
                                    key={item.time}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`relative flex items-center gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-200/50 shrink-0 md:mx-auto md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
                                        {item.icon}
                                    </div>
                                    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1 md:max-w-[42%] ${i % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                                        <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">{item.time}</span>
                                        <p className="text-sm font-semibold text-slate-800 mt-2">{item.event}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-5">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-sky-600 bg-sky-100 px-3 py-1 rounded-full mb-4">The Builders</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Meet the Team</h2>
                        <p className="text-slate-500">Four students, one mission — 24 sleepless hours and a lot of chai.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TEAM.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-sky-100/60 hover:border-sky-200 hover:-translate-y-1.5 transition-all duration-300 text-center"
                            >
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                                    {member.initials}
                                </div>
                                <span className="inline-block text-xs font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full mb-3">{member.badge}</span>
                                <h3 className="font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-sky-600 text-xs font-semibold mb-3">{member.role}</p>
                                <p className="text-slate-500 text-xs leading-relaxed">{member.contribution}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech stack */}
            <section className="py-20 bg-gradient-to-b from-sky-50/60 to-white">
                <div className="max-w-4xl mx-auto px-5">
                    <div className="text-center mb-12">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-sky-600 bg-sky-100 px-3 py-1 rounded-full mb-4">Technology</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built With</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {TECH.map((t) => (
                            <span key={t.name} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${t.color}`}>
                                <span>{t.icon}</span>{t.name}
                            </span>
                        ))}
                    </div>
                    <div className="mt-16 flex items-center gap-6 justify-center text-sm text-slate-400">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-sky-600 transition-colors font-medium">
                            <Github className="w-4 h-4" /> View on GitHub
                        </a>
                        <span>·</span>
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>Hackathon Project 2026</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600">
                <div className="max-w-3xl mx-auto px-5 text-center">
                    <Zap className="w-10 h-10 text-sky-200 mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                        Ready to experience Mindora?
                    </h2>
                    <p className="text-sky-100 text-lg mb-8">Start anonymous, no account needed.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/bot/public')} className="px-7 py-3.5 bg-white text-blue-600 rounded-2xl font-bold text-sm hover:bg-sky-50 transition-all shadow-lg flex items-center justify-center gap-2">
                            <Brain className="w-4 h-4" /> Try AI Chat Now
                        </button>
                        <button onClick={() => navigate('/onboarding')} className="px-7 py-3.5 border-2 border-white/40 text-white rounded-2xl font-bold text-sm hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                            <Heart className="w-4 h-4" /> Create Account
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 py-8">
                <div className="max-w-4xl mx-auto px-5 text-center text-slate-500 text-sm">
                    © 2026 Mindora — Built with ❤️ at a 24-hour hackathon.
                    <button onClick={() => navigate('/')} className="text-sky-400 hover:underline ml-2">Back to Homepage</button>
                </div>
            </footer>
        </div>
    );
};