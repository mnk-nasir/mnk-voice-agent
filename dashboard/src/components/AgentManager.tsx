"use client";
import React, { useState } from 'react';
import { Settings, Play, Square, Database } from 'lucide-react';

export default function AgentManager() {
    const [isActive, setIsActive] = useState(true);
    const [kbUrl, setKbUrl] = useState("https://mnk.support/docs");

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Settings className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-100">Core Engine</h2>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                            {isActive ? 'Live Processing' : 'Standby'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${isActive
                        ? 'bg-gradient-to-r from-rose-500 hover:from-rose-600 to-rose-600 hover:to-rose-700 text-white shadow-rose-500/20'
                        : 'bg-gradient-to-r from-emerald-500 hover:from-emerald-600 to-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/20'
                        }`}
                >
                    {isActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {isActive ? 'Stop Engine' : 'Start Engine'}
                </button>
            </div>

            <div className="flex-1 space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                    <p className="text-sm font-medium text-slate-300 mb-1">Active Model</p>
                    <p className="text-lg text-slate-100">Gemini 2.0 Multimodal Live Flash</p>
                    <p className="text-xs text-indigo-400 mt-1">Vertex AI Secure VPC Configured</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-medium text-slate-300">Target Knowledge Base</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">The URL to scrape context from. RAG indices will update automatically.</p>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={kbUrl}
                            onChange={(e) => setKbUrl(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Enter docs URL..."
                        />
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20">
                            Sync
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
