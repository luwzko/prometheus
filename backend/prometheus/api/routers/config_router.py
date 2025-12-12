from fastapi import APIRouter
from fastapi.params import Depends

from prometheus.factory import get_main_config
from prometheus.setup.config import MainConfig

config_router = APIRouter(prefix = "/config", tags = ["Configuration"])

@config_router.get("/")
async def get_config(config: MainConfig = Depends(get_main_config)):
    """ Returns api safe version of config. """
    return config.get_api_response()

@config_router.get("/{agent_name}")
async def get_agent(agent_name: str, config: MainConfig = Depends(get_main_config)):
    """ Returns AgentConfig public version """
    return config.get_agent_by_name(agent_name).get_full_public()