import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
    _id: string;
    content: string;
    sender: { _id: string; name: string };
    createdAt: string;
}

export const FloatingChatWidget: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    useEffect(() => {
        if (isOpen && !conversationId) {
            initializeBotChat();
        }
    }, [isOpen]);

    const initializeBotChat = async () => {
        try {
            // Check for existing bot conversation or create one
            const response = await api.post('/chat/conversations', {
                participants: ['bot'],
                type: 'direct'
            });
            setConversationId(response.data._id);
            // Fetch recent messages
            if (response.data._id) {
                const msgResponse = await api.get(`/chat/conversations/${response.data._id}/messages`);
                // Backend returns Newest First, we want Oldest First (Chronological)
                setMessages(msgResponse.data.reverse());
            }
        } catch (error) {
            console.error('Failed to init bot chat', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId) return;

        try {
            const content = newMessage;
            setNewMessage('');

            // Optimistic update
            const tempMsg: Message = {
                _id: Date.now().toString(),
                content,
                sender: { _id: (user as any)?._id || 'me', name: user?.name || 'Me' },
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);
            setIsTyping(true); // Start typing indicator

            await api.post(`/chat/conversations/${conversationId}/messages`, { content });

            // Poll for bot response (attempt every 2s for 30s)
            let attempts = 0;
            const maxAttempts = 15;

            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const msgResponse = await api.get(`/chat/conversations/${conversationId}/messages`);
                    // Reverse to get Chronological order
                    const newMessages = msgResponse.data.reverse();

                    // Check if there's a new message from the bot
                    // Last message in chronological list should be the newest
                    const lastMsg = newMessages[newMessages.length - 1];

                    // Safe check for sender (bot has no sender or sender is null)
                    const isBot = !lastMsg.sender || lastMsg.sender === null;
                    const isOtherUser = lastMsg.sender?._id !== (user as any)?._id && lastMsg.sender?._id !== 'me';

                    if (lastMsg && (isBot || isOtherUser)) {
                        setMessages(newMessages);
                        setIsTyping(false); // Stop typing indicator
                        clearInterval(pollInterval);
                    } else if (attempts >= maxAttempts) {
                        setIsTyping(false); // Stop typing indicator on timeout
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Polling error', err);
                }
            }, 2000);

        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50 hover:scale-110"
            >
                <MessageCircle className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-300 ${isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'}`}>
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white rounded-t-2xl flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Bot className="w-6 h-6" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse" />
                    </div>
                    <span className="font-bold">Mindora</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.map((msg) => {
                    const isMe = msg.sender?._id === (user as any)?._id || msg.sender?._id === 'me';
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 self-end mb-1">
                                    <Bot className="w-5 h-5 text-green-600" />
                                </div>
                            )}
                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${isMe
                                ? 'bg-blue-500 text-white rounded-tr-none'
                                : 'bg-green-100 text-green-900 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 mb-1">
                            <Bot className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="bg-green-100 text-green-900 border border-green-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5 h-12">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-3 opacity-60">
                        <Bot className="w-12 h-12 text-slate-300" />
                        <p className="text-sm">Hi! I'm Mindora. I'm here to listen and support you. How are you feeling today?</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};
