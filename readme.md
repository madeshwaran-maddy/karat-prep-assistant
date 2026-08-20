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
- Selectable Ollama local runtime or OpenRouter API
- Default model: qwen2.5-coder:3b
- Optional OpenRouter model: nvidia/nemotron-3-super-120b-a12b:free

## Project structure

- frontend/ - Next.js app for candidate and reviewer dashboards
- backend/ - FastAPI app and request models/services
- public/ - static frontend assets

## Prerequisites

- Windows 10 or later
- Node.js 20 or later and npm
- Python 3.11 or later
- PostgreSQL 14 or later, with `psql` available or access to pgAdmin
- Ollama installed locally

## Database setup

Create a PostgreSQL database before starting the backend. The backend creates and updates the application tables automatically during startup.

Using `psql`:

```sql
CREATE USER karat_user WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE karat_prep_assistant OWNER karat_user;
```

Using the default PostgreSQL `postgres` user is also supported. In that case, create only the database:

```sql
CREATE DATABASE karat_prep_assistant;
```

Do not commit real database credentials. Store the connection string in `backend/.env`:

```env
DATABASE_URL=postgresql://karat_user:choose-a-local-password@localhost:5432/karat_prep_assistant
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:3b
ALLOWED_ORIGINS=http://localhost:3000
```

To use NVIDIA Nemotron through OpenRouter, change only the provider and add the API key:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
```

The default `AI_PROVIDER=ollama` keeps all requests on the existing Ollama flow. Do not commit `OPENROUTER_API_KEY`.

`backend/.env.example` contains the supported variable names. If `backend/.env` does not exist, copy that file and replace its placeholder values. The `DATABASE_URL` variable is required; the backend will not start without it.

## Install dependencies

Run these commands from the repository root.

### Frontend

```powershell
Set-Location frontend
npm install
```

Command Prompt:

```cmd
cd frontend
npm install
```

### Backend

```powershell
Set-Location backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Command Prompt:

```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Ollama model (only when `AI_PROVIDER=ollama`)

```powershell
ollama pull qwen2.5-coder:3b
```

Command Prompt:

```cmd
ollama pull qwen2.5-coder:3b
```

## Run the app

Use three terminals from the repository root; PostgreSQL can run as a Windows service.

### 1. Start PostgreSQL

Start the PostgreSQL Windows service, or start PostgreSQL using the installation method you selected. Confirm that the database in `DATABASE_URL` is reachable before starting the backend.

### 2. Start Ollama (only when `AI_PROVIDER=ollama`)

```powershell
ollama serve
```

Command Prompt:

```cmd
ollama serve
```

Confirm that Ollama is available at `http://localhost:11434` and that the `qwen2.5-coder:3b` model has been pulled.

### 3. Start the backend

```powershell
Set-Location backend
venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Command Prompt:

```cmd
cd backend
venv\Scripts\activate.bat
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

On startup, the backend checks the selected AI provider and creates the PostgreSQL schema if it does not already exist. The API is available at `http://localhost:8000` and its interactive docs are at `http://localhost:8000/docs`.

### 4. Start the frontend

```powershell
Set-Location frontend
npm run dev
```

Command Prompt:

```cmd
cd frontend
npm run dev
```

The frontend is available at `http://localhost:3000`.

## Verify the setup

Check the backend and database health endpoints:

```powershell
Invoke-WebRequest http://localhost:8000/ping
Invoke-WebRequest http://localhost:8000/api/health/db
```

Command Prompt:

```cmd
curl http://localhost:8000/ping
curl http://localhost:8000/api/health/db
```

Check the frontend production build and linting:

```powershell
Set-Location frontend
npm run lint
npm run build
```

Command Prompt:

```cmd
cd frontend
npm run lint
npm run build
```

## Notes

- The frontend uses the app router and includes candidate dashboard flows, round-based learning, debugging drills, and mock assessments.
- The backend exposes FastAPI endpoints for assessment and drill-related functionality.
- Reviewer features rely on mock candidate data and data helpers while the backend and AI evaluation services are being integrated.
- If the backend exits during startup, verify `backend/.env`, PostgreSQL credentials, and that the database exists.
- If debugging drills or assessments are not responding, verify the selected provider, its credentials, and its configured model.
- If the browser reports CORS errors, set `ALLOWED_ORIGINS` in `backend/.env` to the frontend URL and restart the backend.

## Common commands

```bash
cd frontend
npm run build
npm run dev
npm run lint
```

```bash
cd backend
venv\Scripts\activate.bat - Access Virtual Machine
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
API Key : OPENROUTER_API_KEY_REMOVED