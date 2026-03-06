import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface BotMessage {
    _id: string;
    sender: 'user' | 'bot';
    content: string;
    createdAt: string;
}

export const PublicBotPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if there's initial data from onboarding
    const initialState = location.state as {
        initialMessage?: string;
        initialEmotion?: string;
    };

    const [messages, setMessages] = useState<BotMessage[]>([{
        _id: 'init-0',
        sender: 'bot',
        content: `Hi there. I'm Mindora, your safe, anonymous AI companion. I'm here to listen without judgment. ${initialState?.initialEmotion ? `I see you're feeling ${initialState.initialEmotion}. ` : ''}How can I support you today?`,
        createdAt: new Date().toISOString()
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

    // Handle initial message from onboarding
    useEffect(() => {
        if (initialState?.initialMessage) {
            handleSendMessage(initialState.initialMessage);
            // Clear state to prevent double-sending on re-renders
            window.history.replaceState({}, document.title);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

            const botData = res.data;

            const botMsg: BotMessage = {
                _id: `bot-${Date.now()}`,
                sender: 'bot',
                content: botData.content,
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMsg]);

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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline font-medium">Home</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md shadow-primary-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 leading-tight">Mindora Anonymous AI</h1>
                            <p className="text-xs text-primary-600 font-medium">Safe & Confidential</p>
                        </div>
                    </div>

                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>
            </header>

            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border-b border-amber-100">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                        This is an AI companion for emotional support, not a clinical professional. In an emergency, please call <strong>14416</strong> or <strong>112</strong>.
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed ${message.sender === 'user'
                                            ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm border border-primary-700/50 shadow-primary-500/10'
                                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="px-5 py-4 shadow-sm bg-white border border-slate-100 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 pb-safe p-4">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                            rows={1}
                            className="w-full py-4 px-5 bg-transparent text-slate-800 placeholder:text-slate-400 font-medium resize-none focus:outline-none max-h-32 text-[15px]"
                        />
                    </div>

                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!newMessage.trim() || isThinking}
                        className={`p-4 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 ${newMessage.trim() && !isThinking
                                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 shadow-primary-500/25'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                            }`}
                    >
                        <Send className="w-6 h-6 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
