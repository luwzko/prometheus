from functools import lru_cache

from prometheus.agents.main import Prometheus
from prometheus.setup.config import MainConfig

@lru_cache(maxsize = 1)
def get_prometheus(config_file: str | None = None):
    """
    Builds a singleton Prometheus instance per process using the given config.

    First call: reads config file and constructs the prometheus instance
    Later calls: return the same instance

    :param config_file:
    :return prometheus_instance:
    """
    if config_file is None:
        config_file = "config.json"

    config = MainConfig(config_file)
    return Prometheus(config.prometheus_config)