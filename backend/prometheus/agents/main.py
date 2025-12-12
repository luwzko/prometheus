from prometheus.setup.config import PrometheusConfig, MainConfig
from prometheus.agents.base_agent import BaseAgent
from prometheus.agents.subagents import WorkflowAgent, ReflectorAgent

from prometheus.data_models.agent import PrometheusResponse
from prometheus.data_models.shared import ModelOutput, PrometheusOutput, UserInput

from prometheus.actions.action_manager import run, ActionManager

class Prometheus(BaseAgent[PrometheusResponse, PrometheusOutput]):
    """
    This is the main agent, Prometheus decides does a request need to be planned, acted on or just a response.
    """
    def __init__(self, prometheus_config: PrometheusConfig):
        super().__init__(prometheus_config.main_agent, PrometheusResponse, PrometheusOutput)
        self._config: MainConfig
        self.prometheus_config = prometheus_config

        self.workflow = WorkflowAgent(self.prometheus_config.workflow)
        self.reflector = ReflectorAgent(self.prometheus_config.reflector)
        self.action_manager = ActionManager(self.prometheus_config.action_manager)

    def execute(self, message: str) -> PrometheusOutput | None:
        user_input = UserInput(content = message)
        validated = self._interact(message)

        if validated is None:
            self.logger.error("API error incurred.")
            raise Exception("API error incurred.")

        prometheus_output: PrometheusOutput = PrometheusOutput()

        prometheus_output.mode = validated.mode
        prometheus_output.text = ModelOutput.model_validate({"content": validated.text})

        self.logger.debug(f"Prometheus decided on running: {validated.mode}")

        match validated.mode:
            case "respond": ...
            case "act":
                action_output = run(validated.action_request)
                prometheus_output.action_output = action_output

            case "plan":
                prometheus_output.task = validated.task

                # plan and execute
                executor_context = self.workflow.execute(validated.task)
                # now reflect on it
                reflection_context = self.reflector.execute(executor_context)

                # add all generated context to the prometheus output
                prometheus_output.executed = executor_context
                prometheus_output.reflection = reflection_context

            case _:

                self.logger.warning("Prometheus hallucinated response mode.")
                return None

        self.conversation_history.add_to_history(user_input, prometheus_output)
        return prometheus_output