import { useState, useRef, useEffect } from "react";
import { isFileTypeSupported, formatFileSize } from "../utils/fileUtils";

export default function InputBar({ onSend, isLoading = false }) {
    const [input, setInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        
        for (const file of files) {
            if (!isFileTypeSupported(file)) {
                alert(`File type not supported: ${file.name}\nSupported types: images, text files, code files`);
                continue;
            }
        }
        
        // Filter out unsupported files and add to state
        const validFiles = files.filter(file => isFileTypeSupported(file));
        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const hasMessage = input.trim();
        const hasFiles = selectedFiles.length > 0;
        
        if ((hasMessage || hasFiles) && !isLoading) {
            // Send files and message to parent
            onSend({
                message: hasMessage ? input : null,
                files: selectedFiles
            });
            setInput("");
            setSelectedFiles([]);
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className="px-8 py-6 border-t border-white/10 dark:border-white/5 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                {/* File Previews */}
                {selectedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => {
                            const isImage = file.type && file.type.startsWith('image/');
                            const dataUrl = isImage ? URL.createObjectURL(file) : null;
                            
                            return (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="glass-card rounded-lg p-2 flex items-center gap-2 max-w-xs"
                                >
                                    {isImage && dataUrl ? (
                                        <img
                                            src={dataUrl}
                                            alt={file.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-white/20 dark:hover:bg-white/10 rounded transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="glass-card rounded-2xl flex items-center gap-4 px-6 py-4 transition-all focus-within:ring-2 focus-within:ring-gray-900/20 dark:focus-within:ring-gray-100/20 shadow-sm">
                    {/* File Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        accept=".txt,.csv,.md,.html,.json,.js,.py,.xml,.jpg,.jpeg,.png,.gif,.webp"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                        title="Upload files"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </label>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            // Submit on Enter (without Shift)
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                            // Shift+Enter allows newline (default behavior)
                        }}
                        placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Ask Prometheus anything..."}
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium resize-none overflow-y-auto leading-relaxed"
                        rows={1}
                        disabled={isLoading}
                        style={{
                            minHeight: '24px',
                            maxHeight: '120px',
                        }}
                    />
                    <button
                        type="submit"
                        className="rounded-full bg-gray-900 dark:bg-gray-100 px-6 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
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
