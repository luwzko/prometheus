from prometheus.agents.base_agent import BaseAgent
from prometheus.config.config import AgentConfig
from prometheus.data_models.agent.subagent.analysis import Analysis

class Analyzer(BaseAgent[Analysis, Analysis]):
    """Agent used to analyze user tasks and break it down for WorkflowAgent."""
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, Analysis)

    def execute(self, task: str | None):
        analysis: Analysis = self._interact(task)

        return analysis