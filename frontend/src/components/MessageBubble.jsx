import { useState } from "react";

/**
 * MessageBubble Component
 * 
 * Displays chat messages with expandable details for Prometheus responses.
 * 
 * Structure of PrometheusOutput:
 * {
 *   mode: "respond" | "act" | "plan",
 *   text: { content: string } | null,
 *   action_output: { source: string, variable: string, result: any } | null,
 *   task: string | null,
 *   plan: { plans: [...] } | null,
 *   executed: { executed: {...} } | null,
 *   reflection: {
 *     summary: string,
 *     control: {
 *       error_detected: boolean,
 *       error_reason: string | null,
 *       recommended_action: string | null
 *     }
 *   } | null
 * }
 */
export default function MessageBubble({ message, role }) {
    const [showExecuted, setShowExecuted] = useState(false);
    const [showErrorControl, setShowErrorControl] = useState(false);
    
    // Defensive check for message
    if (!message) {
        return null;
    }
    
    const rawResponse = message?.rawResponse;
    const hasDetails = rawResponse !== undefined && rawResponse !== null;

    // Extract main content from any available field
    const getMainContent = () => {
        if (role === "user") {
            return message?.content || '';
        }

        // For assistant messages, try multiple sources
        if (rawResponse) {
            // Priority 1: text.content (main response text)
            if (rawResponse.text && rawResponse.text.content) {
                return rawResponse.text.content;
            }
            if (typeof rawResponse.text === 'string') {
                return rawResponse.text;
            }
            
            // Priority 2: reflection summary (if available)
            if (rawResponse.reflection && rawResponse.reflection.summary) {
                return rawResponse.reflection.summary;
            }
            
            // Priority 3: task description
            if (rawResponse.task) {
                return rawResponse.task;
            }
            
            // Priority 4: action output result
            if (rawResponse.action_output && rawResponse.action_output.result !== undefined) {
                const result = rawResponse.action_output.result;
                return typeof result === 'object' 
                    ? JSON.stringify(result, null, 2)
                    : String(result);
            }
        }
        
        // Fallback to message.content (formatted by formatPrometheusResponse)
        return message?.content || 'No response';
    };

    const mainContent = getMainContent();
    
    // Check if we have executed steps to show
    const executedSteps = rawResponse?.executed?.executed;
    const hasExecuted = executedSteps && 
        typeof executedSteps === 'object' &&
        Object.keys(executedSteps).length > 0;
    
    // Check if we have reflection data
    const hasReflection = rawResponse?.reflection;
    const reflection = rawResponse?.reflection;

    if (role === "user") {
        // User messages are simple - no expansion needed
        return (
            <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl px-6 py-4 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md">
                    <p className="text-sm leading-relaxed font-medium text-body" style={{lineHeight: '1.7'}}>
                        {mainContent}
                    </p>
                </div>
            </div>
        );
    }

    // Assistant messages with expandable details
    return (
        <div className="flex justify-start">
            <div className="max-w-[75%] glass-card rounded-2xl overflow-hidden shadow-sm">
                {/* Main Content */}
                <div className="px-6 py-4">
                    <p className="text-sm leading-relaxed font-medium text-gray-900 dark:text-gray-100 text-body" style={{lineHeight: '1.7'}}>
                        {mainContent}
                    </p>
                </div>

                {/* View More Button - Show Executed Steps */}
                {hasExecuted && (
                    <div 
                        className="px-6 py-2 border-t border-white/10 dark:border-white/5 bg-white/10 dark:bg-white/5 cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center justify-between"
                        onClick={() => setShowExecuted(!showExecuted)}
                    >
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                            View More ({executedSteps ? Object.keys(executedSteps).length : 0} steps)
                        </span>
                        <svg 
                            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                                showExecuted ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}

                {/* Executed Steps */}
                {hasExecuted && showExecuted && executedSteps && (
                    <div className="px-6 pb-4 space-y-2 border-t border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 pt-4">
                        {Object.entries(executedSteps)
                            .filter(([_, step]) => step != null)
                            .map(([key, step]) => (
                            <div key={key} className="glass-input rounded-lg p-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 bg-green-100 dark:bg-green-900/30 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                        {step?.control?.id || '?'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                            {step?.message || 'No message'}
                                        </div>
                                        {step?.intent && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {step.intent}
                                            </div>
                                        )}
                                        {step?.action_request && (
                                            <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/5">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    <span className="font-mono text-gray-900 dark:text-gray-100">{step.action_request?.action_name || 'Unknown'}</span>
                                                    {step.action_request?.action_arguments && step.action_request.action_arguments.length > 0 && (
                                                        <span className="text-gray-400 dark:text-gray-500 ml-2">
                                                            ({step.action_request.action_arguments.map(arg => `${arg?.name || 'unknown'}`).join(', ')})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {step?.action_output && (
                                            <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/5">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Result:</div>
                                                <div className="text-xs font-mono text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
                                                    {typeof step.action_output?.result === 'object'
                                                        ? JSON.stringify(step.action_output.result, null, 2)
                                                        : String(step.action_output?.result || '')
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reflection Section */}
                {hasReflection && (
                    <div className="px-6 py-3 border-t border-white/10 dark:border-white/5 bg-white/10 dark:bg-white/5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                    Reflection
                                </div>
                                {reflection.summary && (
                                    <p className="text-xs text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-line">
                                        {reflection.summary}
                                    </p>
                                )}
                            </div>
                            
                            {/* Gear Icon for Error Control */}
                            {reflection.control && (
                                <button
                                    onClick={() => setShowErrorControl(!showErrorControl)}
                                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                                    title="Error Control"
                                >
                                    <svg 
                                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                                            showErrorControl ? 'rotate-90' : ''
                                        }`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Error Control Details */}
                        {showErrorControl && reflection.control && (
                            <div className="mt-3 pt-3 border-t border-white/10 dark:border-white/5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-24">Error Detected:</span>
                                    <span className={`text-xs font-semibold ${
                                        reflection.control.error_detected ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                    }`}>
                                        {reflection.control.error_detected ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                {reflection.control.error_reason && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-24 flex-shrink-0">Error Reason:</span>
                                        <span className="text-xs text-gray-900 dark:text-gray-100 flex-1">
                                            {reflection.control.error_reason}
                                        </span>
                                    </div>
                                )}
                                {reflection.control.recommended_action && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-24 flex-shrink-0">Recommended:</span>
                                        <span className="text-xs text-gray-900 dark:text-gray-100 flex-1">
                                            {reflection.control.recommended_action}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Output (for act mode without executed) */}
                {rawResponse?.action_output && !hasExecuted && (
                    <div className="px-6 py-3 border-t border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                            Action Output
                        </div>
                        <div className="glass-input rounded-lg p-3 space-y-2">
                            {rawResponse.action_output?.source && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">Source:</span>
                                    <span className="text-xs text-gray-900 dark:text-gray-100 font-mono">{rawResponse.action_output.source}</span>
                                </div>
                            )}
                            {rawResponse.action_output?.variable && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">Variable:</span>
                                    <span className="text-xs text-gray-900 dark:text-gray-100 font-mono">{rawResponse.action_output.variable}</span>
                                </div>
                            )}
                            {rawResponse.action_output?.result !== undefined && (
                                <div className="flex items-start gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 flex-shrink-0">Result:</span>
                                    <span className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all">
                                        {typeof rawResponse.action_output.result === 'object' 
                                            ? JSON.stringify(rawResponse.action_output.result, null, 2)
                                            : String(rawResponse.action_output.result)
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

