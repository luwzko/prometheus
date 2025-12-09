from pydantic import BaseModel
from typing import Optional

class Reflection(BaseModel):
    class ErrorControl(BaseModel):

        error_detected: Optional[bool] = None
        error_reason: Optional[str] = None
        recommended_action: Optional[str] = None

    summary: Optional[str] = None
    control: Optional[ErrorControl] = None