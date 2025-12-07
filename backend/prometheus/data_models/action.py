from pydantic import BaseModel
from typing import Optional, List, Type, Any

class ActionRequest(BaseModel):
    class ActionArgument(BaseModel):
        name: str = None
        value: Any = None

    action_name: str
    action_arguments: Optional[List[ActionArgument]]

    def get_dict(self):
        return { arg.name: arg.value for arg in self.action_arguments }

class Action(BaseModel):
    """
    A data class which describes the Action, its name, description and how arguments are formed.
    """
    class ArgumentSignature(BaseModel):
        """
        A single argument signature, describes argument name and type.
        for example. x: str = ArgumentSignature(arg_name = "x", arg_type = str)
        """
        arg_name: str
        arg_type: str

        def __str__(self):
            return f"{self.arg_name}: {self.arg_type}"

    name: str
    description: str
    variable: str
    arguments_sig: Optional[List[ArgumentSignature]]

    def __str__(self):
        str_repr =\
        (
            f"Name: {self.name}\n"
            f"Description: {self.description}\n"
            "Arguments:\n"
        )
        for arg in self.arguments_sig:
            str_repr += str(arg)
            str_repr += "\n"

        return str_repr

    def __hash__(self):
        return hash((self.name, self.description, self.variable))