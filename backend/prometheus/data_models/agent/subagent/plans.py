from pydantic import BaseModel
from typing import List

from prometheus.data_models.action import ActionRequest

class PlannedWorkflow(BaseModel):
    """
    Represents the workflow agents response, its structure is based on the schema in the output_structure.
    """
    class PlanningSteps(BaseModel):

        class ControlData(BaseModel):
            id: str
            depends_on: List[str]
            ref_output_as: str

        message: str | None = None
        intent: str | None = None

        action_request: ActionRequest
        control: ControlData

    plans: List[PlanningSteps]

    def __iter__(self):
        return iter(self.plans)