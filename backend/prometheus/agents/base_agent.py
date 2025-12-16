from prometheus.agents.conversation_history import ConversationHistory
from prometheus.data_models.api import ModelResponse
from prometheus.data_models.shared import UserInput
from prometheus.config.config import AgentConfig
from prometheus.prompt import AgentPrompt
from prometheus.model import Model

from typing import Type, Generic, TypeVar
from pydantic import BaseModel
import logging
import json

TResponse = TypeVar("TResponse", bound = BaseModel)
TOutput = TypeVar("TOutput", bound = BaseModel)

class BaseAgent(Generic[TResponse, TOutput]):
    """
    Base class from which all future agents inherit from.
    """
    def __init__(
            self,
            agent_config: AgentConfig,
            response_model: Type[TResponse],
            output_model: Type[TOutput] = None
    ):
        self._agent_config = agent_config

        self.logger = logging.getLogger(f"prometheus.agents.{self.__class__.__name__}")

        self.response_model: Type[TResponse] = response_model
        self.output_model: Type[TOutput] = output_model if output_model is not None else response_model

        self.conversation_history = ConversationHistory[UserInput, TOutput](UserInput, self.output_model)

        self.model = Model(self._agent_config.model_config_)
        self.prompt = AgentPrompt(self._agent_config, self.response_model)

    def get_model_config(self):
        """
        Fetch model config of the agent.
        :return:
        """
        return self._agent_config.model_config_

    def _extract_tool_call(self, model_response: ModelResponse) -> BaseModel:
        try:
            arguments_json = model_response.get_tool_arguments()

            if not arguments_json:
                raise ValueError("Tool call returned empty arguments.")

            arguments = json.loads(arguments_json)
            validated = self.response_model.model_validate(arguments)

            self.logger.debug(f"Successfully extracted and validated tool call: mode={getattr(validated, 'mode', 'N/A')}")
            return validated

        except ValueError as e:
            self.logger.error(f"Failed to extract tool call: {e}")
            raise

        except Exception as e:
            self.logger.error(f"Failed to validate response: {e}")
            raise

    def _interact(self, message: str) -> TResponse:
        """
        Basic function to interact with the model as the agent.

        :param message:
        :return:
        """
        context_messages = self.conversation_history.get_context_msg()
        full_prompt = self.prompt.get(message, context_messages)

        response = self.model.chat(full_prompt)
        validated = self._extract_tool_call(response)

        self.logger.debug(f"Successfully interacted with {message}")
        return validated

    def execute(self, message: str):
        """
        Main way to communicate with the agent, it's customizable for extra functionality.
        :param message:
        :return:
        """
        raise NotImplementedError