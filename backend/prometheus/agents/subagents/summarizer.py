from prometheus.agents.base_agent import BaseAgent
from prometheus.setup.config import AgentConfig

import logging
logger = logging.getLogger("prometheus.subagents.summarizer")

class SummarizerAgent(BaseAgent):
    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config)

    def execute(self, message: str):
        pass