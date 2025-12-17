from pydantic import BaseModel
from typing import Optional, Literal

class Reflection(BaseModel):
    """
    Reflection is a class which defines Reflector agent output.
    It has 2 fields:
        - Summary is what the workflow agent executed and tldr.
        - While control is if something unexpected happened while executing.
            - recommended_action:
                retry - retries the current action / plan
                modify_input - modifies the input of the current action
                escalate - request human intervention
                abort - stop everything
                skip

    """
    class ErrorControl(BaseModel):

        error_detected: Optional[bool] = None
        error_reason: Optional[str] = None
        recommended_action: Optional[Literal[
            "retry",
            "modify_input",
            "escalate",
            "abort",
            "skip"
        ]] = None

    summary: Optional[str] = None
    control: Optional[ErrorControl] = None