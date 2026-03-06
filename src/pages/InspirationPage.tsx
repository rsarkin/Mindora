import React, { useState, useEffect } from 'react';
import { Wind, Sun, Moon, Cloud, Quote, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const QUOTES = [
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "You are enough just as you are.", author: "Meghan Markle" },
    { text: "Breath is the bridge which connects life to consciousness.", author: "Thich Nhat Hanh" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Happiness depends upon ourselves.", author: "Aristotle" }
];

export const InspirationPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quote, setQuote] = useState(QUOTES[0]);
    const [greeting, setGreeting] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    useEffect(() => {
        // Set random quote
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuote(QUOTES[randomIndex]);

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        return () => { };
    }, []);

    return (
        <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="text-center space-y-4 animate-fade-in">
                    <div className="flex justify-center mb-4">
                        {greeting.includes('Morning') ? (
                            <Sun className="w-12 h-12 text-amber-400" />
                        ) : greeting.includes('Afternoon') ? (
                            <Cloud className="w-12 h-12 text-blue-400" />
                        ) : (
                            <Moon className="w-12 h-12 text-indigo-400" />
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-800 tracking-tight">
                        {greeting}, {user?.name?.split(' ')[0] || 'Friend'}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </header>

                {/* Quote Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/50 relative overflow-hidden transition-all hover:shadow-2xl hover:bg-white/90">
                    <Quote className="absolute top-6 left-6 w-12 h-12 text-teal-100 -z-10" />
                    <figure className="text-center space-y-6">
                        <blockquote className="text-2xl md:text-3xl font-light text-slate-700 leading-relaxed italic">
                            "{quote.text}"
                        </blockquote>
                        <figcaption className="text-teal-600 font-medium tracking-wide uppercase text-sm">
                            — {quote.author}
                        </figcaption>
                    </figure>
                </div>

                {/* Breathing Exercise Link */}
                <div
                    onClick={() => navigate('/breathing')}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 shadow-lg text-white cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Wind className="w-6 h-6 text-teal-100" />
                                <h3 className="font-bold text-xl tracking-wide">Breathing Space</h3>
                            </div>
                            <p className="text-teal-50 max-w-md">
                                Discover professional breathing techniques like Box Breathing and 4-7-8 Relaxation to calm your mind.
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Mood Check-in Widget */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                    <h3 className="text-center text-slate-600 font-medium uppercase tracking-widest text-sm mb-8">How are you feeling today?</h3>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        {[
                            { label: 'Great', emoji: '😄', color: 'bg-green-100 text-green-600 hover:bg-green-200', ring: 'ring-green-400' },
                            { label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200', ring: 'ring-blue-400' },
                            { label: 'Okay', emoji: '😐', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200', ring: 'ring-slate-400' },
                            { label: 'Low', emoji: '😔', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200', ring: 'ring-orange-400' },
                            { label: 'Bad', emoji: '😫', color: 'bg-red-100 text-red-600 hover:bg-red-200', ring: 'ring-red-400' },
                        ].map((mood) => (
                            <button
                                key={mood.label}
                                onClick={() => {
                                    setSelectedMood(mood.label);
                                    // In a real app, this would save to the backend
                                    console.log(`Mood selected: ${mood.label}`);
                                }}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all transform hover:scale-110 ${mood.color} ${selectedMood === mood.label ? `ring-4 ${mood.ring} scale-110 shadow-lg` : 'opacity-80 hover:opacity-100'
                                    }`}
                            >
                                <span className="text-4xl">{mood.emoji}</span>
                                <span className="text-sm font-medium">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                    {selectedMood && (
                        <p className="text-center text-slate-500 mt-6 animate-fade-in">
                            Thanks for checking in! We've logged that you're feeling <span className="font-medium text-slate-800">{selectedMood.toLowerCase()}</span>.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};
