from fastapi import APIRouter, HTTPException
from typing import List

from prometheus.factory import get_prometheus
from prometheus.actions.action_manager import ActionManager
from prometheus.data_models.shared import PrometheusOutput
from prometheus.data_models.action import Action

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