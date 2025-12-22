from prometheus.config.config import AgentConfig

from pydantic import BaseModel
from typing import Dict, List
import json

import logging

from prometheus.data_models.shared import UserInput


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
            "description": f"Respond using the {response_model.__name__} format. Arguments must be valid JSON. Do not use XML, angle brackets or <parameter> tags.",
            "parameters": response_model.model_json_schema()
        }
    }

class AgentPrompt:
    """
    AgentPrompt is a class which combines prompt and output structure and other agent variables.
    """

    def __init__(self, logger: logging.Logger, agent_config: AgentConfig, response_model: BaseModel):
        self.logger = logger.getChild("prompt")

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

        self.logger.debug("Initialized.")

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

    def get(self, user_message: UserInput | str, context: List[dict]) -> str:
        """
        `get` method is the main way to use the AgentPrompt class.

        :param user_message:
        :param context:
        :return finalized prompt:
        """
        self.logger.debug(f"Generating prompt for: msg = {user_message}")

        def generate_message(role: str, content: str):
            return {"role": role, "content": content}

        messages = [
            {"role": "system", "content": self._prompt},
            *context,
        ]

        if isinstance(user_message, UserInput):
            messages.append(user_message.build_message_block())

        else:
            messages.append(generate_message("user", user_message))

        self._response_format["messages"] = messages

        return json.dumps(self._response_format)