import argparse

def parse_arguments():
    parser = argparse.ArgumentParser(
        prog = "prometheus",
        description = "Prometheus AI Framework"
    )

    parser.add_argument(
        "-c", "--config",
        type = str,
        nargs = '?',
        default = "config.json",
        help = "Path to config file, default is config.json"
    )

    parser.add_argument(
        "--api",
        action = "store_true",
        help = "Enable to run the agent in API mode instead of CLI."
    )

    return parser.parse_args()