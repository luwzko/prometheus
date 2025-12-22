from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class Feedback(BaseModel):
    """
    Feedback is a data class which is used in Analysis. Useful task information for WorkflowPlanner.
    """
    goals: Optional[List[str]] = Field(default_factory = [], description = "User goals for current task")
    requirements: Optional[List[str]] = Field(default_factory = [], description = "What resources (actions, files...) are required. Hard constraints or must-haves")
    questions_for_users: Optional[List[str]] = None

class PlannedStep(BaseModel):
    """Represents single planned step. Similar to PlanningSteps, guide for WorkflowPlanner to build the Workflow."""
    id: str = Field(description = "Unique ID of each step, numeric (1, 2, 3...)")
    description: str = Field(description = "Human-readable step description")

    depends_on: Optional[List[str]] = Field(
        default = None,
        description = "IDs of steps that must be completed first",
    )

class Analysis(BaseModel):
    """
    Analysis is a data class which defines Analyzer agent output.
    """
    feedback: Feedback
    steps: Optional[List[PlannedStep]] = None
    scratchpad: Optional[str] = Field(default = None, description = "Optional natural-language notes; not used for logic.")