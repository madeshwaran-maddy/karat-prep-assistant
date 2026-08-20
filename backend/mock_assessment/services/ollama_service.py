import json
import os
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

PROVIDER = get_ai_provider()
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
OPENROUTER_URL = get_openrouter_url()
MODEL_NAME = (
    get_openrouter_model()
    if PROVIDER == "openrouter"
    else os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b")
)


def _sanitize_json_text(text: str) -> str:
    """Escape raw newline characters that Ollama inserts inside JSON string values."""
    result = []
    in_string = False
    escaped = False

    for char in text:
        if in_string:
            if escaped:
                result.append(char)
                escaped = False
                continue

            if char == "\\":
                result.append(char)
                escaped = True
                continue

            if char == '"':
                in_string = False
                result.append(char)
                continue

            if char in ("\n", "\r"):
                result.append("\\n")
                continue

            if char == "\t":
                result.append("\\t")
                continue

            result.append(char)
            continue

        if char == '"':
            in_string = True

        result.append(char)

    return "".join(result)


def _normalize_backtick_code_value(text: str) -> str:
    """Convert a JavaScript-style backtick code value into a JSON string."""
    marker = '"code"'
    marker_index = text.find(marker)
    if marker_index == -1:
        return text

    value_start = text.find(":", marker_index + len(marker)) + 1
    while value_start < len(text) and text[value_start].isspace():
        value_start += 1

    if value_start >= len(text) or text[value_start] != "`":
        return text

    content_start = value_start + 1
    closing_index = content_start
    while closing_index < len(text):
        if text[closing_index] == "`" and text[closing_index - 1] != "\\":
            remainder = text[closing_index + 1:].lstrip()
            if remainder.startswith("}") or remainder.startswith(","):
                break
        closing_index += 1

    if closing_index >= len(text):
        return text

    code = text[content_start:closing_index]
    return (
        text[:value_start]
        + json.dumps(code)
        + text[closing_index + 1:]
    )


def _parse_json(response_text: str):
    """Parse Ollama JSON even when the model adds extra prose or raw newlines in strings."""
    text = response_text.strip()

    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    text = _normalize_backtick_code_value(text).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start_idx = text.find('{')
    if start_idx == -1:
        raise ValueError(f"Ollama returned invalid JSON: {text}")

    end_idx = text.rfind('}')
    if end_idx == -1:
        raise ValueError(f"Ollama returned invalid JSON: {text}")

    json_str = text[start_idx:end_idx + 1]

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        sanitized = _sanitize_json_text(json_str)
        try:
            return json.loads(sanitized)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Ollama returned invalid JSON: {sanitized}") from exc


async def _verify_model_exists():
    """Check if the required model is available in Ollama."""
    if PROVIDER == "openrouter":
        if not os.getenv("OPENROUTER_API_KEY", "").strip():
            raise RuntimeError("OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter")
        return MODEL_NAME

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OLLAMA_TAGS_URL)
            response.raise_for_status()
            tags = response.json()
            models = [model['name'] for model in tags.get('models', [])]
            
            if not models:
                raise RuntimeError("No models installed in Ollama")
            
            # Check for exact model name or partial match
            if MODEL_NAME not in models:
                print(f"⚠ Model '{MODEL_NAME}' not found. Available models: {models}")
                # Try to use the first available model as fallback
                available_model = models[0]
                print(f"→ Using '{available_model}' instead")
                return available_model
            
            return MODEL_NAME
    except Exception as e:
        raise RuntimeError(f"Failed to verify Ollama models: {e}") from e


async def generate_question(
    topic: str,
    difficulty: str,
    bug_types: list[str],
    rules: list[str],
    prompt_template: str,
):
    # Verify model is available
    model = await _verify_model_exists()
    
    prompt = prompt_template.format(
        topic=topic,
        difficulty=difficulty,
        bug_types=", ".join(bug_types),
        rules="\n".join(f"- {rule}" for rule in rules),
    )

    if PROVIDER == "openrouter":
        url = OPENROUTER_URL
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Return only the requested JSON. Do not expose analysis, "
                        "reasoning, planning, or meta-commentary."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": int(os.getenv("OPENROUTER_MAX_TOKENS", "4096")),
            "reasoning": {"exclude": True, "max_tokens": 0},
            "response_format": {"type": "json_object"},
        }
        headers = get_openrouter_headers()
    else:
        url = OLLAMA_URL
        payload = {
            "model": model,
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
    generated = _parse_json(response_text)
    
    # Validate required fields
    required_fields = ["topic", "description", "code"]
    missing_fields = [field for field in required_fields if field not in generated]
    
    if missing_fields:
        raise ValueError(
            f"{PROVIDER} response missing required fields: {missing_fields}. "
            f"Response: {generated}"
        )
    
    return generated
