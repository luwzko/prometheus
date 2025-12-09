from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import ActionAgentResponse
from prometheus.setup.config import AgentConfig

import logging
logger = logging.getLogger("prometheus.action_agents.think")

class CodeAgent(BaseAgent):
    """
    A special agent that is basically an action, this one specializes in coding.
    These kind of action agents use the same output structure but different prompts.
    """
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, response_model = ActionAgentResponse)

    def execute(self, task: str):
        logger.debug(f"Calling action agent CODE with {task}.")

        validated = self._interact(task)

        if validated is None:
            logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return validated.response