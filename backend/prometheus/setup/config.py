from pydantic import BaseModel, Field
from typing import TypeAlias
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
    AgentConfig is a class which contains all needed information for the model, also contains model_config
    prompt -> the agents prompt
    output_structure -> the schema how the model should respond in JSON
    """
    prompt: str
    model_config_: ModelConfig = None

class ActionManagerConfig(BaseModel):
    think_agent: AgentConfig
    code_agent: AgentConfig

    def set_model_config(self, model_config: ModelConfig):
        self.think_agent.model_config_ = model_config
        self.code_agent.model_config_ = model_config

class PrometheusConfig(BaseModel):
    """
    Config for Prometheus (main agent)
    """
    main_agent: AgentConfig

    workflow: AgentConfig
    reflector: AgentConfig

    action_manager: ActionManagerConfig

    def set_model_config(self, model_config: ModelConfig):
        """
        Loops over the dictionary describing all attrs of the class.
        Sets each attr model_config to the model config passed to the method
        :param model_config:
        :return:
        """
        for var, val in self.__dict__.items():
            if type(val) == AgentConfig:
                val.model_config_ = model_config

            else: val.set_model_config(model_config)

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

        self.model_config = ModelConfig(api_key = self._API_KEY, **self._config["model"])
        self.prometheus_config = PrometheusConfig(**self._config["prometheus"])

        self.prometheus_config.set_model_config(self.model_config)
        logger.debug("Successfully initialized main config.")