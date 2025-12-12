import { useState, useEffect } from "react";
import { getAllAgentsConfig, getAgentConfig } from "../services/api";

export default function RightSidebar({ onOpenTab }) {
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await getAllAgentsConfig();
                setConfig(data);
                setError(null);
            } catch (error) {
                console.error('Error loading config:', error);
                setError('Unable to load configuration. Backend may be offline.');
                setConfig(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadConfig();
    }, []);

    const handleAgentClick = async (agentName, displayName) => {
        try {
            // Load agent data from new API endpoint
            const data = await getAgentConfig(agentName);
            
            // Open tab with loaded data
            onOpenTab({
                id: `agent-${agentName}`,
                title: displayName || agentName,
                type: 'agent-config',
                data: {
                    name: displayName || agentName,
                    apiName: agentName,
                    ...data
                }
            });
        } catch (error) {
            console.error(`Error loading ${agentName}:`, error);
            // Still open tab even if loading fails
            onOpenTab({
                id: `agent-${agentName}`,
                title: displayName || agentName,
                type: 'agent-config',
                data: {
                    name: displayName || agentName,
                    apiName: agentName,
                    error: 'Failed to load agent configuration'
                }
            });
        }
    };

    // Format agent name for display (e.g., "main_agent" -> "Main Agent")
    const formatAgentName = (name) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (isLoading) {
        return (
            <div className="w-80 glass-premium flex flex-col shadow-xl border-l border-white/10 dark:border-white/5">
                <div className="px-6 border-b border-white/10 dark:border-white/5 h-14 flex flex-col justify-center">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Configuration</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Loading configuration...</div>
                </div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="w-80 glass-premium flex flex-col shadow-xl border-l border-white/10 dark:border-white/5">
                <div className="px-6 border-b border-white/10 dark:border-white/5 h-14 flex flex-col justify-center">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Configuration</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Error</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-2">
                        <div className="text-sm text-red-600 dark:text-red-400">{error || 'No configuration available'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Make sure the backend is running</div>
                    </div>
                </div>
            </div>
        );
    }

    // Extract agents from config
    const globalModelConfig = config.global_model_config || {};
    const mainAgent = config.main_agent ? { name: 'main_agent', displayName: 'Main Agent' } : null;
    const workflowAgent = config.workflow ? { name: 'workflow', displayName: 'Workflow' } : null;
    const reflectorAgent = config.reflector ? { name: 'reflector', displayName: 'Reflector' } : null;
    
    // Action manager agents
    const actionManagerAgents = [];
    if (config.action_manager) {
        if (config.action_manager.think_agent) {
            actionManagerAgents.push({ name: 'think_agent', displayName: 'Think Agent' });
        }
        if (config.action_manager.code_agent) {
            actionManagerAgents.push({ name: 'code_agent', displayName: 'Code Agent' });
        }
    }

    const subAgents = [workflowAgent, reflectorAgent].filter(Boolean);
    const allMainAgents = [mainAgent].filter(Boolean);

    return (
        <div className="w-80 glass-premium flex flex-col shadow-xl border-l border-white/10 dark:border-white/5">
            {/* Header */}
            <div className="px-6 border-b border-white/10 dark:border-white/5 h-14 flex flex-col justify-center">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Configuration</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Global config & agents</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Global Model Config */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 block uppercase tracking-wide">
                        Global Model Config
                    </label>
                    <div className="glass-card rounded-xl p-4 space-y-3">
                        <div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Model</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {globalModelConfig.name || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Temperature</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {globalModelConfig.temperature !== undefined ? globalModelConfig.temperature.toFixed(2) : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Max Tokens</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {globalModelConfig.max_tokens !== undefined ? globalModelConfig.max_tokens.toLocaleString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Agents */}
                {allMainAgents.length > 0 && (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">
                            Main Agents
                        </label>
                        <div className="space-y-2">
                            {allMainAgents.map((agent) => (
                                <button
                                    key={agent.name}
                                    onClick={() => handleAgentClick(agent.name, agent.displayName)}
                                    className="w-full glass-card glass-hover rounded-xl p-3 flex items-center gap-3 shadow-sm text-left group hover:bg-white/10 dark:hover:bg-white/5 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="status-indicator status-online w-2 h-2"></div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.displayName}</div>
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sub-Agents */}
                {subAgents.length > 0 && (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">
                            Sub-Agents
                        </label>
                        <div className="space-y-2">
                            {subAgents.map((agent) => (
                                <button
                                    key={agent.name}
                                    onClick={() => handleAgentClick(agent.name, agent.displayName)}
                                    className="w-full glass-card glass-hover rounded-xl p-3 flex items-center gap-3 shadow-sm text-left group hover:bg-white/10 dark:hover:bg-white/5 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{agent.displayName}</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Manager Agents */}
                {actionManagerAgents.length > 0 && (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">
                            Action Manager Agents
                        </label>
                        <div className="space-y-2">
                            {actionManagerAgents.map((agent) => (
                                <button
                                    key={agent.name}
                                    onClick={() => handleAgentClick(agent.name, agent.displayName)}
                                    className="w-full glass-card glass-hover rounded-xl p-3 flex items-center gap-3 shadow-sm text-left group hover:bg-white/10 dark:hover:bg-white/5 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{agent.displayName}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Action Manager</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
