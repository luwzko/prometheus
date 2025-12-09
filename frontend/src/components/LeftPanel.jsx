import { useState, useEffect } from "react";
import { getAvailableActions, getModelConfig } from "../services/api";

export default function LeftPanel({ activePanel, setActivePanel }) {
    const panels = [
        { id: "config", label: "Config" },
        { id: "actions", label: "Actions" },
        { id: "history", label: "History" },
    ];

    return (
        <div className="w-80 glass-premium flex flex-col shadow-xl border-r border-white/10 dark:border-white/5">
            {/* Tab Bar */}
            <div className="flex border-b border-white/10 dark:border-white/5 h-12">
                {panels.map((panel) => (
                    <button
                        key={panel.id}
                        onClick={() => setActivePanel(panel.id)}
                        className={`flex-1 px-4 h-full text-xs font-semibold uppercase tracking-wider transition-all relative flex items-center justify-center ${
                            activePanel === panel.id
                                ? "text-gray-900 dark:text-gray-100 bg-white/20 dark:bg-white/5"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5"
                        }`}
                    >
                        {panel.label}
                        {activePanel === panel.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activePanel === "config" && <ConfigPanel />}
                {activePanel === "actions" && <ActionsPanel />}
                {activePanel === "history" && <HistoryPanel />}
            </div>
        </div>
    );
}

function ConfigPanel() {
    const [modelConfig, setModelConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadModelConfig = async () => {
            try {
                const config = await getModelConfig();
                setModelConfig(config);
                setError(null);
            } catch (error) {
                console.error('Error loading model config:', error);
                setError('Unable to load model config. Backend may be offline.');
                setModelConfig(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadModelConfig();
    }, []);

    if (isLoading) {
        return <div className="text-sm text-gray-600 dark:text-gray-400">Loading model config...</div>;
    }

    if (error) {
        return (
            <div className="space-y-2">
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Make sure the backend is running</div>
            </div>
        );
    }

    if (!modelConfig) {
        return <div className="text-sm text-gray-600 dark:text-gray-400">No model config available</div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 block uppercase tracking-wide">Model Name</label>
                <div className="w-full glass-input rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {modelConfig.name || 'N/A'}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 block uppercase tracking-wide">Temperature</label>
                <div className="w-full glass-input rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {modelConfig.temperature !== undefined ? modelConfig.temperature.toFixed(2) : 'N/A'}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 block uppercase tracking-wide">Max Tokens</label>
                <div className="w-full glass-input rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {modelConfig.max_tokens !== undefined ? modelConfig.max_tokens.toLocaleString() : 'N/A'}
                </div>
            </div>
        </div>
    );
}

function ActionsPanel() {
    const [actions, setActions] = useState([]);
    const [expandedActions, setExpandedActions] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadActions = async () => {
            try {
                const actionList = await getAvailableActions();
                if (Array.isArray(actionList)) {
                    // Handle both string arrays and object arrays
                    const processedActions = actionList.map((action) => {
                        if (typeof action === 'string') {
                            return { name: action };
                        } else if (action && typeof action === 'object' && action.name) {
                            return { ...action };
                        } else {
                            console.warn('Unexpected action format:', action);
                            return { name: String(action) };
                        }
                    });
                    setActions(processedActions);
                } else {
                    setActions([]);
                }
                setError(null);
            } catch (error) {
                console.error('Error loading actions:', error);
                setError('Unable to load actions. Backend may be offline.');
                setActions([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadActions();
    }, []);

    const toggleExpand = (actionName) => {
        setExpandedActions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(actionName)) {
                newSet.delete(actionName);
            } else {
                newSet.add(actionName);
            }
            return newSet;
        });
    };

    if (isLoading) {
        return <div className="text-sm text-gray-600 dark:text-gray-400">Loading actions...</div>;
    }

    if (error) {
        return (
            <div className="space-y-2">
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Make sure the backend is running</div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {actions.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">No actions available</div>
            ) : (
                actions.map((action, index) => {
                    const isExpanded = expandedActions.has(action.name);
                    const hasDetails = action.description || action.variable || action.arguments_sig;
                    
                    return (
                        <div 
                            key={action.name || `action-${index}`} 
                            className="glass-card rounded-xl overflow-hidden transition-all"
                        >
                            {/* Header - Always visible */}
                            <div 
                                className="p-3 flex items-center justify-between cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                                onClick={() => hasDetails && toggleExpand(action.name)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                        {action.name || 'Unknown Action'}
                                    </div>
                                    {action.description && !isExpanded && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                            {action.description}
                                        </div>
                                    )}
                                </div>
                                {hasDetails && (
                                    <svg 
                                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && hasDetails && (
                                <div className="px-3 pb-3 space-y-3 border-t border-white/10 dark:border-white/5 pt-3">
                                    {action.description && (
                                        <div>
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                                Description
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {action.description}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {action.variable && (
                                        <div>
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                                Variable
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-white/20 dark:bg-white/5 rounded-lg px-2 py-1.5">
                                                {action.variable}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {action.arguments_sig && (() => {
                                        // Parse arguments_sig - it can be a string (JSON) or already an array
                                        let args = [];
                                        try {
                                            if (typeof action.arguments_sig === 'string') {
                                                args = JSON.parse(action.arguments_sig);
                                            } else if (Array.isArray(action.arguments_sig)) {
                                                args = action.arguments_sig;
                                            }
                                        } catch (e) {
                                            console.warn('Failed to parse arguments_sig:', e);
                                        }

                                        return (
                                            <div>
                                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                                    Arguments Signature
                                                </div>
                                                {Array.isArray(args) && args.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {args.map((arg, idx) => (
                                                            <div 
                                                                key={idx}
                                                                className="glass-input rounded-lg px-3 py-2 flex items-center gap-3"
                                                            >
                                                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 font-mono">
                                                                    {arg.arg_name || 'unnamed'}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">:</span>
                                                                <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                                                                    {arg.arg_type || 'unknown'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                        No arguments defined
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

function HistoryPanel() {
    const history = [
        { time: "2 minutes ago", query: "What is the capital of France?", type: "chat" },
        { time: "5 minutes ago", query: "Explain quantum computing", type: "chat" },
        { time: "10 minutes ago", query: "How does RAG work?", type: "chat" },
        { time: "1 hour ago", query: "Analyze sales data", type: "task" }
    ];

    return (
        <div className="space-y-2">
            {history.map((item, index) => (
                <div key={index} className="glass-card glass-hover rounded-xl p-3 shadow-sm cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.time}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.type === 'chat' 
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                            {item.type}
                        </span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-2">{item.query}</div>
                </div>
            ))}
        </div>
    );
}
