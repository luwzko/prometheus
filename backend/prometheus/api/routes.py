from fastapi import APIRouter, HTTPException
from typing import List

from prometheus.agents.base_agent import BaseAgent
from prometheus.agents.main import Prometheus
from prometheus.agents.factory import get_prometheus

from prometheus.actions.action_manager import ActionManager
from prometheus.data_models.context import PrometheusOutput

from prometheus.data_models.responses import PrometheusResponse, APIPromptResponse, ModelConfigResponse
from prometheus.data_models.action import Action
from prometheus.setup.config import ModelConfig

router = APIRouter()

@router.post("/chat", response_model = PrometheusOutput)
async def chat(message: str):
    """
    POST /api/chat

    Called by the frontend when the user sends a message.
    :param message:
    :return PrometheusOutput:
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

    If the agent_name is main return prompt of Prometheus.
    else if its any other name, it will search thru the attributes of prometheus to find a subagent with this name.

    :param agent_name:
    :return APIPromptResponse:
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

@router.get("/model_config", response_model = ModelConfigResponse)
async def get_model_config():
    """
    Returns the model_config but without api_key and base_url.
    :return ModelConfigResponse:
    """
    try:
        agent = get_prometheus()
        return agent.get_model_config()

    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/actions", response_model = List[Action])
async def get_actions():
    """
    Returns a list of actions fetched from action_registry.
    :return List[Action]:
    """
    try:
        return list(ActionManager.ACTION_REGISTRY.keys())

    except HTTPException as e:
        raise HTTPException(status_code = 500, detail = str(e))