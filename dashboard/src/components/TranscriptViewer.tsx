"use client";
import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, AlertCircle, Send } from 'lucide-react';

export default function TranscriptViewer() {
    const [takeover, setTakeover] = useState(false);
    const [messages, setMessages] = useState<{ role: string, text: string, ttfb?: number }[]>([
        { role: "bot", text: "Hello, I am the live MNK Voice Agent. I am connected securely to the Google Cloud pipeline via WebSocket!" }
    ]);
    const [input, setInput] = useState("");
    const wsRef = useRef<WebSocket | null>(null);

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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4 border-b pb-4 shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">Live Agent Console</h2>
                <button
                    onClick={handleTakeover}
                    disabled={takeover}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${takeover ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                >
                    <AlertCircle className="w-4 h-4" />
                    {takeover ? 'Human In Control' : 'Human Take-over'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className={`${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 rounded-tl-none'} p-3 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap`}>
                            {msg.text}
                            {msg.ttfb && <div className="text-xs text-gray-400 mt-1">TTFB: {msg.ttfb}ms</div>}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={takeover ? "Human Operator Chat disabled" : "Type to chat with the live Agent..."}
                    disabled={takeover}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={takeover || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition shrink-0 disabled:bg-blue-300"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
