import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

from ai_provider import (
    extract_openrouter_text,
    get_ai_provider,
    get_openrouter_headers,
    get_openrouter_model,
    get_openrouter_url,
)

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
PROMPT_FILE = BASE_DIR / "prompts" / "java" / "evaluate_prompt.txt"

PROVIDER = get_ai_provider()
OLLAMA_URL = f'{os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")}/api/generate'
OPENROUTER_URL = get_openrouter_url()
MODEL_NAME = (
    get_openrouter_model()
    if PROVIDER == "openrouter"
    else os.getenv("OLLAMA_MODEL", "llama3.2:3b")
)


def _parse_json(response_text: str):
    text = response_text.strip()

    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return json.loads(text.strip())


def load_evaluation_prompt():
    with open(PROMPT_FILE, "r", encoding="utf-8") as file:
        return file.read()


def build_evaluation_submission(
    assessment_id: str,
    candidate_id: str,
    question_id: str,
    user_code: str,
    user_analysis: str = "",
):
    return {
        "assessment_id": assessment_id,
        "candidate_id": candidate_id,
        "question_id": question_id,
        "user_code": user_code or "",
        "user_analysis": user_analysis or "",
        "score": None,
        "correct": None,
        "explanation": "",
        "suggestions": "",
        "corrected_code": "",
    }


async def evaluate_code(
    topic: str,
    difficulty: str,
    bug_types: list[str],
    rules: list[str],
    original_code: str,
    user_code: str,
):
    prompt = load_evaluation_prompt().format(
        topic=topic,
        difficulty=difficulty,
        bug_types=", ".join(bug_types),
        rules="\n".join(f"- {rule}" for rule in rules),
        original_code=original_code,
        user_code=user_code,
    )

    if PROVIDER == "openrouter":
        url = OPENROUTER_URL
        payload = {
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
        }
        headers = get_openrouter_headers()
    else:
        url = OLLAMA_URL
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
        }
        headers = None

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()

    response_text = (
        extract_openrouter_text(result)
        if PROVIDER == "openrouter"
        else result.get("response", "")
    )
    return _parse_json(response_text)
