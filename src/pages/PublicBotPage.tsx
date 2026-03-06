import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import api from '../services/api';

interface BotMessage {
    _id: string;
    sender: 'user' | 'bot';
    content: string;
    createdAt: string;
    metadata?: {
        suggestions?: string[];
    };
}

export const PublicBotPage: React.FC = () => {
    const [messages, setMessages] = useState<BotMessage[]>([{
        _id: 'init-0',
        sender: 'bot',
        content: "Hi there. I'm TARA, your safe, anonymous AI companion. I'm here to listen without judgment. How are you feeling today?",
        createdAt: new Date().toISOString(),
        metadata: {
            suggestions: ["I'm feeling stressed", "Just wanted to chat", "How can therapy help?"]
        }
    }]);

    const [newMessage, setNewMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
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
            const history = messages.map(m => ({
                role: m.sender === 'bot' ? 'assistant' : 'user',
                content: m.content
            }));
            const reqHistory = history.length > 5 ? history.slice(history.length - 5) : history;

            const res = await api.post('/bot/chat', {
                message: text.trim(),
                history: reqHistory
            });

            const botMsg: BotMessage = {
                _id: `bot-${Date.now()}`,
                sender: 'bot',
                content: res.data.content,
                createdAt: new Date().toISOString(),
                metadata: {
                    suggestions: res.data.suggestions
                }
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Failed to get bot response', error);
            setMessages(prev => [...prev, {
                _id: `sys-${Date.now()}`,
                sender: 'bot',
                content: "I'm having a little trouble connecting right now, but please know I'm here for you.",
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
        <div className="min-h-screen bg-white relative flex flex-col font-sans overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/50 rounded-full blur-[120px] -z-10 -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 -ml-48 -mb-48" />

            {/* Header */}
            <header className="px-8 py-6 bg-white/70 backdrop-blur-2xl border-b border-white/50 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Sparkles className="w-7 h-7 text-white animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">TARA AI</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Safe · Anonymous · Non-judgmental</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <a 
                        href="/login" 
                        className="px-6 py-3 bg-white border-2 border-slate-100 hover:border-sky-500 rounded-2xl text-sm font-black text-slate-700 transition-all uppercase tracking-widest hover:shadow-xl hover:shadow-sky-100 active:scale-95"
                    >
                        Save Session
                    </a>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-8 sm:p-12 relative z-10">
                <div className="flex-1 space-y-10 scrollbar-hide">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[75%] px-8 py-5 shadow-sm ring-1 ring-black/5 ${
                                    message.sender === 'user'
                                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-[2rem] rounded-tr-none'
                                        : 'bg-white/90 backdrop-blur-xl text-slate-700 rounded-[2rem] rounded-tl-none border border-white/80 shadow-xl shadow-slate-900/5'
                                }`}>
                                    <p className="text-lg leading-relaxed font-semibold whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="px-8 py-5 bg-white shadow-xl rounded-[2rem] rounded-tl-none border border-slate-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-12" />
                </div>
            </main>

            {/* Input Bar */}
            <footer className="p-8 sm:p-12 bg-white/80 backdrop-blur-3xl border-t border-white/50 sticky bottom-0 z-50">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Suggestions */}
                    {latestSuggestions && latestSuggestions.length > 0 && !isThinking && (
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                            {latestSuggestions.map((suggestion: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(suggestion)}
                                    className="whitespace-nowrap px-6 py-2.5 bg-white border-2 border-slate-100 rounded-full text-slate-600 text-sm font-black hover:border-sky-500 hover:text-sky-600 transition-all uppercase tracking-widest shadow-sm hover:shadow-lg hover:shadow-sky-50"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Field */}
                    <div className="flex items-center gap-6">
                        <div className="flex-1 bg-slate-50/80 rounded-3xl border-2 border-slate-100 focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all p-2 flex items-center pr-3 shadow-inner">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                                placeholder="Whisper what's on your heart..."
                                className="flex-1 bg-transparent px-6 py-4 text-lg font-bold text-slate-800 focus:outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!newMessage.trim() || isThinking}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                                newMessage.trim() && !isThinking
                                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:shadow-blue-200 hover:-translate-y-1 active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200'
                            }`}
                        >
                            <Send className="w-8 h-8 ml-1" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
