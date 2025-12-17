from prometheus.data_models.shared import UserInput
from prometheus.data_models.shared.user_input import FileAttachment
from prometheus.factory import get_prometheus
from prometheus.agents.main import Prometheus
from prometheus.config import setup_logging, parse_arguments
setup_logging()

def cli(config_path: str | None):
    agent = get_prometheus(config_path)

    print("### PROMETHEUS CLI ###")

    msg: str
    while True:
        msg = input("> ")

        if msg.lower() in ["quit", "exit"]:
            break

        usr_input = UserInput(message = msg, files = [])
        result = agent.execute(usr_input)

        print(result.model_dump_json(indent=4))

def api(host: str, port: int, reload: bool, config_file: str | None):
    get_prometheus(config_file)

    import uvicorn
    uvicorn.run(
        "prometheus.api.server:app",
        host = host,
        port = port,
        reload = reload
    )

def main():
    args = parse_arguments()

    config_file: str = args.config
    use_cli: bool = args.cli

    prometheus: Prometheus = get_prometheus(config_file)

    if use_cli:
        cli(config_file)

    else: api("0.0.0.0", 8000, False, config_file)

if __name__ == "__main__":
    main()