from prometheus.setup.config import ModelConfig
from prometheus.data_models.responses import ModelResponse

import requests
import json

import logging
logger = logging.getLogger("prometheus.model")

class Model:
    """
    Model class is used for interacting with the API.
    """
    def __init__(self, model_config: ModelConfig):
        self._model_config = model_config

        self._headers = {
            "Authorization": f"Bearer {self._model_config.api_key}",
        }

    def _interact(self, data: dict) -> requests.Response | None:
        response: requests.Response
        try:
            response = requests.post(
                url = self._model_config.base_url,
                headers = self._headers,
                data = data
            )

        except requests.RequestException as e:
            logger.error(f"Error while requesting model response.")
            return None

        return response

    def chat(self, data: dict):
        response = self._interact(data)

        resp_json = json.loads(response.text)
        api_response = ModelResponse.model_validate(resp_json)

        content: str = api_response.get_content()

        if type(content) == str:
            content: dict = json.loads(content)

        elif type(content) == tuple:
            logger.error(f"API returned: {content[0]} with error code: {content[1]}.")
            return None
        else:
            logger.error("Something went wrong...")
            return None

        logger.debug("API returned non error response.")
        return content