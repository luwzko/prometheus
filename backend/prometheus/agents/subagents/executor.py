from prometheus.agents.base_agent import BaseAgent
from prometheus.setup.config import AgentConfig

from prometheus.data_models.action import ActionOutput
from prometheus.data_models.agent import Plan, ExecutorContext

from prometheus.actions.action_manager import run

import re

import logging
logger = logging.getLogger("prometheus.subagents.executor")

class ExecutorAgent(BaseAgent[ExecutorContext, ExecutorContext]):
    """
    Subagent Executor, it has an output structure and prompt, but they are not used.
    An object which parses Planners output into actions and runs it.
    """
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config, ExecutorContext)

        self.ref_pattern = re.compile(r"\{ref:([A-Za-z0-9_]+)\}")

    def execute(self, plan: Plan):
        """
        A plan is basically a list of steps, each step has fields:
        message, intent, action_request and control

        each field is pretty much self-explanatory except control.
        `control` dictates how actions relate to one another and how they are saved.

        :param plan:

        :return context:
        """
        context = ExecutorContext()

        def replace_refs(arg):
            def repl(match: re.Match):
                name = match.group(1)
                value = context[name].action_output.result
                return str(value)

            return self.ref_pattern.sub(repl, arg)

        for step in plan:
            step: Plan.PlanningSteps
            execution_step = ExecutorContext.ExecutionSteps()

            self.logger.debug(f"Message: {step.message}")
            self.logger.debug(f"Control: {step.control}")

            execution_step.message = step.message
            execution_step.intent = step.intent

            execution_step.action_request = step.action_request
            execution_step.control = step.control

            action_output: ActionOutput

            for arg in step.action_request.action_arguments:

                if self.ref_pattern.findall(arg.value):
                    arg.value = replace_refs(arg.value)

            action_output = run(step.action_request)
            execution_step.action_output = action_output

            context.add_step(execution_step)

            if action_output is not None:
                self.logger.debug("Successfully ran the action.")

        return context