from prometheus.agents.action_agents.code_agent import CodeAgent
from prometheus.agents.action_agents.think_agent import ThinkAgent

from prometheus.setup.config import ActionManagerConfig
from prometheus.data_models.action import *

from typing import Callable, Dict, Any, List
import inspect
import traceback

import logging
logger = logging.getLogger("prometheus.actions.manager")

def action(name: str, description: str, variable: str):
    """
    Decorator used to mark functions as actions.
    :param name:
    The name of the action, default is the action functions name.

    :param description:
    General description about the action and its parameters

    :param variable:
    The name of the variable which is given to the actions output.

    """
    def decorator(func: Callable[..., Any]):
        # fetch name, description and variable name of the action
        action_name = name or func.__name__
        action_description = description or "No description added."


        # arguments_sig is a list of argument signatures, which is argument name : argument type
        arguments_sig: List[Action.ArgumentSignature] = []
        # generate the functions signature
        signature = inspect.signature(func)

        for arg_name, arg in signature.parameters.items():
            # iterate thru all the parameters and generate argument signature
            arg_type = arg.annotation if arg.annotation != inspect.Parameter.empty else None

            arguments_sig.append(
                Action.ArgumentSignature.model_validate({"arg_name": arg_name, "arg_type": arg_type.__name__})
            )

        act = Action.model_validate({
            "name": action_name,
            "description": action_description,
            "variable": variable,
            "arguments_sig": arguments_sig
        })
        ActionManager.ACTION_REGISTRY[act] = func

        logger.debug(f"Successfully initialized the action named: {action_name}")
        return func

    return decorator

def run(action_request: ActionRequest) -> Any | None:
    """
    Function that runs actions, returns actions result.
    :param action_request:
    :return:
    """
    logger.debug(f"\nCALLED ACTION:\n {action_request}")

    for act, func in ActionManager.ACTION_REGISTRY.items():
        if act.name == action_request.action_name:
            try:
                action_output = ActionOutput()

                action_output.source = act.name
                action_output.variable = act.variable

                result = func(**action_request.get_dict())
                logger.debug(f"\nEXECUTED ACTION:\n result=\n {result}")

                action_output.result = result
                return action_output

            except Exception as e:
                logger.error(
                    f"Error while running action '{act.name}' with args {action_request.get_dict()}"
                    f"{e}\n{traceback.format_exc()}"
                )
                break

    logger.warning(f"No action found with name '{action_request.action_name}'.")
    return None

def get_action_details():
    """
    Generates a string representation of all actions found in ACTION_REGISTRY
    It's useful for giving information to the agent about what actions are currently usable.
    :return details:
    """
    details: str = ""
    for act, func in ActionManager.ACTION_REGISTRY.items():
        details += str(act)

    return details

class ActionManager:
    """
    This is a singleton instance which wraps the action registry and also is the place to put action specific objects like agents
    May needs to be reworked in the future.
    """
    ACTION_REGISTRY: Dict[Action, Callable] = {}
    THINK_AGENT: ThinkAgent
    CODE_AGENT: CodeAgent

    def __init__(self, config: ActionManagerConfig):
        self.config = config

        ActionManager.THINK_AGENT = ThinkAgent(self.config.think_agent)
        ActionManager.CODE_AGENT = CodeAgent(self.config.code_agent)