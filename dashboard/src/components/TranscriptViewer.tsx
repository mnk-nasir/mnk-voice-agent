"use client";
import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, AlertCircle, Send, Activity } from 'lucide-react';

export default function TranscriptViewer() {
    const [takeover, setTakeover] = useState(false);
    const [messages, setMessages] = useState<{ role: string, text: string, ttfb?: number }[]>([
        { role: "bot", text: "Hello, I am the live MNK Voice Agent. I am connected securely to the Google Cloud pipeline via WebSocket!" }
    ]);
    const [input, setInput] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect directly to the production Cloud Run backend WebSocket 
        const ws = new WebSocket("wss://mnk-orchestrator-148520507547.us-central1.run.app/ws/stream");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to live AI pipeline");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "response") {
                    setMessages(prev => [...prev, { role: "bot", text: data.text, ttfb: data.ttfb_ms }]);

                    // Automatically play the generated TTS audio byte-stream returned by ElevenLabs
                    if (data.audio) {
                        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
                        audio.play().catch(e => console.error("Audio playback error:", e));
                    }
                }
            } catch (e) {
                console.error("Error parsing WebSocket message", e);
            }
        };

        ws.onclose = () => console.log("Disconnected from live AI pipeline");

        return () => ws.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !wsRef.current) return;

        // Send the raw text to the FastAPI backend
        wsRef.current.send(JSON.stringify({ text: input }));
        setMessages(prev => [...prev, { role: "user", text: input }]);
        setInput("");
    };

    const handleTakeover = () => {
        setTakeover(true);
        alert("Human Operator has taken over the session.");
    };

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[600px] lg:h-full relative overflow-hidden">
            {/* Subtle background glow for the chat panel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-4 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-sky-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-100">Live Console</h2>
                        <p className="text-xs text-slate-400">Monitoring real-time interactions</p>
                    </div>
                </div>

                <button
                    onClick={handleTakeover}
                    disabled={takeover}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg ${takeover
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50 shadow-none'
                            : 'bg-gradient-to-r from-rose-500 hover:from-rose-600 to-rose-600 hover:to-rose-700 text-white shadow-rose-500/20 border border-rose-500/20'
                        }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    {takeover ? 'Human In Control' : 'Human Take-over'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
                                : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-900/50 border border-slate-600'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-300" />}
                        </div>
                        <div className={`
                            ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-500/10 border border-indigo-500/20'
                                : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50 shadow-xl shadow-black/20'
                            } p-4 text-sm max-w-[80%] whitespace-pre-wrap leading-relaxed`}
                        >
                            {msg.text}
                            {msg.ttfb && (
                                <div className="text-[10px] text-sky-400 mt-2 font-mono bg-sky-950/30 inline-block px-2 py-1 rounded border border-sky-500/20">
                                    ⚡ {msg.ttfb}ms
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 shrink-0 relative z-10 pt-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={takeover ? "Operator mode active. AI routing disabled." : "Type a message to simulate user input..."}
                    disabled={takeover}
                    className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={takeover || !input.trim()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </form>
        </div>
    );
}
