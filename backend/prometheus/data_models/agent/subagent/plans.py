from pydantic import BaseModel
from typing import List

from prometheus.data_models.action import ActionRequest

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