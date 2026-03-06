import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, MessageCircle, Users, ArrowRight, CheckCircle, Star, Sparkles } from 'lucide-react';
import { BotWidget } from '../components/BotWidget';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50 font-sans text-primary-900">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-40 border-b border-primary-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-2 rounded-lg shadow-md">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-heading text-primary-900 tracking-tight">Mindora</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-primary-700 transition-colors">Features</a>
                            <a href="#safety" className="text-gray-600 hover:text-primary-700 transition-colors">Safety</a>
                            <a href="#about" className="text-gray-600 hover:text-primary-700 transition-colors">About</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login/therapist')}
                                className="text-primary-600 hover:text-primary-800 font-medium transition-colors flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Therapist Login
                            </button>
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="text-secondary-600 hover:text-secondary-800 font-medium transition-colors flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Admin Portal
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-40"
                ></motion.div>
                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, 20, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-40"
                ></motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8 border border-primary-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
                            </span>
                            Anonymous Support Available 24/7
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading text-primary-900 tracking-tight mb-8 leading-tight">
                            Find Your Peace,{' '}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                                Without Judgment
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Start your journey with anonymous AI support. No sign-up, no pressure.
                            Just a safe space to express yourself, anytime you need it.
                        </p>

                        {/* Patient & Explore Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="px-8 py-4 bg-primary-600 text-white rounded-full font-semibold text-lg hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Start Anonymous Chat <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/login/patient')}
                                className="px-8 py-4 bg-transparent text-primary-700 border-2 border-primary-400 rounded-full font-semibold text-lg hover:bg-primary-50 transition-all hover:border-primary-500 flex items-center justify-center gap-2"
                            >
                                Explore More
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600 font-medium flex-wrap">
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary-600" /> 100% Anonymous</div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary-600" /> Zero Latency Crisis Detection</div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary-600" /> HIPAA Compliant</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-heading text-primary-900 mb-4">Designed for Your Safety</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our platform combines empathetic AI with real-time crisis intervention to ensure you always have support when you need it most.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MessageCircle className="w-8 h-8 text-white" />,
                                title: "Anonymous AI Support",
                                desc: "No account required. Start chatting immediately with our trauma-informed AI that never judges, never rushes you.",
                                color: "bg-primary-600"
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-white" />,
                                title: "Instant Crisis Detection",
                                desc: "AI analyzes every message in <300ms. If crisis is detected, therapists are notified instantly—no delays, no waiting.",
                                color: "bg-secondary-600"
                            },
                            {
                                icon: <Users className="w-8 h-8 text-white" />,
                                title: "Real Therapist Backup",
                                desc: "When you need human support, licensed therapists receive emergency alerts and can join within 5 minutes.",
                                color: "bg-danger-600"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-neutral-50 border-2 border-primary-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-heading text-primary-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-24 bg-primary-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Simple Process</span>
                        <h2 className="text-4xl font-heading text-primary-900 mb-4">How Mindora Works</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Start feeling better in three simple steps. We've removed all the friction so you can focus on your well-being.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (hidden on mobile) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-200 via-secondary-300 to-primary-200 -z-10 -translate-y-1/2"></div>

                        {[
                            { step: "01", title: "Share Anonymously", desc: "Start chatting immediately. No account needed, no questions asked. Just a safe space to vent.", icon: <MessageCircle className="w-6 h-6 text-primary-600" /> },
                            { step: "02", title: "AI-Powered Empathy", desc: "Our trauma-informed AI listens, understands, and provides immediate, comforting responses tailored to your emotional state.", icon: <Sparkles className="w-6 h-6 text-secondary-600" /> },
                            { step: "03", title: "Human Connection", desc: "When simply venting isn't enough, connect securely with licensed therapists who are ready to help.", icon: <Users className="w-6 h-6 text-emerald-600" /> }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary-100 hover:-translate-y-2 transition-transform duration-300 relative z-10 h-full">
                                    <div className="absolute -top-6 left-8 w-12 h-12 bg-white rounded-2xl shadow-lg border border-primary-50 flex items-center justify-center font-black text-xl text-primary-300 transform -rotate-6 group-hover:rotate-0 transition-transform">
                                        {item.step}
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-6 mt-2 border border-slate-100">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-primary-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Mission</span>
                        <h2 className="text-3xl md:text-4xl font-heading text-primary-900 mb-6">About Mindora</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Mindora was built on the belief that everyone deserves immediate, compassionate, and stigma-free mental health support. We blend the instant accessibility of empathetic AI with the profound expertise of licensed human therapists. Our platform ensures that whether you need to just vent anonymously at 3 AM or seek ongoing professional therapy, you have a safe, secure, and judgment-free space to heal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mindora vs Traditional Therapy Section */}
            <div className="py-24 bg-primary-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Us</span>
                        <h2 className="text-3xl md:text-4xl font-heading text-primary-900 mb-6">Mindora vs. Traditional Therapy</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            See how we are redefining mental healthcare accessibility, responsiveness, and continuous support.
                        </p>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse bg-white rounded-3xl overflow-hidden shadow-xl border border-primary-100 min-w-[800px]">
                            <thead>
                                <tr className="bg-primary-600 text-white font-heading">
                                    <th className="p-6 text-lg font-semibold w-1/3">Feature</th>
                                    <th className="p-6 text-lg font-semibold w-1/3 border-l border-primary-500">Mindora</th>
                                    <th className="p-6 text-lg font-semibold w-1/3 border-l border-primary-500">Traditional Therapy</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 divide-y divide-primary-100">
                                <tr className="hover:bg-primary-50 transition-colors">
                                    <td className="p-6 font-medium text-primary-900">Availability</td>
                                    <td className="p-6 border-l border-primary-100">
                                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-600 shrink-0" /> 24/7 Instant AI & Therapist Access</div>
                                    </td>
                                    <td className="p-6 border-l border-primary-100">Scheduled appointments only</td>
                                </tr>
                                <tr className="hover:bg-primary-50 transition-colors bg-neutral-50">
                                    <td className="p-6 font-medium text-primary-900">Response Time</td>
                                    <td className="p-6 border-l border-primary-100">
                                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-600 shrink-0" /> &lt; 1 second (AI), Minutes (Emergency)</div>
                                    </td>
                                    <td className="p-6 border-l border-primary-100">Days or weeks</td>
                                </tr>
                                <tr className="hover:bg-primary-50 transition-colors">
                                    <td className="p-6 font-medium text-primary-900">Anonymity</td>
                                    <td className="p-6 border-l border-primary-100">
                                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-600 shrink-0" /> 100% Anonymous Chat available</div>
                                    </td>
                                    <td className="p-6 border-l border-primary-100">Full identity disclosure required</td>
                                </tr>
                                <tr className="hover:bg-primary-50 transition-colors bg-neutral-50">
                                    <td className="p-6 font-medium text-primary-900">Crisis Detection</td>
                                    <td className="p-6 border-l border-primary-100">
                                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-600 shrink-0" /> Real-time active ML scanning</div>
                                    </td>
                                    <td className="p-6 border-l border-primary-100">Only during scheduled 1-hour sessions</td>
                                </tr>
                                <tr className="hover:bg-primary-50 transition-colors">
                                    <td className="p-6 font-medium text-primary-900">Community Support</td>
                                    <td className="p-6 border-l border-primary-100">
                                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-600 shrink-0" /> Integrated "Pods" system</div>
                                    </td>
                                    <td className="p-6 border-l border-primary-100">Usually separate or unavailable</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Therapist Spotlight */}
            <div className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Professionals</span>
                            <h2 className="text-4xl font-heading text-primary-900 mb-4">Meet Your Support System</h2>
                            <p className="text-lg text-gray-600">
                                Licensed, experienced, and deeply empathetic. Our network of therapists is here to guide you through your journey.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login/patient')}
                            className="bg-primary-50 text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-100 transition-colors whitespace-nowrap"
                        >
                            Browse All Therapists
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Dr. Sarah Jenkins", role: "Clinical Psychologist", exp: "15+ years exp", rating: 4.9, img: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=eff6ff&color=3b82f6&size=150" },
                            { name: "Michael Chen, LCSW", role: "Anxiety & Stress", exp: "8+ years exp", rating: 4.8, img: "https://ui-avatars.com/api/?name=Michael+Chen&background=fce7f3&color=db2777&size=150" },
                            { name: "Dr. Emily Rostova", role: "Trauma Specialist", exp: "12+ years exp", rating: 5.0, img: "https://ui-avatars.com/api/?name=Emily+Rostova&background=ccfbf1&color=0d9488&size=150" }
                        ].map((therapist, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-2xl hover:border-primary-200 transition-all duration-300 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={therapist.img} alt={therapist.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                    <div>
                                        <h3 className="font-bold text-lg text-primary-900 leading-tight">{therapist.name}</h3>
                                        <p className="text-primary-600 font-medium text-sm mb-1">{therapist.role}</p>
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            {therapist.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">{therapist.exp}</span>
                                    <button className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">View Profile &rarr;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div id="safety" className="py-24 bg-gradient-to-r from-primary-900 to-secondary-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[128px] opacity-20"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600 rounded-full blur-[128px] opacity-20"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl font-heading text-white mb-6">You don't have to face this alone.</h2>
                    <p className="text-xl text-primary-200 mb-10">
                        Over 10,000 anonymous conversations started. Zero judgment, maximum support.
                    </p>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="px-10 py-4 bg-white text-primary-900 rounded-full font-semibold text-lg hover:bg-primary-50 transition-all shadow-lg hover:scale-105"
                    >
                        Start Your Anonymous Chat
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-primary-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-900 p-1.5 rounded-lg">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-heading text-primary-900">Mindora</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2026 Mindora support for everyone.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">Crisis Helplines</a>
                    </div>
                </div>
            </footer>

            {/* Public AI Chat Widget */}
            <BotWidget />
        </div>
    );
};
