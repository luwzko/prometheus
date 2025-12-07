import { useState } from "react";
import { getAgentPrompt } from "../services/api";

export default function RightSidebar({ onOpenTab }) {
    // Main agent and sub-agents
    const mainAgent = {
        id: 'main',
        apiName: 'main',
        name: 'Prometheus',
        description: 'Main orchestrator agent'
    };

    const subAgents = [
        { id: 'planner', apiName: 'planner', name: 'Planner Agent', description: 'Creates execution plans and breaks down tasks' },
        { id: 'executor', apiName: 'executor', name: 'Executor Agent', description: 'Executes planned actions and operations' },
        { id: 'reflector', apiName: 'reflector', name: 'Reflector Agent', description: 'Reviews and improves execution results' },
    ];

    const handleAgentClick = async (agent) => {
        try {
            // Load agent data from API
            const data = await getAgentPrompt(agent.apiName);
            
            // Open tab with loaded data
            onOpenTab({
                id: `agent-${agent.id}`,
                title: agent.name,
                type: 'agent-config',
                data: {
                    ...agent,
                    prompt: data?.prompt || '',
                    output_struct: data?.output_struct || null
                }
            });
        } catch (error) {
            console.error(`Error loading ${agent.name}:`, error);
            // Still open tab even if loading fails - will show empty/loading state
            onOpenTab({
                id: `agent-${agent.id}`,
                title: agent.name,
                type: 'agent-config',
                data: {
                    ...agent,
                    prompt: '',
                    output_struct: null
                }
            });
        }
    };

    return (
        <div className="w-80 glass-premium flex flex-col shadow-xl">
            {/* Header */}
            <div className="px-6 border-b border-white/25 bg-gray-50/20 h-14 flex flex-col justify-center">
                <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Agents</h2>
                <p className="text-xs text-gray-600 font-medium">Configure prompts & structures</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Main Agent */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                        Main Agent
                    </label>
                    <button
                        onClick={() => handleAgentClick(mainAgent)}
                        className="w-full glass-card glass-hover rounded-2xl p-4 flex items-center gap-4 shadow-sm text-left group hover:bg-gray-50/30 transition-all"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="status-indicator status-online w-2 h-2"></div>
                                <div className="text-sm font-semibold text-gray-900">{mainAgent.name}</div>
                            </div>
                            <div className="text-xs text-gray-600 leading-relaxed">{mainAgent.description}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Sub-Agents Section */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                        Sub-Agents
                    </label>
                    <div className="space-y-2">
                        {subAgents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleAgentClick(agent)}
                                className="w-full glass-card glass-hover rounded-xl p-3 flex items-center gap-3 shadow-sm text-left group hover:bg-gray-50/30 transition-all"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">{agent.name}</div>
                                    <div className="text-xs text-gray-600 leading-relaxed">{agent.description}</div>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
