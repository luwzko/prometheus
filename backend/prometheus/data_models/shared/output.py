from prometheus.data_models.base import BaseContext
from prometheus.data_models.action import ActionOutput
from prometheus.data_models.agent.subagent import *

from typing import Optional

class ModelOutput(BaseContext):
    content: str | None = None

class PrometheusOutput(BaseContext):
    mode: Optional[str] = None
    text: Optional[ModelOutput] = None

    action_output: Optional[ActionOutput] = None

    task: Optional[str] = None

    executed: Optional[ExecutedWorkflow] = None
    reflection: Optional[Reflection] = None