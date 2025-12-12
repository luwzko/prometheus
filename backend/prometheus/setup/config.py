from pydantic import BaseModel, Field
from typing import TypeAlias, Union, Literal
import json

from dotenv import load_dotenv
import os

import logging

logger = logging.getLogger("prometheus.config")

Config: TypeAlias = dict[str, str]

class ModelConfig(BaseModel):
    """
    ModelConfig is a class which contains all needed fields for the model to work.
    name -> which llm to use
    base_url -> base url of the API to use
    max_tokens -> maximum number of tokens the model can generate
    temperature -> "creativity" of the model
    """
    name: str
    base_url: str
    api_key: str
    max_tokens: int = Field(default = 4096, le = 8192, description = "max_tokens max value is 8192.")
    temperature: float = Field(default = 0.2, ge = 0.0, le = 1.0, description = "temperature value should be between 0 - 1.")

class AgentConfig(BaseModel):
    """
    AgentConfig is a class which contains all needed information for the model.
    prompt -> the agents prompt
    model_config_ can be "inherit", new model_config object or a dict with overwritten settings.
    """
    prompt: str
    model_config_: Union[Literal["inherit"], ModelConfig, dict] = "inherit"

class ActionManagerConfig(BaseModel):
    think_agent: AgentConfig
    code_agent: AgentConfig

class PrometheusConfig(BaseModel):
    """
    Config for Prometheus (main agent)
    """
    main_agent: AgentConfig

    workflow: AgentConfig
    reflector: AgentConfig

    action_manager: ActionManagerConfig

    def _resolve_model_config(self, agent_config: AgentConfig, global_model_config: ModelConfig):
        """
        Determines the value of model config based on what is supplied in the config file.
        :param agent_config:
        :param global_model_config:
        :return:
        """
        # inherit config
        if agent_config.model_config_ == "inherit":
            return global_model_config.model_copy()

        # new separate config
        elif isinstance(agent_config.model_config_, ModelConfig):
            return agent_config.model_config_

        # merge configs
        elif isinstance(agent_config.model_config_, dict):
            merged = global_model_config.model_dump()
            merged.update(agent_config.model_config_)

            return ModelConfig(**merged)

    def init_model_cfg(self, global_model_config: ModelConfig):
        self.main_agent.model_config_ = self._resolve_model_config(self.main_agent, global_model_config)
        self.workflow.model_config_ = self._resolve_model_config(self.workflow, global_model_config)
        self.reflector.model_config_ = self._resolve_model_config(self.reflector, global_model_config)


        self.action_manager.code_agent.model_config_ = self._resolve_model_config(self.action_manager.code_agent, global_model_config)
        self.action_manager.think_agent.model_config_ = self._resolve_model_config(self.action_manager.think_agent, global_model_config)

class MainConfig:
    """
    MainConfig is a class which is used to handle the config file.
    Contains all other configs.
    """
    def __init__(self, config_file: str):
        load_dotenv()

        self._config_file: str = config_file

        self._config: Config
        self._config_text: str

        self._API_KEY = os.getenv("API_KEY")

        try:
            with open(self._config_file, "r") as f:
                self._config_text = "".join(f.readlines())

        except FileNotFoundError as e:
            logger.error(f"FileNotFound for {self._config_file}")
            exit(1)

        self._config = json.loads(self._config_text)

        self.global_model_config = ModelConfig(api_key = self._API_KEY, **self._config["model"])
        self.prometheus_config = PrometheusConfig(**self._config["prometheus"])

        self.prometheus_config.init_model_cfg(self.global_model_config)

        logger.debug("Successfully initialized main config.")


