from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal

from .action import ActionRequest

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

class PrometheusResponse(BaseModel):
    """
    Represents the models response, its structure is based on the schema in the output_structure.
    """

    mode: str = Literal["respond", "act", "plan"]
    text: str = None

    task: Optional[str] = None
    action_request: Optional[ActionRequest] = None

class ActionAgentResponse(BaseModel):
    """
    Represents the response of action agents ie. think/code
    """
    text: str
    response: str

class Plan(BaseModel):
    """
    Represents the planner agents response, its structure is based on the schema in the output_structure.
    """
    class PlanningSteps(BaseModel):

        class ControlData(BaseModel):
            id: str = None
            depends_on: List[str] = None
            ref_output_as: str = None

        message: str
        intent: str

        action_request: ActionRequest
        control: ControlData

    plans: List[PlanningSteps]

    def __iter__(self):
        return iter(self.plans)

class Reflection(BaseModel):
    class ErrorControl(BaseModel):

        error_detected: Optional[bool] = None
        error_reason: Optional[str] = None
        recommended_action: Optional[str] = None

    summary: Optional[str] = None
    control: Optional[ErrorControl] = None

class APIPromptResponse(BaseModel):
    prompt: Optional[str] = None
    output_struct: Optional[Dict[str, str]] = None

class ModelConfigResponse(BaseModel):
    """Public version of ModelConfig - excludes sensitive fields"""
    name: str
    max_tokens: int = Field(le=8192)
    temperature: float = Field(ge=0.0, le=1.0)