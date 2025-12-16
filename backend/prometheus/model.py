from prometheus.config.config import ModelConfig
from prometheus.data_models.api import ModelResponse

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

    def _interact(self, data: str) -> requests.Response | None:
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

    def chat(self, data: str) -> ModelResponse:
        """
        Interact with the API and return validated ModelResponse.

        :param data: JSON string containing the request
        :return: ModelResponse object
        """
        # Make API call
        response = self._interact(data)
        response_json = json.loads(response.text)

        # Validate response structure
        api_response = ModelResponse.model_validate(response_json)

        # Check for errors
        if not api_response.is_success():
            error = api_response.get_error()
            if error:
                logger.error(f"API returned: {error[0]} with error code: {error[1]}")

            else:
                logger.error("API call failed with no error details")
            raise Exception("API call failed")

        return api_response
