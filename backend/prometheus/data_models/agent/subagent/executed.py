from pydantic import BaseModel, Field
from typing import Optional, List, Dict

from prometheus.data_models.action import ActionOutput, ActionRequest

class ExecutorContext(BaseModel):
    """
    ExecutorContext is a class which defines what did the workflow agent plan, executed context and Control parameters.
    It a wrapper for a dictionary.
    WorkflowAgent returns an object of this class.
    """
    class ExecutionSteps(BaseModel):
        class ControlData(BaseModel):
            id: Optional[str] = None
            depends_on: Optional[List[str]] = None
            ref_output_as: Optional[str] = None

        message: Optional[str] = None
        intent: Optional[str] = None

        action_request: Optional[ActionRequest] = None
        action_output: Optional[ActionOutput] = None

        control: Optional[ControlData] = None

    executed: Optional[Dict[str, ExecutionSteps]] = Field(default_factory=dict)

    def add_step(self, execution_step: ExecutionSteps):
        key = execution_step.control.ref_output_as

        if key is None:
            raise ValueError("ExecutionStep.control.ref_output_as is None; cannot store in executed dict.")

        self.executed[key] = execution_step

    def __getitem__(self, item: str):
        return self.executed[item]

    def __iter__(self):
        return iter(self.executed)
