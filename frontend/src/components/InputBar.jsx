import { useState } from "react";

export default function InputBar({ onSend, isLoading = false }) {
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <div className="px-8 py-6 border-t border-white/10 dark:border-white/5 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="glass-card rounded-2xl flex items-center gap-4 px-6 py-4 transition-all focus-within:ring-2 focus-within:ring-gray-900/20 dark:focus-within:ring-gray-100/20 shadow-sm">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Prometheus anything..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="rounded-full bg-gray-900 dark:bg-gray-100 px-6 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="status-indicator status-processing w-2 h-2"></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <span>Send</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
