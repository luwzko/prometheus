from pydantic import BaseModel
from typing import Optional, Literal

from prometheus.data_models.action import ActionRequest

class PrometheusResponse(BaseModel):
    """
    Represents the models response, its structure is based on the schema in the output_structure.
    """

    mode: Literal["respond", "act", "plan"] = "respond"
    text: str = None

    task: Optional[str] = None
    action_request: Optional[ActionRequest] = None

class ActionAgentResponse(BaseModel):
    """
    Represents the response of action agents ie. think/code
    """
    text: str
    response: str