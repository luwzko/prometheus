import logging
from logging.handlers import RotatingFileHandler

from pathlib import Path

def setup_logging(level: str = "DEBUG", log_dir: Path = Path("logs")):
    """ Initialize logging for Prometheus"""
    log_dir.mkdir(exist_ok = True)
    logger = logging.getLogger("prometheus")

    logger.setLevel(getattr(logging, level.upper()))
    logger.handlers.clear()

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Only file handler - logs everything to file
    file_handler = RotatingFileHandler(
        log_dir / "prometheus.log", maxBytes=10_000_000, backupCount=5, encoding="utf-8"
    )
    file_handler.setLevel(getattr(logging, level.upper()))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    logger.propagate = False