from prometheus.agents.base_agent import BaseAgent
from prometheus.agents.conversation_history import ConversationHistory
from prometheus.agents.subagents import WorkflowAgent, ReflectorAgent

from prometheus.data_models.agent import PrometheusResponse
from prometheus.data_models.shared import ModelOutput, PrometheusOutput, UserInput

from prometheus.actions.action_manager import run, ActionManager
from prometheus.config.config import PrometheusConfig, MainConfig

class Prometheus(BaseAgent[PrometheusResponse, PrometheusOutput]):
    """
    This is the main agent, Prometheus decides does a request need to be planned, acted on or just a response.
    """
    def __init__(self, prometheus_config: PrometheusConfig):
        super().__init__(prometheus_config.main_agent, PrometheusResponse, PrometheusOutput)
        self._config: MainConfig
        self.prometheus_config = prometheus_config

        self.workflow = WorkflowAgent(self.logger, self.prometheus_config.workflow, self.prometheus_config.reflector, self.prometheus_config.analyzer)
        self.reflector = ReflectorAgent(self.prometheus_config.reflector)

        self.action_manager = ActionManager(self.prometheus_config.action_manager)
        self.conversation_history = ConversationHistory[UserInput, PrometheusOutput](
            self.logger,
            UserInput,
            self.output_model,
            save_file = f"history.jsonl"
        )

    def execute(self, user_input: UserInput) -> PrometheusOutput | None:
        validated = self._interact(user_input, self.conversation_history.get_context_msg())
        print(validated)

        prometheus_output: PrometheusOutput = PrometheusOutput()

        prometheus_output.mode = validated.mode
        prometheus_output.text = ModelOutput(content = validated.text)

        # handle mode specific interactions
        match validated.mode:
            case "respond": pass
            case "act":
                action_output = run(validated.action_request)
                prometheus_output.action_output = action_output

            case "plan":
                prometheus_output.task = validated.task
                # pass task + analyzed plan -> workflow -> plan and execute
                executed = self.workflow.execute(user_input.message, validated.task)
                # add all generated context to the prometheus output
                prometheus_output.executed = executed

            case _:
                self.logger.warning("Prometheus hallucinated response mode.")
                return None

        # if the mode is either act or plan, reflect on prometheus output
        if validated.mode in ["act", "plan"]:
            # calling the reflector agent
            reflection_context = self.reflector.execute(prometheus_output)
            prometheus_output.reflection = reflection_context

        self.conversation_history.add_to_history(user_input, prometheus_output)
        return prometheus_output