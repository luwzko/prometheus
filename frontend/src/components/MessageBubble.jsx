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
 *   executed: { executed: {...} } | null
 * }
 */
export default function MessageBubble({ message, role }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rawResponse = message.rawResponse;
    // Show expandable details if we have a rawResponse (even for simple respond mode)
    const hasDetails = rawResponse !== undefined && rawResponse !== null;

    // Extract main content
    const getMainContent = () => {
        if (role === "user") {
            return message.content;
        }

        // For assistant messages, extract from rawResponse if available
        if (rawResponse) {
            // text is a ModelOutput object with content field
            if (rawResponse.text && rawResponse.text.content) {
                return rawResponse.text.content;
            }
            // Fallback for old format where text might be a string
            if (typeof rawResponse.text === 'string') {
                return rawResponse.text;
            }
        }
        
        // Fallback to message.content (formatted by formatPrometheusResponse)
        return message.content || 'No response';
    };

    const mainContent = getMainContent();

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
                    <p className="text-sm leading-relaxed font-medium text-gray-900 text-body" style={{lineHeight: '1.7'}}>
                        {mainContent}
                    </p>
                </div>

                {/* Expandable Details */}
                {hasDetails && (
                    <>
                        {/* Expand/Collapse Button */}
                        <div 
                            className="px-6 py-2 border-t border-white/25 bg-gray-50/20 cursor-pointer hover:bg-gray-50/30 transition-colors flex items-center justify-between"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {rawResponse.mode || 'details'}
                            </span>
                            <svg 
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="px-6 pb-4 space-y-4 border-t border-white/25 bg-gray-50/10">
                                {/* Mode Badge */}
                                {rawResponse.mode && (
                                    <div className="pt-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900/10 text-gray-700">
                                            <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                                            Mode: {rawResponse.mode}
                                        </div>
                                    </div>
                                )}

                                {/* Text Content (for respond mode) */}
                                {rawResponse.text && rawResponse.text.content && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Full Response
                                        </div>
                                        <div className="glass-input rounded-lg p-3">
                                            <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line">
                                                {rawResponse.text.content}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Output (for act mode) */}
                                {rawResponse.action_output && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Action Output
                                        </div>
                                        <div className="glass-input rounded-lg p-3 space-y-2">
                                            {rawResponse.action_output.source && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-600 w-16">Source:</span>
                                                    <span className="text-xs text-gray-900 font-mono">{rawResponse.action_output.source}</span>
                                                </div>
                                            )}
                                            {rawResponse.action_output.variable && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-600 w-16">Variable:</span>
                                                    <span className="text-xs text-gray-900 font-mono">{rawResponse.action_output.variable}</span>
                                                </div>
                                            )}
                                            {rawResponse.action_output.result !== undefined && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-xs font-medium text-gray-600 w-16 flex-shrink-0">Result:</span>
                                                    <span className="text-xs text-gray-900 font-mono break-all">
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

                                {/* Task (for plan mode) */}
                                {rawResponse.task && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Task
                                        </div>
                                        <div className="glass-input rounded-lg p-3">
                                            <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line">
                                                {rawResponse.task}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Plan (for plan mode) */}
                                {rawResponse.plan && rawResponse.plan.plans && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Plan Steps ({rawResponse.plan.plans.length})
                                        </div>
                                        <div className="space-y-2">
                                            {rawResponse.plan.plans.map((step, idx) => (
                                                <div key={idx} className="glass-input rounded-lg p-3">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className="text-xs font-bold text-gray-900 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                            {step.control?.id || idx + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="text-xs font-semibold text-gray-900 mb-1">
                                                                {step.message}
                                                            </div>
                                                            <div className="text-xs text-gray-600 mb-2">
                                                                {step.intent}
                                                            </div>
                                                            {step.action_request && (
                                                                <div className="mt-2 pt-2 border-t border-white/25">
                                                                    <div className="text-xs text-gray-500 mb-1">Action:</div>
                                                                    <div className="text-xs font-mono text-gray-900">
                                                                        {step.action_request.action_name || 'Unknown'}
                                                                    </div>
                                                                    {step.action_request.action_arguments && step.action_request.action_arguments.length > 0 && (
                                                                        <div className="mt-1 text-xs text-gray-500">Arguments:</div>
                                                                    )}
                                                                    {step.action_request.action_arguments?.map((arg, argIdx) => (
                                                                        <div key={argIdx} className="text-xs font-mono text-gray-700 ml-2">
                                                                            {arg.name}: {JSON.stringify(arg.value)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Executed Steps (for plan mode after execution) */}
                                {rawResponse.executed && rawResponse.executed.executed && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Executed Steps ({Object.keys(rawResponse.executed.executed).length})
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(rawResponse.executed.executed).map(([key, step]) => (
                                                <div key={key} className="glass-input rounded-lg p-3">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className="text-xs font-bold text-gray-900 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                            {step.control?.id || '?'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="text-xs font-semibold text-gray-900 mb-1">
                                                                {step.message}
                                                            </div>
                                                            {step.action_output && (
                                                                <div className="mt-2 pt-2 border-t border-white/25">
                                                                    <div className="text-xs text-gray-500 mb-1">Result:</div>
                                                                    <div className="text-xs font-mono text-gray-900">
                                                                        {typeof step.action_output.result === 'object'
                                                                            ? JSON.stringify(step.action_output.result, null, 2)
                                                                            : String(step.action_output.result)
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Raw JSON (for debugging) */}
                                <details className="mt-4">
                                    <summary className="text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-gray-900">
                                        Raw Response (Debug)
                                    </summary>
                                    <pre className="mt-2 text-xs font-mono bg-gray-900/5 rounded-lg p-3 overflow-x-auto text-gray-700">
                                        {JSON.stringify(rawResponse, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

