import React from 'react';
import AgentManager from '@/components/AgentManager';
import AnalyticsChart from '@/components/AnalyticsChart';
import TranscriptViewer from '@/components/TranscriptViewer';
import { Activity, PhoneCall, Bot, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const BilledRate = 0.1629; // $0.1629 total per minute (TTS + STT + LLM)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">MNK Voice Agent Suite</h1>
        <p className="text-gray-500 mt-1">High-Speed Conversational AI Orchestration</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Latency (TTFB)</p>
            <p className="text-2xl font-bold text-gray-900">285 <span className="text-sm font-normal text-gray-500">ms</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><Bot className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Intent Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">96.4<span className="text-sm font-normal text-gray-500">%</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><PhoneCall className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Calls</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Est. Running Cost ($/min)</p>
            <p className="text-2xl font-bold text-gray-900">${BilledRate.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Real-time Analytics (Cost)</h2>
            <AnalyticsChart />
          </div>

          <AgentManager />
        </div>

        <div className="lg:col-span-1">
          <TranscriptViewer />
        </div>
      </div>
    </div>
  );
}
