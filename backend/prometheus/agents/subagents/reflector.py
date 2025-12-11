from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import ExecutorContext, Reflection

from prometheus.setup.config import AgentConfig

import logging
logger = logging.getLogger("prometheus.subagents.reflector")

class ReflectorAgent(BaseAgent[Reflection, Reflection]):
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, Reflection)

    def execute(self, executed_context: ExecutorContext):
        reflection = self._interact(executed_context.model_dump_json())

        if reflection is None:
            self.logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return reflection