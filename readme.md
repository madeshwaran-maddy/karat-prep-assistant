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

## Setup From Scratch (Windows)

### Prerequisites

Install the following before continuing:

- Windows 10 or later
- Git
- Node.js 20 or later and npm
- Python 3.11 or later
- PostgreSQL 14 or later, with `psql` available or access to pgAdmin
- Ollama, only if you will use a local AI model

### 1. Get the source code

```powershell
git clone <repository-url>
Set-Location karat-prep-assistant
```

If the repository is already open in VS Code, use its root directory for the remaining commands.

### 2. Create the PostgreSQL database

Start the PostgreSQL Windows service. Then create a database and user using `psql` or pgAdmin:

```sql
CREATE USER karat_user WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE karat_prep_assistant OWNER karat_user;
```

Using the default `postgres` user is also supported:

```sql
CREATE DATABASE karat_prep_assistant;
```

The backend creates and updates the application tables automatically when it starts.

Refer database-schema.md for tables used in this application.

### 3. Configure the backend

Copy the example environment file and edit it with values for your machine. Do not commit `backend/.env` or real credentials.

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
```

At minimum, set `DATABASE_URL`. For a local Ollama setup, use:

```env
DATABASE_URL=postgresql://karat_user:choose-a-local-password@localhost:5432/karat_prep_assistant
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:3b
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Install dependencies

```powershell
Set-Location backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Set-Location ..\frontend
npm install
Set-Location ..
```

If PowerShell blocks virtual-environment activation, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then activate the environment again.

### 5. Install an AI model

For Ollama, download the configured model, then open a separate terminal and start the Ollama server:

```powershell
ollama pull qwen2.5-coder:3b
```

In the separate Ollama terminal:

```powershell
ollama serve
```

OpenRouter users can skip Ollama installation and model download; they need an OpenRouter API key instead. See [Changing AI providers and models](#changing-ai-providers-and-models).

### 6. Start PostgreSQL

PostgreSQL normally runs as a Windows service. Start it using either option:

- Open **Services** from the Windows Start menu, find the service named `postgresql-x64-*`, and select **Start**.
- In an Administrator PowerShell terminal, find and start the installed PostgreSQL service:

```powershell
Get-Service -Name "postgresql*"
Start-Service -Name "postgresql-x64-16"
```

Replace `postgresql-x64-16` with the service name returned by the first command. Confirm that the database from `DATABASE_URL` is running before starting the backend.

### 7. Start the application

Use separate terminals. Keep PostgreSQL and Ollama running as applicable.

Terminal 1, backend:

```powershell
Set-Location backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2, frontend:

```powershell
Set-Location frontend
npm run dev
```

The frontend is available at `http://localhost:3000`, the API at `http://localhost:8000`, and the API docs at `http://localhost:8000/docs`.

## Changing AI Providers and Models

AI configuration is read from `backend/.env`. Stop and restart the backend after every change.

### Use a different Ollama model

1. Download the model and confirm its exact Ollama name:

```powershell
ollama pull <ollama-model-name>
ollama list
```

2. Update `backend/.env`:

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=<ollama-model-name>
```

3. Keep `ollama serve` running and restart Uvicorn.

`OLLAMA_TIMEOUT_SECONDS` and `OLLAMA_NUM_PREDICT` can also be adjusted in `.env` when a model needs more time or a different response length.

### Switch to OpenRouter

1. Create an API key at [OpenRouter](https://openrouter.ai/) and do not commit it.
2. Set these values in `backend/.env`:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=qwen/qwen-2.5-coder-32b-instruct:free
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
```

3. Replace `OPENROUTER_MODEL` with the model ID shown in the [OpenRouter models catalog](https://openrouter.ai/models), then restart the backend.

When `AI_PROVIDER=openrouter`, Ollama is not required. `OPENROUTER_HTTP_REFERER`, `OPENROUTER_APP_TITLE`, and `OPENROUTER_MAX_TOKENS` are optional settings documented in `backend/.env.example`.

### Switch back to Ollama

Set `AI_PROVIDER=ollama`, set `OLLAMA_MODEL` to a model downloaded with `ollama pull`, and restart the backend. OpenRouter settings are ignored while Ollama is selected.

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

## Verify the setup

Check the backend and database health endpoints while the backend is running:

```powershell
Invoke-WebRequest http://localhost:8000/ping
Invoke-WebRequest http://localhost:8000/api/health/db
```

Check the frontend production build and linting:

```powershell
Set-Location frontend
npm run lint
npm run build
```

## Troubleshooting

- If the backend exits during startup, verify `backend/.env`, the PostgreSQL credentials, and that the database exists.
- If AI requests fail, verify `AI_PROVIDER`, the selected model name, and either the running Ollama service or the OpenRouter API key.
- If the browser reports CORS errors, set `ALLOWED_ORIGINS=http://localhost:3000` in `backend/.env` and restart the backend.
- If PowerShell cannot activate the virtual environment, use Command Prompt with `venv\Scripts\activate.bat` instead.