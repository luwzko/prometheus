import { useState, useEffect } from "react";
import { getAvailableActions } from "../services/api";

export default function LeftPanel({ activePanel, setActivePanel }) {
    const panels = [
        { id: "config", label: "Workflows" },
        { id: "actions", label: "Actions" },
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
            </div>
        </div>
    );
}

function ConfigPanel() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Configuration moved to right sidebar
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                    View global config and agents there
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

