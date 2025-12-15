import { useState } from "react";
import Navbar from "../components/Navbar";
import ChatArea from "../components/ChatArea";
import InputBar from "../components/InputBar";
import LeftPanel from "../components/LeftPanel";
import RightSidebar from "../components/RightSidebar";
import { sendChatMessage, formatPrometheusResponse } from "../services/api";

export default function Dashboard() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm Prometheus. How can I help you today?" }
    ]);
    const [activePanel, setActivePanel] = useState("config");
    const [isLoading, setIsLoading] = useState(false);

    // IDE-style tabs management
    const [tabs, setTabs] = useState([
        { id: 'chat', title: 'Chat', type: 'chat', closable: false }
    ]);
    const [activeTab, setActiveTab] = useState('chat');

    const handleSendMessage = async (content) => {
        // Add user message immediately
        setMessages(prev => [...prev, { role: "user", content }]);
        setIsLoading(true);

        try {
            // Call API - sends POST /api/chat?message=...
            const response = await sendChatMessage(content);
            
            // PrometheusOutput structure (from context.py):
            // {
            //   mode: "respond" | "act" | "plan",
            //   text: { content: string } | null,
            //   action_output: { source, variable, result } | null,
            //   task: string | null,
            //   plan: { plans: [...] } | null,
            //   executed: { executed: {...} } | null,
            //   reflection: { summary: string, control: {...} | null } | null  // NEW - always present for act/plan
            // }
            // The formatPrometheusResponse function extracts the main text content.
            // Reflection summary is now the primary output for act/plan modes.
            // Full details are shown in the expandable MessageBubble component.
            
            const formattedContent = formatPrometheusResponse(response);
            
            // Add assistant response
            setMessages(prev => [...prev, {
                role: "assistant",
                content: formattedContent,
                rawResponse: response // Store raw response for debugging/inspection
            }]);
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Extract a user-friendly error message
            let errorMessage = 'Failed to send message';
            let errorDetails = '';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            // Add helpful context based on error type
            if (error.isNetworkError) {
                errorDetails = '\n\n?? Troubleshooting:\n' +
                    '1. Make sure the backend server is running\n' +
                    '2. Check if CORS is enabled in the backend\n' +
                    '3. Verify the API URL is correct: ' + (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
            } else if (error.status === 500) {
                errorDetails = '\n\n?? This is a backend error. The backend may have a response model mismatch.\n' +
                    'The backend route expects PrometheusResponse but agent.execute() returns PrometheusOutput.\n' +
                    'Check the backend logs for more details.';
            } else if (error.status === 422) {
                errorDetails = '\n\n?? Validation error. The request format may be incorrect.';
            }
            
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `? Error: ${errorMessage}${errorDetails}\n\nCheck the browser console (F12) for technical details.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Open new tab (for prompts, agent configs, etc.)
    const openTab = (newTab) => {
        // Check if tab already exists
        const existingTab = tabs.find(t => t.id === newTab.id);
        if (existingTab) {
            setActiveTab(newTab.id);
            return;
        }

        setTabs([...tabs, { ...newTab, closable: true }]);
        setActiveTab(newTab.id);
    };

    // Close tab
    const closeTab = (tabId) => {
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        // If closing active tab, switch to another
        if (activeTab === tabId) {
            setActiveTab(newTabs[newTabs.length - 1]?.id || 'chat');
        }
    };

    return (
        <div className="h-screen relative flex flex-col overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient" />

            {/* Subtle overlay for better glass effect visibility */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/20 via-white/10 to-white/30 dark:from-gray-900/40 dark:via-gray-900/30 dark:to-gray-900/50" />

            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                <LeftPanel activePanel={activePanel} setActivePanel={setActivePanel} />

                {/* Center Area with Tabs - Modern Design */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Tab Bar */}
                    <div className="glass-nav flex items-center h-12 overflow-hidden border-b border-white/10 dark:border-white/5">
                        <div className="flex items-center h-full overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`group flex items-center gap-2 px-4 h-full cursor-pointer transition-all whitespace-nowrap relative ${
                                        activeTab === tab.id
                                            ? 'text-gray-900 dark:text-gray-100'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="text-sm font-medium">{tab.title}</span>
                                    {tab.closable && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeTab(tab.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 transition-all ml-1 p-0.5 rounded"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-t-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'chat' ? (
                            <>
                                <ChatArea messages={messages} isLoading={isLoading} />
                                <InputBar onSend={handleSendMessage} isLoading={isLoading} />
                            </>
                        ) : (
                            <TabContent tab={tabs.find(t => t.id === activeTab)} />
                        )}
                    </div>
                </div>

                <RightSidebar onOpenTab={openTab} />
            </div>
        </div>
    );
}

// Render different tab content based on type
function TabContent({ tab }) {
    if (!tab) return null;

    switch (tab.type) {
        case 'prompt':
            return <PromptEditor prompt={tab.data} />;
        case 'agent-config':
            return <AgentConfigEditor agent={tab.data} />;
        default:
            return <div className="flex-1 flex items-center justify-center text-gray-600">Unknown tab type</div>;
    }
}

// Prompt Editor Component (read-only for now)
function PromptEditor({ prompt }) {
    return (
        <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{prompt?.name || 'Prompt Editor'}</h2>
                    <textarea
                        value={prompt?.prompt || ''}
                        readOnly
                        className="w-full h-96 glass-input rounded-xl px-5 py-4 text-sm text-gray-900 dark:text-gray-100 resize-none leading-relaxed font-mono"
                        placeholder="Loading prompt..."
                    />
                    {prompt?.output_struct && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Output Structure</h3>
                            <pre className="glass-input rounded-xl px-5 py-4 text-xs text-gray-900 dark:text-gray-100 overflow-x-auto font-mono">
                                {JSON.stringify(prompt.output_struct, null, 2)}
                            </pre>
                        </div>
                    )}
                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Note:</strong> Prompt editing is read-only. The API does not yet support saving changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Agent Config Editor (read-only for now)
function AgentConfigEditor({ agent }) {
    if (agent?.error) {
        return (
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{agent?.name || 'Agent Configuration'}</h2>
                        <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/30">
                            <p className="text-sm text-red-700 dark:text-red-300">{agent.error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const modelConfig = agent?.model_config || {};
    const promptFile = agent?.prompt || 'N/A';
    const promptContent = agent?.prompt_content || '';
    const responseFormat = agent?.response_format || null;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{agent?.name || 'Agent Configuration'}</h2>
                    
                    <div className="space-y-6">
                        {/* Model Config */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Model Config</h3>
                            <div className="glass-input rounded-xl px-5 py-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Model:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">{modelConfig.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temperature:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{modelConfig.temperature !== undefined ? modelConfig.temperature.toFixed(2) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max Tokens:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{modelConfig.max_tokens !== undefined ? modelConfig.max_tokens.toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Prompt File */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Prompt File</h3>
                            <div className="glass-input rounded-xl px-5 py-4">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">{promptFile}</div>
                            </div>
                        </div>

                        {/* Prompt Content */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Prompt Content</h3>
                            <textarea
                                value={promptContent}
                                readOnly
                                className="w-full h-96 glass-input rounded-xl px-5 py-4 text-sm text-gray-900 dark:text-gray-100 resize-none leading-relaxed font-mono"
                                placeholder="No prompt content available"
                            />
                        </div>

                        {/* Response Format */}
                        {responseFormat && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Response Format</h3>
                                <pre className="glass-input rounded-xl px-5 py-4 text-xs text-gray-900 dark:text-gray-100 overflow-x-auto font-mono max-h-96 overflow-y-auto">
                                    {JSON.stringify(responseFormat, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Note:</strong> Agent configuration is read-only. The API does not yet support saving changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
