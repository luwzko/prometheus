from pydantic import BaseModel
from typing import Optional, List, Any

class ActionRequest(BaseModel):
    """
    A data class which describes an Action request. Which action to use and what are the arguments.
    """
    class ActionArgument(BaseModel):
        name: str = None
        value: Any = None

    action_name: str
    action_arguments: Optional[List[ActionArgument]]

    def get_dict(self):
        return { arg.name: arg.value for arg in self.action_arguments }