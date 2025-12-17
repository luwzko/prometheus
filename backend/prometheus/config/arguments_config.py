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
        "--cli",
        action = "store_true",
        help = "Enable to run the agent in CLI mode instead of API."
    )

    return parser.parse_args()