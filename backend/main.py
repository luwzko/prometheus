from prometheus.agents.factory import get_prometheus
from prometheus.agents.main import Prometheus
from prometheus.setup import setup_logging, parse_arguments
setup_logging()

def cli(config_path: str | None):
    agent = get_prometheus(config_path)

    print("### PROMETHEUS CLI ###")

    msg: str
    while True:
        msg = input("> ")

        if msg.lower() in ["quit", "exit"]:
            break

        result = agent.execute(msg)
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
    use_api: bool = args.api

    prometheus: Prometheus = get_prometheus(config_file)

    if use_api:
        api("0.0.0.0", 8000, False, config_file)

    else: cli(config_file)

if __name__ == "__main__":
    main()