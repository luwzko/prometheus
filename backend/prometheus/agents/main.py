from prometheus.setup.config import PrometheusConfig
from prometheus.agents.base_agent import BaseAgent
from prometheus.agents.subagents import PlannerAgent, ExecutorAgent, SummarizerAgent

from prometheus.data_models.responses import PrometheusResponse
from prometheus.data_models.context import ModelOutput, PrometheusOutput

from prometheus.actions.action_manager import run, ActionManager

import logging
logger = logging.getLogger("prometheus.agents.main")

class Prometheus(BaseAgent):
    """
    This is the main agent, Prometheus decides does a request need to be planned, acted on or just a response.
    """
    def __init__(self, prometheus_config: PrometheusConfig):
        super().__init__(prometheus_config.main_agent)

        self.action_manager = ActionManager(prometheus_config.action_manager)

        self.planner = PlannerAgent(prometheus_config.planner)
        self.executor = ExecutorAgent(prometheus_config.executor)
        #self.summarizer = SummarizerAgent(prometheus_config.summarizer)

    def execute(self, message: str) -> PrometheusOutput | None:
        content = self._interact(message)
        validated = PrometheusResponse.model_validate(content)

        if validated is None:
            logger.error("API error incurred.")
            raise Exception("API error incurred.")

        prometheus_output: PrometheusOutput = PrometheusOutput()

        prometheus_output.mode = validated.mode
        prometheus_output.text = ModelOutput.model_validate({"content": validated.text})

        logger.debug(f"Prometheus decided on running: {validated.mode}")
        print(validated)
        match validated.mode:
            case "respond": ...
            case "act":
                action_output = run(validated.action_request)
                prometheus_output.action_output = action_output

            case "plan":
                plans = self.planner.execute(validated.task)
                executor_context = self.executor.execute(plans)

                prometheus_output.task = validated.task
                prometheus_output.plan = plans

                prometheus_output.executed = executor_context

            case _:

                logger.warning("Prometheus hallucinated response mode.")
                return None

        return prometheus_output