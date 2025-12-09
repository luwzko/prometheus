from prometheus.setup.config import AgentConfig

from prometheus.data_models.api import APIPromptResponse

from typing import TypeAlias, Dict, Type
import json

import logging
logger = logging.getLogger("prometheus.prompt")

OutputStruct: TypeAlias = Dict[str, str]

class AgentPrompt:
    """
    AgentPrompt is a class which combines prompt and output structure and other agent variables.
    It reads contents of prompt file and output structure file which are contained in AgentConfig.
    """

    def __init__(self, agent_config: AgentConfig):
        self._agent_config = agent_config

        self._prompt: str
        self._output_struct: OutputStruct

        from prometheus.actions.action_manager import get_action_details
        self.variables = {
            "{action_data}": get_action_details()
        }

        try:
            if self._agent_config.prompt.endswith(".txt"):
                with open(self._agent_config.prompt, "r") as f:
                    self._prompt = "".join(f.readlines())

            # if the prompt in agent_config is not a file but rather a prompt
            else: self._prompt = self._agent_config.prompt

            if self._agent_config.output_structure.endswith(".json"):
                with open(self._agent_config.output_structure, "r") as f:
                    self._output_struct = "".join(f.readlines())

            # if the output structure in agent_config is not a file but rather a structure
            else: self._output_struct = self._agent_config.output_structure

            logger.debug("Successfully read prompt file and output structure.")

        except FileNotFoundError as e:
            logger.error("Check config, prompt file or output structure fields must be valid files.")
            exit(1)

        self._add_details()
        self._output_struct = json.loads(self._output_struct)

        self.api_prompt_response = APIPromptResponse()
        self.api_prompt_response.prompt = self._prompt
        self.api_prompt_response.output_struct = self._output_struct

        self._initialize()

    def _initialize(self) -> None:
        """
        This function initializes the prompt structure for future use.
        It sets `model`, `max_tokens` and `temperature` fields with ones in the agents model_config.
        :return None:
        """
        self._output_struct["model"] = self._agent_config.model_config_.name
        self._output_struct["max_tokens"] = self._agent_config.model_config_.max_tokens
        self._output_struct["temperature"] = self._agent_config.model_config_.temperature

    def _add_details(self):
        """
        This function replaces variables in the prompt with what we set them.
        :return:
        """
        for var, data in self.variables.items():
            self._prompt = self._prompt.replace(var, data)

    def get(self, user_message: str, rettype: Type[str | OutputStruct] = str) -> str | OutputStruct:
        """
        `get` method is the main way to use the AgentPrompt class.

        :param user_message:
        user_message is self_explanatory
        :param rettype:
        rettype defines in which type to return the finalized prompt.

        :return finalized prompt in rettype:
        """
        logger.debug(f"Fetching prompt structure:\n msg = {user_message}")

        def generate_message(role: str, content: str):
            return {"role": role, "content": content}

        messages = [
            generate_message("system", self._prompt)
        ]


        messages.append(generate_message("user", user_message))
        self._output_struct["messages"] = messages

        if rettype == str:
            return json.dumps(self._output_struct)

        return self._output_struct