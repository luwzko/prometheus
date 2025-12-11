from prometheus.agents.base_agent import BaseAgent
from prometheus.setup.config import AgentConfig

from prometheus.data_models.agent.subagent import Plan

import logging
logger = logging.getLogger("prometheus.subagents.planner")

class PlannerAgent(BaseAgent[Plan, Plan]):
    """
    Subagent Planner, it has a special output structure and prompt.
    Its used to breakdown tasks into linked or not linked actions.
    """
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, Plan)

    def execute(self, task: str):
        plan = self._interact(task)

        if plan is None:
            self.logger.error("API error incurred.")
            raise Exception("API error incurred.")

        return plan