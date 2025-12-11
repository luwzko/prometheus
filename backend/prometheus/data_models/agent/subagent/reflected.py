from pydantic import BaseModel
from typing import Optional

class Reflection(BaseModel):
    """
    Reflection is a class which defines Reflector agent output.
    It has 2 fields, summary and control.
    Summary is what the workflow agent executed and tldr.
    While control is if something unexpected happened while executing.
    """
    class ErrorControl(BaseModel):

        error_detected: Optional[bool] = None
        error_reason: Optional[str] = None
        recommended_action: Optional[str] = None

    summary: Optional[str] = None
    control: Optional[ErrorControl] = None