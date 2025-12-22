from prometheus.actions.action_manager import run
from prometheus.agents.subagents.reflector import ReflectorAgent
from prometheus.config.config import AgentConfig
from prometheus.data_models.action import ActionOutput
from prometheus.data_models.agent import PlannedWorkflow, ExecutedWorkflow

import logging
import re

class WorkflowExecutor:
    """
    WorkflowExecutor is a part of WorkflowAgent. In the code it's not defined as an agent (by not inheriting BaseAgent).
    But it is considered an agent. It executes the planned workflow step by step.
    """
    def __init__(self, workflow_logger: logging.Logger, reflector_config: AgentConfig):
        self.logger = workflow_logger.getChild("executor")
        self.reflector_config = reflector_config

        self.reflector = ReflectorAgent(self.reflector_config)
        self.ref_pattern = re.compile(r"\{ref:([A-Za-z0-9_]+)\}")

    def execute_plan(self, plan: PlannedWorkflow):
        """
        Main method to interact with WorkflowExecutor.
        A plan is basically a list of steps, each step has fields:
        message, intent, action_request and control

        each field is pretty much self-explanatory except control.
        `control` dictates how actions relate to one another and how they are saved.

        :param plan:

        :return context:
        """
        def replace_refs(arg):
            """Replaces any references in arguments with the context using that ref."""
            def repl(match: re.Match):
                name = match.group(1)
                value = context[name].action_output.result
                return str(value)

            return self.ref_pattern.sub(repl, arg)

        context = ExecutedWorkflow()

        for step in plan:
            step: PlannedWorkflow.PlanningSteps

            self.logger.debug(f"Message: {step.message}")
            self.logger.debug(f"Control: {step.control}")

            action_output: ActionOutput

            # we are iterating over arguments for the action request
            for arg in step.action_request.action_arguments:
                # if we find any references in the argument using the regex
                if self.ref_pattern.findall(arg.value):
                    # replace the reference with its value
                    arg.value = replace_refs(arg.value)

            # run the action
            action_output = run(step.action_request)
            if action_output is not None:
                self.logger.debug("Successfully ran the action.")

            execution_step = ExecutedWorkflow.ExecutionSteps(
                message = step.message,
                intent = step.intent,
                action_request = step.action_request,
                action_output = action_output,
                control = step.control
            )

            reflected = self.reflector.execute(execution_step)
            execution_step.reflection = reflected

            context.add_step(execution_step)

        print(context.model_dump_json(indent=4))
        return context