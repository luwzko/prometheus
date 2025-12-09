from pydantic import BaseModel

from prometheus.agents.conversation_history import ConversationHistory
from prometheus.data_models.shared import UserInput, PrometheusOutput
from prometheus.setup.config import AgentConfig
from prometheus.prompt import AgentPrompt
from prometheus.model import Model

from typing import List, Tuple, Type, Generic, TypeVar

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

        self.response_model: Type[TResponse] = response_model
        self.output_model: Type[TOutput] = output_model if output_model is not None else response_model
        self.conversation_history = ConversationHistory[UserInput, TOutput]()

        self.model = Model(self._agent_config.model_config_)
        self.prompt = AgentPrompt(self._agent_config)


    def get_model_config(self):
        """
        Fetch model config of the agent.
        :return:
        """
        return self._agent_config.model_config_

    def _interact(self, message: str) -> BaseModel:
        """
        Basic function to interact with the model as the agent.

        :param message:
        :return:
        """
        context_messages = self.conversation_history.get_context_msg()
        full_prompt = self.prompt.get(message, context_messages)

        response = self.model.chat(full_prompt)
        validated = self.response_model.model_validate(response)

        return validated

    def execute(self, message: str):
        """
        Main way to communicate with the agent, its customizable for extra functionality.
        :param message:
        :return:
        """
        raise NotImplementedError