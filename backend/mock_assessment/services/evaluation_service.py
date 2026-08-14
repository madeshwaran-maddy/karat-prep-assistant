import json
from pathlib import Path

import httpx


BASE_DIR = Path(__file__).resolve().parent.parent
PROMPT_FILE = BASE_DIR / "prompts" / "evaluate_prompt.txt"

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


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

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()

    return _parse_json(result.get("response", ""))
