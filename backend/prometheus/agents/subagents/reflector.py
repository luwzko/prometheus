from prometheus.agents.base_agent import BaseAgent
from prometheus.data_models.agent import Reflection

from prometheus.config.config import AgentConfig

from typing import TypeVar
from pydantic import BaseModel

TModel = TypeVar("TModel", bound = BaseModel)

class ReflectorAgent(BaseAgent[Reflection, Reflection]):
    """
    ReflectorAgent is designed to reflect / retrospect on agent output.
    Previously it could only reflect on PrometheusOutput, now it can on all BaseModel inherited data models.
    """
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, Reflection)

    def execute(self, agent_output: TModel):
        reflection = self._interact(agent_output.model_dump_json())

        return reflection