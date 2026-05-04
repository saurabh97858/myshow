import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am your AI Movie Concierge. How can I help you find the perfect movie today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { axios } = useAppContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const { data } = await axios.post('/api/ai/chat', { prompt: userMsg });

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            } else {
                toast.error(data.message || "Failed to get response");
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            // Don't show toast for network errors inside chat, just append message
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, a network error occurred." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-gray-900 border border-gray-700 w-80 sm:w-96 rounded-xl shadow-2xl mb-4 overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
                    {/* Header */}
                    <div className="bg-primary px-4 py-3 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-white" />
                            <h3 className="font-bold text-white tracking-wide">AI Concierge</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0A0A0A] custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-2xl rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-2xl rounded-bl-sm border border-gray-700'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-800 text-gray-400 rounded-bl-sm border border-gray-700 text-sm flex gap-1.5 items-center h-[44px]">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-800 p-3 bg-gray-900 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about movies..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all h-11"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-primary hover:bg-primary/90 text-white w-11 h-11 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shrink-0 shadow-md"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 group relative z-50"
                >
                    <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-gray-900 flex items-center justify-center text-[8px] font-bold">1</span>
                    </span>
                </button>
            )}
        </div>
    );
};

export default AIChatbot;
