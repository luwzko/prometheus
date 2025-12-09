from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import ExecutorContext, Reflection

from prometheus.setup.config import AgentConfig

import logging
logger = logging.getLogger("prometheus.subagents.reflector")

class ReflectorAgent(BaseAgent):
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config)

    def execute(self, executed_context: ExecutorContext):
        reflector_response = self._interact(executed_context.model_dump_json())
        reflection = Reflection.model_validate(reflector_response)

        if reflection is None:
            logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return reflection