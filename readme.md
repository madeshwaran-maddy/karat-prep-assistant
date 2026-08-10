# Karat Prep Assistant

## Library needed

- Python dependencies (backend):
  - pip install -r backend/requirements.txt
  - Includes FastAPI, Uvicorn, SQLAlchemy, Pydantic, Passlib, and other backend libraries.
- Node.js dependencies (frontend):
  - cd frontend
  - npm install
  - This installs the frontend stack used by the app, including Next.js, React, Tailwind CSS, Monaco Editor, React Syntax Highlighter, Lucide icons, and TypeScript.
- Ollama installed locally and the required model pulled:
  - ollama pull qwen2.5-coder:3b

## Steps

1. Go to the frontend folder and start the app:
   - cd frontend
   - npm run dev

2. Start Ollama:
   - ollama serve
   - If you get an error, make sure Ollama is installed correctly and running on your machine.

3. Activate the Python virtual environment:
   - venv\Scripts\activate.bat

4. Go to the backend folder and install Python dependencies:
   - cd backend
   - pip install -r requirements.txt

5. Start the backend server:
   - uvicorn main:app --reload --host 127.0.0.1 --port 8000

## Notes

- The frontend runs on the Next.js development server.
- The backend runs on FastAPI with Uvicorn.
- Make sure the Ollama service is running before using the debugging drill features.
