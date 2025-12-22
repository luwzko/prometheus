import logging

from prometheus.data_models.agent.subagent.analysis import Analysis
from .workflow_executor import WorkflowExecutor
from .workflow_planner import WorkflowPlanner

from prometheus.config.config import AgentConfig
from prometheus.data_models.agent import ExecutedWorkflow, PlannedWorkflow
from ..analyzer import Analyzer


class WorkflowAgent:
    """
    Subagent Workflow, it has a special output structure and prompt.
    It's used to breakdown tasks into linked or not linked actions.
    Then those broken down tasks get executed and fed into executor context
    """
    def __init__(self, logger: logging.Logger, planner_config: AgentConfig, reflector_config: AgentConfig, analyzer_config: AgentConfig):
        self.planner_config = planner_config
        self.reflector_config = reflector_config
        self.analyzer_config = analyzer_config

        self.logger = logger.getChild("workflow")

        self.planner = WorkflowPlanner(self.logger, self.planner_config)
        self.executor = WorkflowExecutor(self.logger, self.reflector_config)

        self.analyzer = Analyzer(self.analyzer_config)

    def execute(self, message: str, task: str):
        analysis: Analysis = self.analyzer.execute(f"message=`{message}`, task=`{task}`")

        # first generate plan
        plan: PlannedWorkflow = self.planner.execute(analysis)

        # then execute it
        executed: ExecutedWorkflow = self.executor.execute_plan(plan)

        return executed