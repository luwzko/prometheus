from pydantic import BaseModel

from prometheus.setup.config import AgentConfig

from typing import TypeAlias, Dict, Type, List
import json

import logging
logger = logging.getLogger("prometheus.prompt")

def _generate_tool_schema(response_model: BaseModel, tool_name: str = "respond"):
    """
    Generates the tool schema so the model knows how to respond.
    :param response_model:
    :param tool_name:
    :return:
    """
    return {
        "type": "function",
        "function": {
            "name": tool_name,
            "description": f"Respond using the {response_model.__name__} format",
            "parameters": response_model.model_json_schema()
        }
    }

class AgentPrompt:
    """
    AgentPrompt is a class which combines prompt and output structure and other agent variables.
    It reads contents of prompt file and output structure file which are contained in AgentConfig.
    """

    def __init__(self, agent_config: AgentConfig, response_model: BaseModel):
        self._agent_config = agent_config
        self._response_model: BaseModel = response_model

        self._prompt: str = self._agent_config.prompt_content
        self._response_format: Dict[str, str]

        from prometheus.actions.action_manager import get_action_details
        self.variables = {
            "{action_data}": get_action_details()
        }

        self._add_details()
        self._response_format =\
            {
                "model": "",
                "messages": [],
                "tools": [],
                "tool_choice": {
                    "type": "function",
                    "function": {"name": "respond"}
                },
                "temperature": 0.0,
                "max_tokens": 0
            }

        self._initialize()

    def _initialize(self) -> None:
        """
        This function initializes the prompt structure for future use.
        It sets `model`, `max_tokens` and `temperature` fields with ones in the agents model_config.

        It sets how the model should respond using `tools`.
        :return None:
        """
        self._response_format["model"] = self._agent_config.model_config_.name
        self._response_format["max_tokens"] = self._agent_config.model_config_.max_tokens
        self._response_format["temperature"] = self._agent_config.model_config_.temperature

        self._response_format["tools"] = [_generate_tool_schema(self._response_model)]

        self._agent_config.load_response_format(self._response_format)

    def _add_details(self):
        """
        This function replaces variables in the prompt with what we set them.
        :return:
        """
        for var, data in self.variables.items():
            self._prompt = self._prompt.replace(var, data)

    def get(self, user_message: str, history_context: List[dict]) -> str:
        """
        `get` method is the main way to use the AgentPrompt class.

        :param user_message:
        :param history_context:
        :return finalized prompt:
        """
        logger.debug(f"Fetching prompt structure:\n msg = {user_message}")

        def generate_message(role: str, content: str):
            return {"role": role, "content": content}

        messages = [
            generate_message("system", self._prompt),
            *history_context,
            generate_message("user", user_message)
        ]

        self._response_format["messages"] = messages

        return json.dumps(self._response_format)