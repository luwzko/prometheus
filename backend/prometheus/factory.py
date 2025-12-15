from functools import lru_cache

from prometheus.agents.main import Prometheus
from prometheus.config.config import MainConfig

@lru_cache(maxsize = 1)
def get_prometheus(config_file: str | None = None):
    """Singleton Prometheus instance."""
    if config_file is None:
        config_file = "config.json"

    config = MainConfig(config_file)
    prometheus = Prometheus(config.prometheus_config)
    prometheus._config = config

    return prometheus

@lru_cache(maxsize = 1)
def get_main_config() -> MainConfig:
    """Returns the singletons prometheus mainconfig instance we have stored"""
    prometheus = get_prometheus()
    return prometheus._config