import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatArea({ messages, isLoading }) {
    const bottomRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // Empty state
    if (messages.length === 0 && !isLoading) {
        return (
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-8 py-10 min-h-0 chat-scrollbar flex items-center justify-center"
            >
                <div className="max-w-md mx-auto text-center empty-state">
                    <div className="empty-state-icon mx-auto mb-6">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Ask Prometheus anything. It can help you with planning, execution, and complex tasks.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-8 py-10 min-h-0 chat-scrollbar"
            style={{
                scrollBehavior: 'smooth',
            }}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={index}
                        message={message}
                        role={message.role}
                    />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="glass-card rounded-2xl px-6 py-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="status-indicator status-processing"></div>
                                <span className="text-sm font-medium text-gray-700">Prometheus is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
