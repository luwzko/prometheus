from prometheus.setup.config import AgentConfig
from prometheus.prompt import AgentPrompt
from prometheus.model import Model

class BaseAgent:
    """
    Base class from which all future agents inherit from.
    """
    def __init__(self, agent_config: AgentConfig):
        self._agent_config = agent_config

        self.model = Model(self._agent_config.model_config_)
        self.prompt = AgentPrompt(self._agent_config)

    def get_model_config(self):
        """
        Fetch model config of the agent.
        :return:
        """
        return self._agent_config.model_config_

    def _interact(self, message: str) -> str:
        """
        Basic function to interact with the model as the agent.

        :param message:
        :return:
        """
        full_prompt = self.prompt.get(message)
        response = self.model.chat(full_prompt)

        return response

    def execute(self, message: str):
        """
        Main way to communicate with the agent, its customizable for extra functionality.
        :param message:
        :return:
        """
        raise NotImplementedError