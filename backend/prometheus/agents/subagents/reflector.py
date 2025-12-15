from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import Reflection
from prometheus.data_models.shared import PrometheusOutput

from prometheus.config.config import AgentConfig

class ReflectorAgent(BaseAgent[Reflection, Reflection]):
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, Reflection)

    def execute(self, prometheus_output: PrometheusOutput):
        reflection = self._interact(prometheus_output.model_dump_json())

        if reflection is None:
            self.logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return reflection