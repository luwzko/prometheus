# Prometheus Agent

A custom AI agent orchestration system with a modern web interface. Prometheus intelligently routes user requests through a multi-agent architecture to handle conversations, execute actions, and plan complex tasks.

## ?? Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended), or
- **Python 3.11+** and **Node.js 18+** for local development
- An OpenAI-compatible API key (tested with OpenRouter using Gemini Flash 2.0)

### Setup with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prometheus-agent
   ```

2. **Create environment file**
   
   Create a `.env` file in the project root:
   ```env
   API_KEY=your_api_key_here
   VITE_API_URL=http://localhost:8000/api
   ```
   
   > **Note**: If accessing from a remote machine or VM, replace `localhost` with your machine's IP address (e.g., `http://192.168.0.168:8000/api`)

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Local Development Setup

#### Backend

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment and install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Create `.env` file** (in project root or backend directory)
   ```env
   API_KEY=your_api_key_here
   ```

4. **Run the backend**
   ```bash
   # API mode (recommended)
   python main.py
   
   # CLI mode
   python main.py --cli
   ```
   
   The API will be available at `http://localhost:8000`

#### Frontend

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`


## ?? Features

- **Multi-Agent Architecture**: Prometheus orchestrates specialized agents (Planner, Executor, Think, Code)
- **Intelligent Routing**: Automatically selects between Respond, Act, or Plan modes
- **Modern Web Interface**: Clean chat-based UI with real-time responses
- **Extensible Actions**: Easy-to-add action registry system
- **Docker Support**: Containerized deployment for easy setup

## ?? Documentation

- [Backend Documentation](backend/README.md) - Detailed backend architecture and API
- [Frontend Documentation](frontend/README.md) - Frontend features and development guide

## ?? Configuration

Edit `backend/config.json` to customize agent prompts, output structures, and model settings.

## ??? Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- Pydantic

**Frontend:**
- React 19
- Vite
- Tailwind CSS

## ?? License

[Add your license here]

