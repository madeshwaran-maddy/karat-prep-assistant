# Karat Prep Assistant

Karat Prep Assistant is a full-stack preparation platform for candidates and reviewers. It includes candidate learning paths, debugging drills, mock assessments, and reviewer dashboards for monitoring candidate performance.

## Current stack

### Frontend
- Next.js 16.3.0
- React 19.2.8
- TypeScript 5
- Tailwind CSS 4
- Monaco Editor via @monaco-editor/react
- Lucide React icons
- React Syntax Highlighter
- xlsx for spreadsheet support

### Backend
- FastAPI 0.141.1
- Uvicorn 0.52.1
- SQLAlchemy 2.0.51
- Pydantic 2.13.4
- PostgreSQL driver: psycopg2-binary
- Passlib, python-jose, bcrypt, httpx
- OpenPyXL and pandas for data processing

### AI / evaluation layer
- Ollama local LLM runtime
- Model used: qwen2.5-coder:3b

## Project structure

- frontend/ - Next.js app for candidate and reviewer dashboards
- backend/ - FastAPI app and request models/services
- public/ - static frontend assets

## Prerequisites

- Node.js 20+
- Python 3.11+
- Ollama installed locally

## Install dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
venv\Scripts\activate.bat - Go into virtual Environment
pip install -r requirements.txt
```

### Ollama model
```bash
ollama pull qwen2.5-coder:3b
```

## Run the app

### 1. Start Ollama
```bash
ollama serve
```

Then confirm the service is running at:
- http://localhost:11434/

### 2. Start the backend
```bash
cd backend

uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Start the frontend
```bash
cd frontend
npm run dev
```

The frontend should run on:
- http://localhost:3000

## Notes

- The frontend uses the app router and includes candidate dashboard flows, round-based learning, debugging drills, and mock assessments.
- The backend exposes FastAPI endpoints for assessment and drill-related functionality.
- Reviewer features rely on mock candidate data and data helpers while the backend and AI evaluation services are being integrated.
- If the debugging drill or assessment features are not responding, verify that Ollama is running and the required model has been pulled.

## Common commands

```bash
cd frontend
npm run build
npm run dev
```

```bash
cd backend
venv\Scripts\activate.bat - Go into virtual Environment
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
