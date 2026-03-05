import AgentManager from '@/components/AgentManager';
import AnalyticsChart from '@/components/AnalyticsChart';
import TranscriptViewer from '@/components/TranscriptViewer';
import { Activity } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="flex items-center justify-between glass-panel p-6 rounded-2xl">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            <span className="text-gradient-primary">MNK Voice Agent</span> Suite
                        </h1>
                        <p className="text-slate-400">
                            Manage telephony endpoints, update the Agent Knowledge Base, and monitor real-time conversational analytics.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-medium text-emerald-400">Systems Operational</span>
                    </div>
                </header>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Management & Analytics */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Agent Control Panel */}
                        <section aria-label="Agent Management">
                            <AgentManager />
                        </section>

                        {/* Performance Analytics */}
                        <section aria-label="Live Analytics">
                            <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-slate-200">System Analytics</h3>
                                    <p className="text-sm text-slate-400">Real-time processing latency (TTFB)</p>
                                </div>
                                <div className="flex-1 w-full min-h-[250px]">
                                    <AnalyticsChart />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Live Transcript Viewer */}
                    <div className="lg:col-span-8">
                        <section aria-label="Live Agent Console" className="h-full">
                            <TranscriptViewer />
                        </section>
                    </div>

                </div>
            </div>
        </main>
    );
}
