import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

// System prompt to give the AI context about QuickShow
const SYSTEM_CONTEXT = `You are the AI Movie Concierge for QuickShow — a premium movie ticket booking platform in India. 
You help users:
- Discover movies, get recommendations based on genres/mood
- Understand how to book tickets, select seats, and use the platform
- Learn about theater facilities, snack options, and food available
- Get info about trending movies, upcoming releases
- Understand pricing (Standard ~₹150-200, Premium ~₹250-300, VIP ~₹400+)
- Learn about features like M-Ticket, 4K Dolby, IMAX shows

Always be friendly, concise, and enthusiastic about movies. Use emojis occasionally. Keep responses under 150 words unless the user asks for detailed info.

User question: `;

// Typewriter hook for streaming effect
const useTypewriter = (text, speed = 18) => {
    const [displayText, setDisplayText] = useState('');
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (!text) return;
        setDisplayText('');
        setIsDone(false);
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                setIsDone(true);
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayText, isDone };
};

// Message bubble component
const MessageBubble = ({ msg, isLatestAssistant }) => {
    const { displayText } = useTypewriter(
        msg.role === 'assistant' && isLatestAssistant ? msg.content : null
    );
    const content = isLatestAssistant ? displayText : msg.content;

    return (
        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className="flex gap-2 max-w-[88%] items-end">
                {msg.role !== 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-primary/20 mb-1">
                        <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
                <div
                    className={`px-4 py-2.5 text-[12px] leading-relaxed shadow-sm whitespace-pre-wrap rounded-2xl
                        ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-sm shadow-md shadow-primary/15'
                            : 'bg-white/[0.05] border border-white/8 text-gray-200 rounded-bl-sm'
                        }`}
                >
                    {content || (msg.role === 'assistant' && '...')}
                </div>
            </div>
        </div>
    );
};

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hey there! 🎬 I\'m your AI Movie Concierge.\n\nAsk me anything — movie recommendations, booking help, snack options, or theater info!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [latestAssistantIdx, setLatestAssistantIdx] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { axios } = useAppContext();

    const quickActions = [
        { label: '🔥 Trending', query: 'What movies are trending right now?' },
        { label: '🍿 Sci-Fi', query: 'Recommend me some great Sci-Fi movies.' },
        { label: '🎟️ How to Book', query: 'How do I book tickets and select seats on QuickShow?' },
        { label: '🧀 Snacks', query: 'What food and snacks are available at the theaters?' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [messages, isOpen]);

    const handleSend = async (customPrompt = null) => {
        const promptText = customPrompt || input.trim();
        if (!promptText || loading) return;

        if (!customPrompt) setInput('');
        const newMessages = [...messages, { role: 'user', content: promptText }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const fullPrompt = SYSTEM_CONTEXT + promptText;
            const { data } = await axios.post('/api/ai/chat', { prompt: fullPrompt });

            if (data.success) {
                const updatedMessages = [...newMessages, { role: 'assistant', content: data.text }];
                setMessages(updatedMessages);
                setLatestAssistantIdx(updatedMessages.length - 1);
            } else {
                throw new Error(data.message || 'AI response failed');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errMsg = error.response?.status === 429
                ? "I'm getting too many requests right now. Please try again in a moment! 🙏"
                : "Sorry, I'm having trouble connecting. Please check if the server is running and try again.";
            const updatedMessages = [...newMessages, { role: 'assistant', content: errMsg }];
            setMessages(updatedMessages);
            setLatestAssistantIdx(updatedMessages.length - 1);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([
            { role: 'assistant', content: 'Chat reset! 🎬 How can I help you today?' }
        ]);
        setLatestAssistantIdx(0);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[540px] max-h-[85vh] animate-slide-up"
                    style={{ background: 'linear-gradient(145deg, #0e0e12, #0a0a0e)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/15 via-purple-600/10 to-transparent border-b border-white/8 px-5 py-3.5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                <Bot className="w-5 h-5 text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0e] rounded-full shadow-sm shadow-green-500/50" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                                    AI Concierge
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                </h3>
                                <p className="text-[10px] text-gray-500 font-medium">QuickShow Movie Assistant • Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                title="Reset Chat"
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-lg transition-all"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all hover:rotate-90 duration-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                        {messages.map((msg, idx) => (
                            <MessageBubble
                                key={idx}
                                msg={msg}
                                isLatestAssistant={msg.role === 'assistant' && idx === latestAssistantIdx && idx > 0}
                            />
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="flex gap-2 items-end">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="bg-white/[0.05] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.query)}
                                disabled={loading}
                                className="flex-shrink-0 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:border-primary/40 hover:bg-primary/5 text-[10px] text-gray-400 hover:text-white rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/8 px-4 py-3 bg-black/30 backdrop-blur-md flex gap-2.5 shrink-0 items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Ask about movies, showtimes, snacks..."
                            disabled={loading}
                            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-600 disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                        >
                            <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* FAB Toggle Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white shadow-[0_8px_32px_rgba(248,69,101,0.4)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 group"
                style={{ borderRadius: isOpen ? '1rem' : '1rem' }}
            >
                {/* Ping animation */}
                {!isOpen && <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping opacity-60" />}

                {/* Icon */}
                <div className="relative z-10 transition-transform duration-300">
                    {isOpen
                        ? <ChevronDown className="w-6 h-6" />
                        : <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    }
                </div>

                {/* AI Badge */}
                {!isOpen && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-[#09090B] text-[8px] font-black text-white shadow-lg">
                        AI
                    </span>
                )}
            </button>
        </div>
    );
};

export default AIChatbot;
