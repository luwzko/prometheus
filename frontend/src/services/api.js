/**
 * API Service for Prometheus Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Send a chat message to Prometheus
 * @param {string|Object} userInput - User's message string or object with message and files
 * @returns {Promise<PrometheusOutput>}
 */
export async function sendChatMessage(userInput) {
    try {
        // Always use FormData (backend expects multipart/form-data)
        const formData = new FormData();
        
        // Extract message
        const message = typeof userInput === 'string' 
            ? userInput 
            : (userInput.message || null);
        
        // Add message if provided (even if empty string, backend handles None)
        if (message !== null && message !== undefined) {
            formData.append('message', message);
        }
        
        // Add files if present
        if (typeof userInput === 'object' && userInput.files) {
            const files = Array.isArray(userInput.files) ? userInput.files : [];
            files.forEach((file) => {
                if (file instanceof File) {
                    formData.append('files', file);
                }
            });
        }
        
        // POST with FormData (don't set Content-Type - browser does it automatically)
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: formData,
            // DO NOT set Content-Type header - browser sets it automatically with boundary
        });
        
        if (!response.ok) {
            throw await handleErrorResponse(response);
        }
        
        return await response.json();
    } catch (error) {
        // Handle network errors (CORS, connection failures, etc.)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            const networkError = new Error(
                'Network error: Could not connect to backend. ' +
                'Make sure the backend is running and CORS is configured. ' +
                `Tried to reach: ${API_BASE_URL}/chat`
            );
            networkError.isNetworkError = true;
            networkError.originalError = error;
            console.error('Network error details:', error);
            throw networkError;
        }
        
        // Re-throw other errors
        throw error;
    }
}

/**
 * Handle error response from API
 * @param {Response} response - Fetch response object
 * @returns {Promise<Error>}
 */
async function handleErrorResponse(response) {
    let errorMessage = `HTTP ${response.status} Error`;
    let errorDetails = null;
    
    try {
        const errorData = await response.json();
        errorDetails = errorData;
        // FastAPI typically returns errors in 'detail' field
        if (Array.isArray(errorData.detail)) {
            // Validation errors come as array
            errorMessage = errorData.detail.map(err => 
                `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
        } else if (errorData.detail) {
            errorMessage = String(errorData.detail);
        } else if (errorData.message) {
            errorMessage = String(errorData.message);
        } else {
            errorMessage = `Server error (${response.status}). Check backend logs.`;
        }
        console.error('Backend error details:', errorData);
    } catch (e) {
        // If response is not JSON, use status text
        try {
            const text = await response.text();
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
            console.error('Non-JSON error response:', text);
        } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
    }
    
    // Add status code to error message for better debugging
    if (response.status === 500) {
        errorMessage = `Backend server error (500). The backend may have a response model mismatch. Details: ${errorMessage}`;
    } else if (response.status === 422) {
        errorMessage = `Validation error (422). ${errorMessage}`;
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = errorDetails;
    return error;
}

/**
 * Get list of available actions
 * @returns {Promise<Array>}
 */
export async function getAvailableActions() {
    try {
        const response = await fetch(`${API_BASE_URL}/actions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching actions:', error);
        throw error;
    }
}

/**
 * Get all agents configuration
 * @returns {Promise<ConfigResponse>}
 */
export async function getAllAgentsConfig() {
    try {
        const response = await fetch(`${API_BASE_URL}/config/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching all agents config:', error);
        throw error;
    }
}

/**
 * Get specific agent configuration
 * @param {string} agentName - Agent name (e.g., 'main_agent', 'workflow', 'reflector')
 * @returns {Promise<AgentConfigResponse>}
 */
export async function getAgentConfig(agentName) {
    try {
        const response = await fetch(`${API_BASE_URL}/config/${agentName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching agent config for ${agentName}:`, error);
        throw error;
    }
}

/**
 * Format PrometheusOutput for display in chat
 * 
 * HOW IT UNPACKS THE PROMETHEUS OUTPUT:
 * 
 * The PrometheusOutput object has this structure (from context.py):
 * {
 *   mode: "respond" | "act" | "plan",           // Required: determines response type
 *   text: { content: string } | null,          // Optional: ModelOutput with content
 *   action_output: {                            // Optional: ActionOutput (for act mode)
 *     source: string,                           // Action source (e.g., "Calculator")
 *     variable: string,                         // Variable name
 *     result: any                               // Action result
 *   } | null,
 *   task: string | null,                        // Optional: task description (for plan mode)
 *   plan: {                                     // Optional: Plan object (for plan mode)
 *     plans: [                                  // List of PlanningSteps
 *       {
 *         message: string,
 *         intent: string,
 *         action_request: { action_name, action_arguments },
 *         control: { id, depends_on, ref_output_as }
 *       }
 *     ]
 *   } | null,
 *   executed: {                                 // Optional: ExecutorContext (after execution)
 *     executed: {                               // Dict of execution steps
 *       [key]: {
 *         message, intent, action_request,
 *         action_output: { source, variable, result },
 *         control
 *       }
 *     }
 *   } | null,
 *   reflection: {                               // NEW - Reflection from REFLECTOR agent
 *     summary: string,                          // User-friendly summary
 *     control: {                                // Control fields (can be null)
 *       error_detected: boolean,
 *       error_reason: string | null,
 *       recommended_action: string | null
 *     } | null
 *   } | null
 * }
 * 
 * This function extracts the main text content for the message preview.
 * Reflection summary is now the primary output for act/plan modes.
 * Full details are shown in the expandable MessageBubble component.
 * 
 * @param {PrometheusOutput} response - Response from API
 * @returns {string} - Main text content for display
 */
export function formatPrometheusResponse(response) {
    if (!response) return 'No response received.';

    // Priority 1: Reflection summary (primary user-facing output for act/plan modes)
    if (response.reflection && response.reflection.summary) {
        return response.reflection.summary;
    }

    // Extract text content - text is a ModelOutput object with content field
    const getTextContent = () => {
        if (response.text && response.text.content) {
            return response.text.content;
        }
        if (typeof response.text === 'string') {
            // Fallback for old format
            return response.text;
        }
        return null;
    };

    const textContent = getTextContent();

    // Handle different modes - return appropriate preview text
    switch (response.mode) {
        case 'respond':
            // Agent is responding with text
            return textContent || 'Response received.';
        
        case 'act':
            // Agent is executing an action
            // Show text content if available, otherwise show action info
            if (textContent) {
                return textContent;
            }
            if (response.action_output) {
                return `Executed ${response.action_output.source || 'action'}: ${response.action_output.result}`;
            }
            return 'Action executed.';
        
        case 'plan':
            // Agent is creating a plan
            // Show text content if available, otherwise show task
            if (textContent) {
                return textContent;
            }
            if (response.task) {
                return `Planning: ${response.task}`;
            }
            return 'Plan created.';
        
        default:
            // Unknown mode - show text or fallback
            return textContent || 'Response received.';
    }
}

