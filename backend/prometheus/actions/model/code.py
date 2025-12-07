from prometheus.actions.action_manager import action, ActionManager

@action(
    "Code",
    "Uses an agent designated for coding out specific programs",
    "code_output"
)
def code(task: str):
    agent = ActionManager.CODE_AGENT
    return agent.execute(task)