from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import ActionAgentResponse
from prometheus.config.config import AgentConfig

class ThinkAgent(BaseAgent[ActionAgentResponse, ActionAgentResponse]):
    """
    A special agent that is basically an action, this one specializes in reasoning.
    These kind of action agents use the same output structure but different prompts.
    """
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, ActionAgentResponse)

    def execute(self, task: str):
        self.logger.debug(f"Calling action agent THINK with {task}.")

        validated = self._interact(task)

        if validated is None:
            self.logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return validated.response