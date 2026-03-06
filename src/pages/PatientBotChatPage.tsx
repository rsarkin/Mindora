import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';

interface BotMessage {
    _id: string;
    sender: 'user' | 'bot';
    content: string;
    createdAt: string;
    metadata?: {
        action?: string;
        suggestions?: string[];
    };
}

export const BotChatPage: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<BotMessage[]>([{
        _id: 'init-0',
        sender: 'bot',
        content: "Hi there. I'm TARA, your safe, anonymous AI companion. I'm here to listen without judgment. How are you feeling today?",
        createdAt: new Date().toISOString(),
        metadata: {
            suggestions: ["I'm feeling stressed", "Just wanted to chat", "I need advice"]
        }
    }]);

    const [newMessage, setNewMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSendMessage = async (text: string = newMessage) => {
        if (!text.trim()) return;

        const timestamp = new Date().toISOString();
        const userMsg: BotMessage = {
            _id: `user-${Date.now()}`,
            sender: 'user',
            content: text.trim(),
            createdAt: timestamp
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setIsThinking(true);

        try {
            // Build history format required by REST endpoint
            const history = messages.map(m => ({
                role: m.sender === 'bot' ? 'assistant' : 'user',
                content: m.content
            }));

            const reqHistory = history.length > 5 ? history.slice(history.length - 5) : history;

            const res = await api.post('/bot/chat', {
                message: text.trim(),
                history: reqHistory
            });

            const botData = res.data;

            const botMsg: BotMessage = {
                _id: `bot-${Date.now()}`,
                sender: 'bot',
                content: botData.content,
                createdAt: new Date().toISOString(),
                metadata: {
                    action: botData.action,
                    suggestions: botData.suggestions
                }
            };

            setMessages(prev => [...prev, botMsg]);

            if (botData.action === 'emergency_hub') {
                setIsEmergencyMode(true);
            }

        } catch (error) {
            console.error('Failed to get bot response', error);
            setMessages(prev => [...prev, {
                _id: `sys-${Date.now()}`,
                sender: 'bot',
                content: "I'm having a little trouble connecting right now, but please know I'm here for you. If you need urgent support, please reach out to Tele-MANAS (14416).",
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const latestSuggestions = messages[messages.length - 1]?.sender === 'bot'
        ? messages[messages.length - 1]?.metadata?.suggestions || []
        : [];

    return (
        <div className="h-[calc(100vh-240px)] w-full max-w-6xl mx-auto flex flex-col bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden relative z-10 transition-all duration-500">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-200/20 rounded-full blur-[100px] -z-10 -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-200/20 rounded-full blur-[80px] -z-10 -ml-24 -mb-24" />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent relative z-10">
                <div className="px-6 py-4 sm:px-10 sm:py-6 bg-white/60 backdrop-blur-xl border-b border-slate-100/50 flex items-center justify-between z-20 shadow-sm relative">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20 transform transition-transform hover:scale-105 border border-white/20">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl sm:text-2xl leading-tight tracking-tight">TARA AI</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] sm:text-xs font-black text-sky-600 uppercase tracking-widest sm:tracking-[0.15em]">
                                    Safe & Anonymous
                                </p>
                            </div>
                        </div>
                    </div>
                    {isEmergencyMode && (
                        <button
                            onClick={() => setIsEmergencyMode(false)}
                            className="px-6 py-2.5 text-sm font-black bg-slate-100/80 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all mr-2 border border-slate-200 shadow-sm flex items-center gap-2 uppercase tracking-wide"
                        >
                            <RefreshCw className="w-4 h-4" /> Exit Focus
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 bg-transparent relative z-10 scrollbar-hide">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative px-8 py-5 shadow-sm ring-1 ring-black/5 ${message.sender === 'user'
                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-[2rem] rounded-tr-none shadow-blue-500/10'
                                        : message.metadata?.action === 'emergency_hub'
                                            ? 'bg-red-50 text-red-900 rounded-[2rem] rounded-tl-none border border-red-200 shadow-xl shadow-red-500/5'
                                            : 'bg-white text-slate-800 rounded-[2rem] rounded-tl-none border border-slate-50 shadow-xl shadow-slate-900/5'
                                        }`}>
                                        <p className={`text-lg leading-relaxed font-semibold whitespace-pre-wrap ${message.sender === 'user' ? 'text-white' : message.metadata?.action === 'emergency_hub' ? 'text-red-800' : 'text-slate-700'}`}>
                                            {message.content}
                                        </p>

                                        {/* Injected Action Cards */}
                                        {message.metadata?.action === 'book_therapist' && (
                                            <div className="mt-6 p-6 bg-sky-50/80 backdrop-blur-sm border border-sky-100 rounded-[1.5rem] shadow-inner">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-sky-100">
                                                        <Users className="w-6 h-6 text-sky-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg tracking-tight">Connect with a Professional</p>
                                                        <p className="text-sm text-sky-600 font-bold uppercase tracking-wide">Find a Licensed Therapist</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => navigate('/find-therapists')} className="mt-6 w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-xl hover:shadow-blue-200 text-white text-sm font-black uppercase tracking-[0.1em] rounded-2xl transition-all flex items-center justify-center gap-2 group/btn">
                                                    View Therapists <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-30 ${message.sender === 'user' ? 'mr-4' : 'ml-4'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="flex justify-start group"
                        >
                            <div className="flex flex-col items-start max-w-[75%]">
                                <div className="relative px-8 py-6 shadow-sm bg-white/80 backdrop-blur-md rounded-[2rem] rounded-tl-none border border-slate-50 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-12" />
                </div>

                {isEmergencyMode ? (
                    <div className="p-8 sm:p-10 bg-red-50/50 backdrop-blur-xl border-t border-red-100 relative z-20 shadow-[0_-20px_60px_rgba(239,68,68,0.05)]">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-5">
                            <div className="bg-white border-2 border-red-100 p-6 rounded-3xl flex-1 flex flex-col items-center justify-center shadow-xl shadow-red-500/5 relative overflow-hidden group hover:border-red-300 transition-all cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-2 relative z-10">Tele-MANAS (24/7)</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter relative z-10">14416</span>
                                <a href="tel:14416" className="absolute inset-0 z-10" aria-label="Call 14416"></a>
                            </div>
                            <div className="bg-white border-2 border-red-100 p-6 rounded-3xl flex-1 flex flex-col items-center justify-center shadow-xl shadow-red-500/5 relative overflow-hidden group hover:border-red-300 transition-all cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-2 relative z-10">KIRAN Helpline</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter relative z-10">1800-599-0019</span>
                                <a href="tel:1800-599-0019" className="absolute inset-0 z-10" aria-label="Call 1800-599-0019"></a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-2xl border-t border-slate-100/50 relative z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.03)] flex flex-col p-6 sm:p-10">
                        {/* Suggestions Bar */}
                        {latestSuggestions && latestSuggestions.length > 0 && !isThinking && (
                            <div className="flex gap-3 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide px-2">
                                {latestSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white border border-sky-100 text-sky-700 text-[10px] sm:text-sm font-black uppercase tracking-wide hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all shadow-sm hover:shadow-lg hover:shadow-sky-200 active:scale-95"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-3 sm:gap-6 max-w-5xl mx-auto w-full">
                            <div className="flex-1 min-h-[56px] sm:min-h-[64px] relative bg-slate-50/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl sm:rounded-3xl focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500/50 transition-all shadow-inner flex items-end pr-3 overflow-hidden">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Whisper what's on your heart..."
                                    rows={1}
                                    className="w-full py-4 sm:py-5 pl-5 sm:pl-6 pr-5 sm:pr-6 bg-transparent text-slate-800 placeholder:text-slate-400 font-bold text-base sm:text-lg resize-none focus:outline-none max-h-32"
                                />
                            </div>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() || isThinking}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all shadow-xl shrink-0 ${newMessage.trim() && !isThinking
                                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:shadow-blue-200 hover:-translate-y-1 shadow-blue-500/20 active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200 shadow-inner'
                                    }`}
                            >
                                <Send className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
