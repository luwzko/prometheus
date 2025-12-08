# Prometheus Agent - Frontend

A React + Vite frontend interface for interacting with the Prometheus AI agent system.

## Overview

This is a chat-based web interface that allows you to communicate with Prometheus, an AI agent that can think, plan, and execute tasks. The interface provides a clean, modern UI with glassmorphism design elements.

## Features

### Chat Interface
- **Main Chat**: Send messages to the Prometheus agent and receive responses
- **Message History**: View your conversation history in a scrollable chat area
- **Real-time Responses**: See agent responses as they're generated

### Agent Management
- **Main Agent**: Prometheus - the primary orchestrator agent
- **Sub-Agents**: 
  - **Planner**: Creates execution plans and breaks down tasks
  - **Executor**: Executes planned actions and operations
  - **Reflector**: Reviews and improves execution results

### Side Panels
- **Left Panel**: 
  - **Config**: Model and agent configuration settings
  - **Actions**: Available actions the agent can perform
  - **History**: Conversation and execution history
- **Right Panel**: Browse and inspect agent prompts and configurations

### Tab System
- VS Code-style tab interface for viewing multiple agent configurations
- Click on any agent in the right sidebar to open its configuration in a new tab
- View system prompts and output structures for each agent

## Pages

- **Landing Page** (`/`): Marketing page with feature overview
- **Dashboard** (`/dashboard`): Main application interface

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Getting Started

See the [Environment Setup](#environment-setup) section below for configuration instructions.

## Environment Setup

### For Docker (Recommended)

Add `VITE_API_URL` to the root `.env` file (same directory as `docker-compose.yml`):

```env
API_KEY=your_api_key_here
VITE_API_URL=http://192.168.0.168:8000/api
```

Then restart your containers:
```bash
docker-compose down
docker-compose up -d
```

### For Local Development

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Then:
```bash
npm install
npm run dev
```

## Configuration

The frontend connects to the backend API. Set `VITE_API_URL` to point to your backend:

- **Local**: `http://localhost:8000/api`
- **VM/Remote**: `http://YOUR_VM_IP:8000/api`
- **Production**: `/api` (relative) or `https://api.yourdomain.com/api`

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The frontend will be available at `http://localhost:3000`.
