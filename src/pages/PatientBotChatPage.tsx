import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Users, RefreshCw } from 'lucide-react';
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
    const [messages, setMessages] = useState<BotMessage[]>([{
        _id: 'init-0',
        sender: 'bot',
        content: "Hi there. I'm Mindora, your safe, anonymous AI companion. I'm here to listen without judgment. How are you feeling today?",
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
        ? messages[messages.length - 1]?.metadata?.suggestions
        : [];

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] w-full max-w-5xl mx-auto flex bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
                <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-between z-20 shadow-sm relative">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20 transform transition-transform hover:scale-105">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Mindora AI</h3>
                            <p className="text-xs font-medium text-primary-600 truncate mt-0.5">
                                Always here. Safe & Anonymous.
                            </p>
                        </div>
                    </div>
                    {isEmergencyMode && (
                        <button
                            onClick={() => setIsEmergencyMode(false)}
                            className="px-4 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors mr-2 border border-slate-200 shadow-sm flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Exit Focus
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-transparent relative z-10 scrollbar-hide">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative px-5 py-3.5 shadow-sm ${message.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm border border-primary-700/50 shadow-primary-500/10'
                                        : message.metadata?.action === 'emergency_hub'
                                            ? 'bg-red-50 text-red-900 rounded-2xl rounded-tl-sm border border-red-200 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)]'
                                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                                        }`}>
                                        <p className={`text-[15px] leading-relaxed font-medium whitespace-pre-wrap ${message.sender === 'user' ? 'text-white' : message.metadata?.action === 'emergency_hub' ? 'text-red-800' : 'text-slate-700'}`}>
                                            {message.content}
                                        </p>

                                        {/* Injected Action Cards */}
                                        {message.metadata?.action === 'book_therapist' && (
                                            <div className="mt-4 p-3.5 bg-primary-50 border border-primary-100 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                        <Users className="w-5 h-5 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-primary-900">Find a Therapist</p>
                                                        <p className="text-xs text-primary-700">Connect with a human professional</p>
                                                    </div>
                                                </div>
                                                <a href="/find-therapists" className="mt-3 block text-center w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                                                    View Available Therapists
                                                </a>
                                            </div>
                                        )}
                                    </div>
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
                                <div className="relative px-5 py-4 shadow-sm bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-6" />
                </div>

                {isEmergencyMode ? (
                    <div className="p-4 sm:p-5 bg-red-50 border-t border-red-100 relative z-20 shadow-[0_-10px_40px_rgba(239,68,68,0.05)]">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
                            <div className="bg-white border border-red-200 p-4 rounded-xl flex-1 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Tele-MANAS</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">14416</span>
                                <a href="tel:14416" className="absolute inset-0 z-10" aria-label="Call 14416"></a>
                            </div>
                            <div className="bg-white border border-red-200 p-4 rounded-xl flex-1 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">KIRAN</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">1800-599-0019</span>
                                <a href="tel:1800-599-0019" className="absolute inset-0 z-10" aria-label="Call 1800-599-0019"></a>
                            </div>
                            <div className="bg-white border border-red-200 p-4 rounded-xl flex-1 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Emergency</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">112</span>
                                <a href="tel:112" className="absolute inset-0 z-10" aria-label="Call 112"></a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-t border-slate-100 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col">
                        {/* Suggestions Bar */}
                        {latestSuggestions && latestSuggestions.length > 0 && !isThinking && (
                            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-slate-50 bg-slate-50/50 px-4">
                                {latestSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="p-4 flex items-end gap-3 max-w-4xl mx-auto w-full">
                            <div className="flex-1 min-h-[52px] relative bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm flex items-end pr-2 overflow-hidden">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Share what's on your mind..."
                                    rows={1}
                                    className="w-full py-3.5 pl-4 pr-4 bg-transparent text-slate-800 placeholder:text-slate-400 font-medium resize-none focus:outline-none max-h-32 text-[15px]"
                                />
                            </div>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() || isThinking}
                                className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 ${newMessage.trim() && !isThinking
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 shadow-primary-500/25'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                    }`}
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
