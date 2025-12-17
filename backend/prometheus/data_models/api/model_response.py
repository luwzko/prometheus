from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ModelResponse(BaseModel):
    """
    Defines the structure of the API response.
    With tool_choice set, we always expect tool calls.
    """
    choices: Optional[List[Dict[str, Any]]] = None
    error: Optional[Dict[str, Any]] = None

    def is_success(self) -> bool:
        """Check if the response was successful"""
        return self.choices is not None and len(self.choices) > 0

    def get_tool_arguments(self) -> str:
        """Get the JSON arguments from tool call (required path)"""
        if not self.is_success():
            raise ValueError("No choices in response")

        try:
            tool_call = self.choices[0]["message"]["tool_calls"][0]
            return tool_call["function"]["arguments"]
        except (KeyError, IndexError) as e:
            raise ValueError(f"Expected tool call not found in response: {e}")

    def get_error(self) -> tuple[str, int] | None:
        """Get error message and code if present"""
        if self.error:
            print(self.error)
            return self.error.get("message"), self.error.get("code")
        return None
