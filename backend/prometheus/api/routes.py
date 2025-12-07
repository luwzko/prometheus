from fastapi import APIRouter, HTTPException
from typing import List

from prometheus.agents.base_agent import BaseAgent
from prometheus.agents.main import Prometheus
from prometheus.agents.factory import get_prometheus

from prometheus.actions.action_manager import ActionManager
from prometheus.data_models.context import PrometheusOutput

from prometheus.data_models.responses import PrometheusResponse, APIPromptResponse
from prometheus.data_models.action import Action

router = APIRouter()

@router.post("/chat", response_model = PrometheusOutput)
async def chat(message: str):
    """
    POST /api/chat

    Called by the frontend when the user sends a message.
    :param message:
    :return:
    """
    try:
        agent = get_prometheus()
        output = agent.execute(message)

        return output
    except HTTPException as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.get("/prompts/{agent_name}", response_model = APIPromptResponse)
async def get_prompts(agent_name: str):
    """
    GET /api/prompts/{agent_name}
    Called by the frontend when fetching agent prompts and output structure to display.
    :param agent_name:
    :return:
    """
    try:
        agent: Prometheus = get_prometheus()

        if agent_name == "main":
            return agent.prompt.api_prompt_response

        try:
            prometheus_attr = agent.__dict__

            sub_agent: BaseAgent = prometheus_attr[agent_name]
            sub_prompt: APIPromptResponse = sub_agent.prompt.api_prompt_response

            return sub_prompt

        except KeyError as e:
            raise HTTPException(status_code = 500, detail=f"Invalid agent prompt {agent_name}")

    except HTTPException as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.get("/actions", response_model = List[Action])
async def get_actions():
    try:
        return list(ActionManager.ACTION_REGISTRY.keys())

    except HTTPException as e:
        raise HTTPException(status_code = 500, detail = str(e))