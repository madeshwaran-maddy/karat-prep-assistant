import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"
DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def get_ai_provider() -> str:
    """Return the configured model provider, defaulting to local Ollama."""
    provider = os.getenv("AI_PROVIDER", "ollama").strip().lower()
    if provider not in {"ollama", "openrouter"}:
        raise RuntimeError(
            f"Unsupported AI_PROVIDER '{provider}'. Use 'ollama' or 'openrouter'."
        )
    return provider


def get_openrouter_model() -> str:
    return os.getenv("OPENROUTER_MODEL", DEFAULT_OPENROUTER_MODEL)


def get_openrouter_headers() -> dict[str, str]:
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter."
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    referer = os.getenv("OPENROUTER_HTTP_REFERER", "").strip()
    title = os.getenv("OPENROUTER_APP_TITLE", "Karat Prep Assistant").strip()
    if referer:
        headers["HTTP-Referer"] = referer
    if title:
        headers["X-Title"] = title
    return headers


def get_openrouter_url() -> str:
    return os.getenv("OPENROUTER_URL", DEFAULT_OPENROUTER_URL).rstrip("/")


def extract_openrouter_text(body: dict) -> str:
    choices = body.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter returned no choices.")

    message = choices[0].get("message") or {}
    content = message.get("content", "")
    if not isinstance(content, str):
        raise RuntimeError("OpenRouter returned a non-text response.")
    return content.strip()
