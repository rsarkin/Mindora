import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface BotMessage {
    _id: string;
    sender: 'user' | 'bot';
    content: string;
    createdAt: string;
}

export const BotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<BotMessage[]>([{
        _id: 'init-0',
        sender: 'bot',
        content: "Hi there. I'm Mindora, your safe, anonymous AI companion. I'm here to listen without judgment. How are you feeling today?",
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
    }, [messages, isThinking, isOpen]);

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
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-primary-100 flex flex-col overflow-hidden origin-bottom-right"
                        style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-between text-white shrink-0 shadow-sm relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-wide">Mindora AI</h3>
                                    <p className="text-[10px] text-primary-100 opacity-90 font-medium tracking-wider uppercase">Anonymous & Safe</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <X className="w-5 h-5 opacity-80" />
                            </button>
                        </div>

                        {/* Disclaimer Banner */}
                        <div className="bg-amber-50 px-4 py-2 text-[11px] text-amber-800 flex items-start gap-2 border-b border-amber-100 shrink-0 shadow-inner">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                            <p className="leading-snug font-medium opacity-90">
                                This is an AI trained for emotional support, not a human crisis counselor. In emergencies, please call <strong className="font-bold">14416</strong> or <strong className="font-bold">112</strong> immediately.
                            </p>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide relative">
                            {messages.map((message) => (
                                <motion.div
                                    key={message._id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${message.sender === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-sm border border-primary-700/50'
                                            : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                            <div className="flex items-center gap-2 relative bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all pr-1 overflow-hidden">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                    placeholder="Type your message..."
                                    className="w-full py-2.5 pl-3 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!newMessage.trim() || isThinking}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newMessage.trim() && !isThinking
                                            ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 border-white focus:outline-none focus:ring-4 focus:ring-primary-500/30 ${isOpen
                        ? 'bg-slate-800 text-white scale-90'
                        : 'bg-primary-600 text-white hover:bg-primary-700 pulse-primary'
                    }`}
                style={{
                    boxShadow: isOpen
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                        : '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
            <style dangerouslySetInnerHTML={{
                __html: `
                .pulse-primary {
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}} />
        </div>
    );
};
