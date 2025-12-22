import logging

from prometheus.agents.base_agent import BaseAgent
from prometheus.config.config import AgentConfig
from prometheus.data_models.agent import PlannedWorkflow
from prometheus.data_models.agent.subagent.analysis import Analysis


class WorkflowPlanner(BaseAgent[PlannedWorkflow, PlannedWorkflow]):
    """
    WorkflowPlanner is a part of WorkflowAgent. The planner creates the workflow by what task is given.
    It returns PlannedWorkflow.
    """
    def __init__(self, workflow_logger: logging.Logger, agent_config: AgentConfig):
        super().__init__(agent_config, PlannedWorkflow)

        self.logger = workflow_logger.getChild("planner")

    def execute(self, task: Analysis):
        """Main method to interact with WorkflowPlanner."""
        plan = self._interact(task.model_dump_json())

        return plan