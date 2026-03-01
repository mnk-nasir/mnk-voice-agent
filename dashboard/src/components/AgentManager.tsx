"use client";
import React from 'react';
import { Play, Square, Settings, Mic } from 'lucide-react';

export default function AgentManager() {
    const [agentStatus, setAgentStatus] = React.useState<'Ready' | 'In Call'>('Ready');

    const handleStartCall = () => setAgentStatus('In Call');
    const handleStopCall = () => setAgentStatus('Ready');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Agent Manager
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${agentStatus === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {agentStatus}
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mic className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Sales Assistant V1</p>
                            <p className="text-sm text-gray-500">Gemini 2.0 Flash + Cartesia</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleStartCall}
                            disabled={agentStatus === 'In Call'}
                            className={`p-2 rounded-lg transition ${agentStatus === 'In Call' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            title="Start Call">
                            <Play className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            onClick={handleStopCall}
                            disabled={agentStatus === 'Ready'}
                            className={`p-2 rounded-lg transition ${agentStatus === 'Ready' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                            title="Stop">
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Base URL (Internal)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="https://docs.mnk.com/sales" />
                </div>
            </div>
        </div>
    );
}
