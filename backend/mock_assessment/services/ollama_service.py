import json
import httpx


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
MODEL_NAME = "qwen2.5-coder:3b"  # Changed from llama3.2:3b to match debugging_drill


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


def _parse_json(response_text: str):
    """Parse Ollama JSON even when the model adds extra prose or raw newlines in strings."""
    text = response_text.strip()

    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

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

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()

    generated = _parse_json(result.get("response", ""))
    
    # Validate required fields
    required_fields = ["topic", "description", "code"]
    missing_fields = [field for field in required_fields if field not in generated]
    
    if missing_fields:
        raise ValueError(
            f"Ollama response missing required fields: {missing_fields}. "
            f"Response: {generated}"
        )
    
    return generated
