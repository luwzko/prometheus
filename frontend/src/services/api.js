/**
 * API Service for Prometheus Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Send a chat message to Prometheus
 * @param {string} message - User's message
 * @returns {Promise<PrometheusOutput>}
 */
export async function sendChatMessage(message) {
    try {
        // FastAPI endpoint expects message as a query parameter
        // POST /api/chat?message=Hello
        const response = await fetch(`${API_BASE_URL}/chat?message=${encodeURIComponent(message)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Try to get error details from response
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
            throw error;
        }

        const data = await response.json();
        return data;
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
        
        // Re-throw other errors with better context
        if (!error.status) {
            console.error('Unexpected error sending chat message:', error);
        }
        throw error;
    }
}

/**
 * Get agent prompt and output structure (DEPRECATED - use getAgentConfig instead)
 * @deprecated Use getAgentConfig() from /api/config/{agent_name} instead
 * @param {string} agentName - Agent name ('main', 'planner', 'executor', 'reflector')
 * @returns {Promise<APIPromptResponse>}
 */
export async function getAgentPrompt(agentName) {
    console.warn('getAgentPrompt is deprecated. Use getAgentConfig instead.');
    // Fallback to new endpoint
    return getAgentConfig(agentName);
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
 * Get model configuration (DEPRECATED - use getAllAgentsConfig instead)
 * @deprecated Use getAllAgentsConfig() from /api/config/ instead
 * @returns {Promise<ModelConfigResponse>}
 */
export async function getModelConfig() {
    console.warn('getModelConfig is deprecated. Use getAllAgentsConfig instead.');
    try {
        const allConfig = await getAllAgentsConfig();
        return allConfig.global_model_config || {};
    } catch (error) {
        console.error('Error fetching model config:', error);
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

