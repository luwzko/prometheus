from pydantic import BaseModel
from typing import Optional, Dict

class APIPromptResponse(BaseModel):
    prompt: Optional[str] = None
    output_struct: Optional[Dict[str, str]] = None