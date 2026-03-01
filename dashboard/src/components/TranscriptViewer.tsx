"use client";
import React, { useState } from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';

export default function TranscriptViewer() {
    const [takeover, setTakeover] = useState(false);

    const handleTakeover = () => {
        setTakeover(true);
        // In a real app, this would send a signal to the FastAPI middleware to barge-in
        alert("Human Operator has taken over the session.");
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Live Transcript</h2>
                <button
                    onClick={handleTakeover}
                    disabled={takeover}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${takeover ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    {takeover ? 'Human In Control' : 'Human Take-over'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-gray-800 text-sm">
                        Hello, welcome to MNK. How can I assist you with your billing inquiry today?
                    </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none text-sm">
                        Hi, I noticed a $100 charge on my account that I don't recognize.
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-gray-800 text-sm">
                        I can help with that. The $100 charge on March 1st is for the Monthly Platform Maintenance fee as per your MNK setup agreement. Let me know if you need more details.
                        <div className="text-xs text-gray-400 mt-1">TTFB: 245ms</div>
                    </div>
                </div>

                {takeover && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="border border-red-200 bg-red-50 p-3 rounded-lg rounded-tl-none text-red-800 text-sm italic">
                            A human operator has joined the chat.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
