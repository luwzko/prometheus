from prometheus.actions.action_manager import action
import math

@action(
    "Calculator",
    "Evaluates mathematical expressions, `math` library is already imported and ready to use.",
    "calculated"
)
def calculator(expression: str):
    out = eval(expression)
    return out