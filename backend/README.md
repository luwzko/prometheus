# Prometheus Agent - Backend

A custom AI agent orchestration system built from scratch in Python. Prometheus uses OpenAI-compatible APIs to intelligently route user requests through a multi-agent architecture without relying on external agent frameworks.

## Architecture

The system centers around **Prometheus**, the main orchestration agent that analyzes user input and selects one of three response modes:

- **Respond**: Handles conversational queries that don't require actions
- **Act**: Executes a single, direct action from the registered action registry
- **Plan**: Breaks down complex tasks into sequential steps for execution

When planning is required, the **Planner** agent decomposes tasks into structured steps with dependencies. The **Executor** then runs these steps sequentially, resolving references between actions as needed.

Additional agents include **Think** and **Code** agents for action-specific processing, and a **Summarizer** agent (currently not implemented) for performance reflection.

## Features

- Custom prompt-based system with structured JSON outputs
- Extensible action registry system for adding new capabilities
- FastAPI REST API and CLI interface
- Docker support for containerized deployment
- Pydantic-based data validation and type safety

## Setup

1. **API Key**: Set your OpenAI-compatible API key in a `.env` file at the project root:
   ```
   API_KEY=your_api_key_here
   ```
   Tested with OpenRouter API using Gemini Flash 2.0.

2. **Configuration**: Edit `config.json` to customize agent prompts, output structures, and model settings. All agents currently share the same model configuration.

3. **Run**:
   - **Docker**: `docker build -t prometheus . && docker run -p 8000:8000 prometheus`
   - **CLI**: `python main.py --cli`
   - **API**: `python main.py` (runs on `http://0.0.0.0:8000`)

## Tech Stack

- Python 3.11+
- FastAPI
- Pydantic
- Requests

No external agent libraries (LangChain, OpenAI SDK, etc.) — built using only `requests` for API calls and `fastapi` for the web interface.
