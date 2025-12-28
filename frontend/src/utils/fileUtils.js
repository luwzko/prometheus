/**
 * File utility functions for handling file uploads
 */

/**
 * MIME type mapping for file extensions
 */
const MIME_TYPE_MAP = {
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".md": "text/markdown",
    ".html": "text/html",
    ".json": "application/json",
    ".js": "application/javascript",
    ".py": "application/python",
    ".xml": "application/xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
};

/**
 * Supported MIME types
 */
const SUPPORTED_MIME_TYPES = [
    "text/plain",
    "text/csv",
    "text/markdown",
    "text/html",
    "application/json",
    "application/javascript",
    "application/python",
    "application/xml",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];

/**
 * Detect MIME type from file extension
 * @param {string} filename - File name with extension
 * @returns {string|null} - MIME type or null
 */
export function detectMimeType(filename) {
    if (!filename) return null;
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return MIME_TYPE_MAP[extension] || null;
}

/**
 * Check if file type is supported
 * @param {File} file - File object
 * @returns {boolean} - True if supported
 */
export function isFileTypeSupported(file) {
    const mimeType = file.type || detectMimeType(file.name);
    if (!mimeType) return false;
    return SUPPORTED_MIME_TYPES.includes(mimeType);
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

