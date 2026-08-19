import json
from pathlib import Path
from typing import Any


MANIFEST_FILE = Path(__file__).with_name("languages.json")


def load_languages() -> list[dict[str, Any]]:
    with MANIFEST_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)["languages"]


def get_language(language_id: str = "java") -> dict[str, Any]:
    for language in load_languages():
        if (
            language["id"].lower() == language_id.strip().lower()
            or language["name"].lower() == language_id.strip().lower()
        ) and language.get("enabled", False):
            return language
    raise ValueError(f"Unsupported language: {language_id}")
