import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    Heart,
    Shield,
    MessageCircle,
    Users,
    ArrowRight,
    CheckCircle,
    Star,
    Sparkles,
    Brain,
    Wind,
    ChevronRight,
    Menu,
    X,
    Calendar,
    Lock,
    Zap,
    Award,
    Clock,
    Play,
} from 'lucide-react';
import { BotWidget } from '../components/BotWidget';

/* ──────────────────────────────────────────────
   Utility: Fade-in-up on scroll
────────────────────────────────────────────── */
const FadeUp: React.FC<{
    children: React.ReactNode;
    delay?: number;
    className?: string;
}> = ({ children, delay = 0, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ──────────────────────────────────────────────
   Utility: Animated counter
────────────────────────────────────────────── */
const Counter: React.FC<{ end: number; suffix?: string }> = ({ end, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let current = 0;
        const increment = end / 80;
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 25);
        return () => clearInterval(timer);
    }, [inView, end]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ──────────────────────────────────────────────
   Data
────────────────────────────────────────────── */
const STATS = [
    { icon: Users, label: 'Sessions Completed', value: 12000, suffix: '+', color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: Award, label: 'Satisfaction Rate', value: 98, suffix: '%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Brain, label: 'Licensed Therapists', value: 320, suffix: '+', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: Clock, label: 'Avg. First Response', value: 5, suffix: 'min', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const FEATURES = [
    {
        icon: MessageCircle,
        title: '1-on-1 Therapy',
        desc: 'Private, secure video and text sessions with licensed therapists, scheduled entirely on your terms.',
        pill: 'Most popular',
        pillColor: 'bg-blue-100 text-blue-700',
        gradient: 'from-sky-400 to-blue-500',
        link: 'Book a session',
    },
    {
        icon: Wind,
        title: 'Guided Meditation',
        desc: 'Science-backed breathing and mindfulness sessions that reduce anxiety and restore calm in minutes.',
        pill: 'Free to try',
        pillColor: 'bg-cyan-100 text-cyan-700',
        gradient: 'from-cyan-400 to-sky-500',
        link: 'Explore exercises',
    },
    {
        icon: Users,
        title: 'Community Support',
        desc: 'Safe, moderated peer groups where others truly understand. Share, listen, and grow together.',
        pill: 'Anonymous',
        pillColor: 'bg-indigo-100 text-indigo-700',
        gradient: 'from-blue-400 to-indigo-500',
        link: 'Join a group',
    },
];

const STEPS = [
    {
        step: '01', icon: MessageCircle, color: 'from-sky-400 to-blue-500',
        title: 'Start Anonymously',
        desc: 'No account, no pressure. Open a chat and begin talking — a safe space is ready instantly.',
    },
    {
        step: '02', icon: Sparkles, color: 'from-blue-400 to-indigo-500',
        title: 'AI Listens & Responds',
        desc: 'Our empathetic AI understands your emotional state and guides you with comforting, helpful responses.',
    },
    {
        step: '03', icon: Calendar, color: 'from-indigo-400 to-violet-500',
        title: 'Book a Therapist',
        desc: "When you're ready for human support, book a free 30-min consultation with a licensed therapist.",
    },
];

const THERAPISTS = [
    { name: 'Dr. Sarah Jenkins', role: 'Clinical Psychologist', exp: '15+ yrs', rating: 4.9, initials: 'SJ', gradient: 'from-sky-400 to-blue-500', specialties: ['Anxiety', 'Depression', 'CBT'] },
    { name: 'Michael Chen, LCSW', role: 'Anxiety & Stress', exp: '8+ yrs', rating: 4.8, initials: 'MC', gradient: 'from-blue-400 to-indigo-500', specialties: ['Stress', 'Burnout', 'Mindfulness'] },
    { name: 'Dr. Emily Rostova', role: 'Trauma Specialist', exp: '12+ yrs', rating: 5.0, initials: 'ER', gradient: 'from-cyan-400 to-sky-500', specialties: ['Trauma', 'PTSD', 'EMDR'] },
];

/* ── Orb icon nodes config ── */
const ORB_NODES = [
    { Icon: Brain, angle: 0, gradient: 'from-sky-400 to-blue-500', label: 'AI Support' },
    { Icon: Shield, angle: 60, gradient: 'from-blue-400 to-indigo-500', label: 'Safe Space' },
    { Icon: MessageCircle, angle: 120, gradient: 'from-indigo-400 to-violet-500', label: 'Chat' },
    { Icon: Wind, angle: 180, gradient: 'from-cyan-400 to-sky-500', label: 'Meditation' },
    { Icon: Users, angle: 240, gradient: 'from-sky-500 to-blue-600', label: 'Community' },
    { Icon: Sparkles, angle: 300, gradient: 'from-blue-500 to-indigo-600', label: 'Wellness' },
];

const NAV_LINKS = [
    { label: 'Services', href: '#features' },
    { label: 'About Us', href: '/about', isRoute: true },
];

/* ──────────────────────────────────────────────
   Main Component
────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 18);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-800 antialiased overflow-x-hidden">

            {/* ════════════════════ NAVBAR ════════════════════ */}
            <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 group">
                        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform drop-shadow-[0_2px_4px_rgba(14,165,233,0.3)]">
                            <img src="/logo.png" alt="Mindora Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Mindora</span>
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((l) =>
                            l.isRoute ? (
                                <button
                                    key={l.label}
                                    onClick={() => navigate(l.href)}
                                    className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
                                >
                                    {l.label}
                                </button>
                            ) : (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
                                >
                                    {l.label}
                                </a>
                            )
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/login/therapist')} 
                            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-2 flex items-center gap-1.5 border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 rounded-lg group"
                        >
                            <Brain className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            For Therapists
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button onClick={() => navigate('/login/patient')} className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors px-4 py-2">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/onboarding')} className="text-sm font-semibold px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5">
                            Get Started <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-5 shadow-xl">
                        {NAV_LINKS.map((l) =>
                            l.isRoute ? (
                                <button
                                    key={l.label}
                                    onClick={() => {
                                        navigate(l.href);
                                        setMenuOpen(false);
                                    }}
                                    className="text-left text-base font-medium text-slate-700 hover:text-sky-600"
                                >
                                    {l.label}
                                </button>
                            ) : (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-base font-medium text-slate-700 hover:text-sky-600"
                                >
                                    {l.label}
                                </a>
                            )
                        )}
                        <button 
                            onClick={() => {
                                navigate('/login/therapist');
                                setMenuOpen(false);
                            }}
                            className="w-full py-3 border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                        >
                            <Brain className="w-5 h-5" /> Therapist Portal
                        </button>
                        <button onClick={() => navigate('/onboarding')} className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold">
                            Get Started
                        </button>
                    </motion.div>
                )}
            </nav>

            {/* ════════════════════ HERO ════════════════════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white -z-10" />
                <div
                    className="absolute inset-0 -z-10 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                        backgroundSize: '64px 64px',
                    }}
                />
                <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-sky-200/60 to-blue-100/40 rounded-full blur-3xl -z-10" />
                <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/50 to-sky-100/30 rounded-full blur-3xl -z-10" />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-16 items-center pt-20 pb-24">

                    {/* ── Left copy ── */}
                    <div>
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold mb-8 tracking-wide">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-600" />
                            </span>
                            Anonymous Support · Available 24/7
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.07] tracking-tight mb-6">
                            Your mind<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500">deserves care.</span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }} className="text-lg text-slate-500 max-w-lg leading-relaxed mb-10">
                            Mindora connects you with licensed therapists, guided wellness tools, and a compassionate community — all in one private, judgment-free space.
                        </motion.p>

                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }} className="flex flex-col sm:flex-row gap-3 mb-12">
                            <button onClick={() => navigate('/onboarding')} className="group px-7 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-semibold text-base hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                Get Started — it's free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/bot/public')} className="px-7 py-3.5 border-2 border-slate-200 text-slate-700 bg-white rounded-2xl font-semibold text-base hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center gap-2">
                                <Play className="w-4 h-4" />
                                Try AI Chat
                            </button>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }} className="flex flex-wrap gap-5 text-sm text-slate-500 font-medium">
                            {[
                                { icon: Lock, text: 'HIPAA Compliant' },
                                { icon: CheckCircle, text: '100% Anonymous' },
                                { icon: Zap, text: 'Crisis Detection < 300ms' },
                            ].map(({ icon: Icon, text }) => (
                                <span key={text} className="flex items-center gap-1.5">
                                    <Icon className="w-4 h-4 text-sky-500" />
                                    {text}
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Right: Abstract orb ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:flex items-center justify-center"
                    >
                        <div className="relative w-[480px] h-[480px] flex items-center justify-center">

                            {/* Outer ambient glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-300/30 via-blue-200/20 to-indigo-200/20 blur-3xl scale-110" />

                            {/* Concentric rotating rings */}
                            {[
                                { size: 440, dur: 28, opacity: 'opacity-[0.18]', border: 'border-sky-300' },
                                { size: 360, dur: 22, opacity: 'opacity-25', border: 'border-blue-300' },
                                { size: 280, dur: 16, opacity: 'opacity-30', border: 'border-sky-400' },
                                { size: 200, dur: 10, opacity: 'opacity-40', border: 'border-blue-400' },
                            ].map((ring, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                    transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}
                                    className={`absolute rounded-full border-2 ${ring.border} ${ring.opacity}`}
                                    style={{ width: ring.size, height: ring.size }}
                                />
                            ))}

                            {/* Central glowing orb */}
                            <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-2xl shadow-blue-400/50 flex items-center justify-center">
                                {/* Inner glass shine */}
                                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/35 to-transparent" />
                                {/* Pulsing ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-full bg-sky-400"
                                />
                                {/* Icon */}
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative z-10 w-20 h-20"
                                >
                                    <img src="/logo.png" alt="Mindora" className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" />
                                </motion.div>
                            </div>

                            {/* Orbiting icon nodes — outer div positions, inner motion.div floats */}
                            {ORB_NODES.map(({ Icon, angle, gradient, label }, i) => {
                                const rad = (angle * Math.PI) / 180;
                                const x = Math.cos(rad) * 170;
                                const y = Math.sin(rad) * 170;
                                return (
                                    <div
                                        key={i}
                                        className="absolute z-20"
                                        style={{
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                                            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                                            className="flex flex-col items-center gap-1.5"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-blue-200/60`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-blue-50 whitespace-nowrap">
                                                {label}
                                            </span>
                                        </motion.div>
                                    </div>
                                );
                            })}

                            {/* Decorative floating dots */}
                            {[
                                { x: -205, y: -65, size: 8, color: 'bg-sky-300', dur: 4 },
                                { x: 195, y: -105, size: 6, color: 'bg-blue-400', dur: 5.5 },
                                { x: -165, y: 145, size: 10, color: 'bg-indigo-300', dur: 3.5 },
                                { x: 175, y: 105, size: 7, color: 'bg-cyan-400', dur: 6 },
                            ].map((dot, i) => (
                                <div
                                    key={i}
                                    className="absolute"
                                    style={{
                                        width: dot.size,
                                        height: dot.size,
                                        left: `calc(50% + ${dot.x}px)`,
                                        top: `calc(50% + ${dot.y}px)`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0], opacity: [0.5, 0.9, 0.5] }}
                                        transition={{ duration: dot.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                                        className={`w-full h-full rounded-full ${dot.color}`}
                                    />
                                </div>
                            ))}

                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400">
                    <div className="w-5 h-8 border-2 border-slate-200 rounded-full flex justify-center pt-1.5">
                        <div className="w-1 h-2 bg-sky-400 rounded-full animate-bounce" />
                    </div>
                </motion.div>
            </section>

            {/* ════════════════════ STATS ROW ════════════════════ */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <FadeUp key={s.label} delay={i * 0.1} className="text-center">
                                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                                    <Icon className={`w-6 h-6 ${s.color}`} />
                                </div>
                                <p className={`text-3xl font-extrabold ${s.color} mb-1`}>
                                    <Counter end={s.value} suffix={s.suffix} />
                                </p>
                                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                            </FadeUp>
                        );
                    })}
                </div>
            </section>

            {/* ════════════════════ FEATURES ════════════════════ */}
            <section id="features" className="py-28 bg-gradient-to-b from-white to-sky-50/40">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                    <FadeUp className="text-center mb-16">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.22em] text-sky-600 bg-sky-100 px-4 py-1.5 rounded-full mb-4">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Everything you need to thrive</h2>
                        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">From personalised therapy to guided mindfulness — world-class mental wellness tools, all in one place.</p>
                    </FadeUp>

                    <div className="grid md:grid-cols-3 gap-7">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <FadeUp key={f.title} delay={i * 0.12}>
                                    <div className="group relative bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-sky-100/60 hover:border-sky-200 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                                        <span className={`self-start text-xs font-bold px-3 py-1 rounded-full mb-5 ${f.pillColor}`}>{f.pill}</span>
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                        <p className="text-slate-500 leading-relaxed text-sm flex-1">{f.desc}</p>
                                        <button onClick={() => navigate('/onboarding')} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-blue-700 transition-colors group/btn">
                                            {f.link} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </FadeUp>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ════════════════════ HOW IT WORKS ════════════════════ */}
            <section id="how" className="py-28 bg-sky-50/60">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                    <FadeUp className="text-center mb-20">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.22em] text-sky-600 bg-sky-100 px-4 py-1.5 rounded-full mb-4">Simple Process</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Start healing in 3 steps</h2>
                        <p className="text-lg text-slate-500 max-w-lg mx-auto">No referrals, no waiting lists. You're one click away from feeling better.</p>
                    </FadeUp>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300" />
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <FadeUp key={s.step} delay={i * 0.15}>
                                    <div className="relative bg-white rounded-3xl p-8 shadow-md shadow-slate-100/80 border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 h-full">
                                        <div className={`absolute -top-5 left-8 w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-sm font-black shadow-md`}>{s.step}</div>
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mt-3 mb-5 shadow-md`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">{s.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                </FadeUp>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ════════════════════ TRUST SIGNALS ════════════════════ */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
                    <FadeUp>
                        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-12">Trusted & Featured In</p>
                    </FadeUp>
                    <div className="flex flex-wrap items-center justify-center gap-10 mb-16">
                        {['MindBridge', 'HealPath', 'SereneCare', 'TherapyHub', 'WellNest', 'CalmSpace'].map((name, i) => (
                            <FadeUp key={name} delay={i * 0.07}>
                                <span className="text-base font-bold text-slate-300 hover:text-slate-500 transition-colors tracking-tight cursor-default">{name}</span>
                            </FadeUp>
                        ))}
                    </div>
                    <FadeUp>
                        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-10 border border-sky-100">
                            <div className="flex justify-center gap-0.5 mb-5">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <blockquote className="text-xl text-slate-700 font-medium leading-relaxed mb-6">
                                "Mindora helped me take my first step when I couldn't talk to anyone else. It felt completely safe and non-judgmental."
                            </blockquote>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">P</div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-800">Priya M.</p>
                                    <p className="text-xs text-slate-400">Verified User</p>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ════════════════════ COMPARISON TABLE ════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
                    <FadeUp className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Mindora vs. Traditional Therapy</h2>
                    </FadeUp>

                    <FadeUp>
                        <div className="relative">
                            {/* Table Header */}
                            <div className="grid grid-cols-3 mb-4">
                                <div /> {/* Empty top-left cell */}
                                {/* Mindora Column Header */}
                                <div className="flex justify-center z-10 relative">
                                    <div className="w-full flex flex-col items-center justify-center py-4 bg-white rounded-t-2xl border-x-2 border-t-2 border-sky-400 shadow-[0_-8px_20px_-10px_rgba(14,165,233,0.3)]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Brain className="w-6 h-6 text-sky-500" />
                                            <span className="font-bold text-slate-900">Mindora</span>
                                        </div>
                                    </div>
                                </div>
                                <div /> {/* Empty top-right cell */}
                            </div>

                            {/* Table Rows */}
                            <div className="relative border-b border-slate-200">
                                {/* The highlighted blue column background for Mindora */}
                                <div className="absolute top-0 bottom-0 left-1/3 w-1/3 bg-sky-500 rounded-b-xl border-x-2 border-b-2 border-sky-500 z-0 shadow-xl shadow-sky-500/20" />

                                <div className="relative z-10 divide-y divide-slate-200/50">
                                    {/* Row 1 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Safe &amp; Confidential</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                HIPAA/GDPR compliant
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                Confidential but location-based
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Licensed &amp; Verified Therapists</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                Verified professionals only
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="#FBBF24" className="w-5 h-5"><path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg></div>
                                                May vary, requires manual verification
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Judgment-Free Environment</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                Anonymous &amp; stigma-free
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="#FBBF24" className="w-5 h-5"><path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg></div>
                                                Face-to-face, may feel judgmental
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 4 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Holistic Approach</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50 leading-tight">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 shrink-0 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <span className="text-center">AI chatbot + Human<br />therapist support</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                                                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                                Only human guidance
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 5 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Accessibility</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 shrink-0 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                Anytime, anywhere via app
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center shrink-0">
                                                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                                Limited to office hours &amp; location
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 6 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px] border-b border-sky-200">Cost-Effective</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white border-b border-sky-400/50 leading-tight">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 shrink-0 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <span className="text-center">Flexible plans, lower<br />cost</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600 border-b border-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                                                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                                Higher session fees
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 7 */}
                                    <div className="grid grid-cols-3 items-stretch">
                                        <div className="flex items-center py-5 pr-6 font-bold text-slate-700 text-[15px]">Progress Tracking</div>
                                        <div className="flex flex-col justify-center py-5 px-4 text-center text-sm font-bold text-white leading-tight">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 shrink-0 bg-[#76E85C] rounded-sm flex items-center justify-center border border-[#68DB50]">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <span className="text-center">Digital dashboard &amp;<br />insights</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center py-5 pl-8 text-sm font-bold text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                                                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                                Manual or therapist-only notes
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ════════════════════ THERAPIST CARDS ════════════════════ */}
            <section className="py-28 bg-gradient-to-b from-sky-50/40 to-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-14">
                        <FadeUp className="max-w-xl">
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.22em] text-sky-600 bg-sky-100 px-4 py-1.5 rounded-full mb-4">Our Professionals</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Meet your support team</h2>
                            <p className="text-slate-500 leading-relaxed">Every therapist on Mindora is licensed, verified, and deeply committed to your well-being.</p>
                        </FadeUp>
                        <FadeUp>
                            <button onClick={() => navigate('/login/patient')} className="shrink-0 px-6 py-3 border-2 border-sky-500 text-sky-600 rounded-2xl font-semibold text-sm hover:bg-sky-500 hover:text-white transition-all">
                                Browse All Therapists
                            </button>
                        </FadeUp>
                    </div>

                    <div className="grid md:grid-cols-3 gap-7">
                        {THERAPISTS.map((t, i) => (
                            <FadeUp key={t.name} delay={i * 0.1}>
                                <div className="group bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-sky-100/50 hover:border-sky-200 hover:-translate-y-1.5 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xl font-extrabold shadow-md group-hover:scale-105 transition-transform`}>{t.initials}</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">{t.name}</h3>
                                            <p className="text-sky-600 text-sm font-medium mt-0.5">{t.role}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold text-slate-600">{t.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {t.specialties.map((sp) => (
                                            <span key={sp} className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">{sp}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">{t.exp} experience</span>
                                        <button onClick={() => navigate('/login/patient')} className="flex items-center gap-1 text-sm font-bold text-sky-600 hover:text-blue-700 transition-colors">
                                            Book session <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════ CTA ════════════════════ */}
            <section className="py-28 relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl z-0" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl z-0" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-300/20 rounded-full blur-2xl z-0" />

                <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
                    <FadeUp>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-8 tracking-wide border border-white/20 backdrop-blur-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            Free First Consultation · No Credit Card Required
                        </div>
                        <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                            You don't have to<br />
                            <span className="text-sky-200">face this alone.</span>
                        </h2>
                        <p className="text-xl text-sky-100 mb-10 max-w-xl mx-auto leading-relaxed">
                            Book a free 30-minute consultation with a licensed therapist. Private, confidential, and available today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => navigate('/onboarding')} className="group px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-sky-50 transition-all shadow-2xl shadow-blue-900/20 hover:-translate-y-1 flex items-center justify-center gap-2">
                                Book Free Consultation
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/bot/public')} className="px-8 py-4 border-2 border-white/40 text-white rounded-2xl font-bold text-base hover:bg-white/15 hover:border-white/60 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Chat Anonymously
                            </button>
                        </div>
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-7 text-sky-200/80 text-xs font-semibold">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />No credit card required</span>
                            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" />100% confidential</span>
                            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" />HIPAA Compliant</span>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ════════════════════ FOOTER ════════════════════ */}
            <footer className="bg-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 flex items-center justify-center drop-shadow-md">
                                    <img src="/logo.png" alt="Mindora Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-bold text-white">Mindora</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">Compassionate mental health support for everyone. Private, secure, and always available.</p>
                            <div className="flex gap-3">
                                {[{ label: 'Therapist Login', path: '/login/therapist' }, { label: 'Admin Portal', path: '/admin/login' }].map((l) => (
                                    <button key={l.label} onClick={() => navigate(l.path)} className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700">
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-3">
                                <li><button onClick={() => navigate('/login/patient')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Find Therapists</button></li>
                                <li><button onClick={() => navigate('/bot/public')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Anonymous Chat</button></li>
                                <li><button onClick={() => navigate('/onboarding')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Guided Meditation</button></li>
                                <li><button onClick={() => navigate('/crisis-helplines')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Crisis Support</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-wider">Company</h4>
                            <ul className="space-y-3">
                                <li><button onClick={() => navigate('/about')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">About Us</button></li>
                                <li><button onClick={() => navigate('/privacy')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Privacy Policy</button></li>
                                <li><button onClick={() => navigate('/terms')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Terms of Service</button></li>
                                <li><button onClick={() => navigate('/crisis-helplines')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Crisis Helplines</button></li>
                                <li><button onClick={() => navigate('/contact')} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Contact Us</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <span>© 2026 Mindora. Mental health support for everyone.</span>
                        <span className="flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 text-sky-400 fill-sky-400 mx-0.5" /> for those who need it most</span>
                    </div>
                </div>
            </footer>

            <BotWidget />
        </div>
    );
};