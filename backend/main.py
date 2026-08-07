from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from debugging_drill.api.routes import router as debugging_router
from debugging_drill.services.ollama_service import OllamaService


# ---------------------------------------------------------
# Startup / Shutdown
# ---------------------------------------------------------

ollama_service = OllamaService()


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("=" * 60)
    print("Starting Debugging Drill API...")
    print("=" * 60)

    if ollama_service.health():

        print("✓ Ollama server is reachable")

        models = ollama_service.available_models()

        if models:

            print(f"✓ Available models: {', '.join(models)}")

        else:

            print("⚠ No models installed.")

    else:

        print("⚠ Ollama server is NOT running.")

    yield

    print("=" * 60)
    print("Debugging Drill API stopped.")
    print("=" * 60)


# ---------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------

app = FastAPI(

    title="Karat Prep Assistant API",

    version="1.0.0",

    description="Backend for Debugging Drill",

    lifespan=lifespan,

)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/")
def root():

    return {

        "application": "Karat Prep Assistant",

        "module": "Debugging Drill",

        "status": "running",

    }


@app.get("/ping")
def ping():

    return {

        "message": "pong"

    }


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(
    debugging_router
)