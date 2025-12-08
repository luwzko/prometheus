# Prometheus Agent - Frontend

React + Vite frontend for the Prometheus Agent application.

## Environment Setup

This project requires environment variables to be configured. You need to set up **two** `.env` files:

### 1. Root `.env` (for backend)

Located in the project root directory (`../.env`), this file contains the API key for the LLM provider:

```env
API_KEY=your_api_key_here
```

### 2. Frontend `.env` (for frontend)

Located in the `frontend/` directory, this file configures the backend API URL:

```env
VITE_API_URL=http://localhost:8000/api
```

**Important:** The variable name must start with `VITE_` for Vite to expose it to the client code.

#### Configuration Options

**Development:**
- **Local development** (backend on same machine):
  ```env
  VITE_API_URL=http://localhost:8000/api
  ```
- **Remote backend** (e.g., on VM):
  ```env
  VITE_API_URL=http://192.168.0.168:8000/api
  ```
  Replace `192.168.0.168` with your VM's IP address.

**Production:**
- **Same domain** (recommended):
  ```env
  VITE_API_URL=/api
  ```
  Uses a relative URL - the frontend and backend are served from the same domain.
  
- **Different subdomain**:
  ```env
  VITE_API_URL=https://api.yourdomain.com/api
  ```
  
- **Different domain**:
  ```env
  VITE_API_URL=https://api.yourdomain.com/api
  ```

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your backend API URL:**
   ```bash
   # For local development
   VITE_API_URL=http://localhost:8000/api
   
   # OR for remote backend (VM)
   VITE_API_URL=http://192.168.0.168:8000/api
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

## Docker Setup

When using Docker Compose, the frontend will automatically read the `VITE_API_URL` from the root `.env` file. Make sure both environment variables are set in the root `.env`:

```env
# Backend API key
API_KEY=your_api_key_here

# Frontend API URL (where the browser will connect to)
VITE_API_URL=http://localhost:8000/api
```

**Note:** For Docker, use the URL that your **browser** will use to access the backend, not the internal Docker service name. The browser runs on your host machine, not inside the Docker container.

## Building for Production

For production builds, the `VITE_API_URL` is embedded at build time. Make sure to set it correctly before building:

```bash
# Set production API URL
export VITE_API_URL=https://api.yourdomain.com/api

# Build
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### "Could not connect to backend" error
1. **Check the API URL:** Verify `VITE_API_URL` in your `.env` file matches where your backend is actually running.
2. **Check CORS:** Ensure your backend has CORS enabled and allows requests from your frontend origin.
3. **Check backend is running:** Make sure the backend server is running and accessible.
4. **Check browser console:** Open DevTools (F12) and check the Network tab for detailed error messages.

### Environment variable not working
- Make sure the variable name starts with `VITE_`
- Restart the dev server after changing `.env` files
- For production builds, set the variable before running `npm run build`
