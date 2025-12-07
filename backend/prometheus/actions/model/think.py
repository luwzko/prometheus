from prometheus.actions.action_manager import action, ActionManager

@action(
    "Think",
    "Uses an agent designated for thinking to reason about tasks.",
    "chain_of_thought"
)
def think(task: str):
    agent = ActionManager.THINK_AGENT
    return agent.execute(task)