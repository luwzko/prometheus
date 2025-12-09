from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal

class ModelResponse(BaseModel):
    """
    Defines the structure of the API response.
    """
    choices: Optional[List[Dict[str, Any]]] = None
    error: Optional[Dict[str, Any]] = None

    def is_success(self):
        return self.choices is not None

    def get_content(self) -> str | tuple | None:
        if self.is_success():
            try:
                return self.choices[-1]["message"]["content"]

            except (KeyError, IndexError):
                return None

        elif self.error:
            return self.error["message"], self.error["code"]

        return None