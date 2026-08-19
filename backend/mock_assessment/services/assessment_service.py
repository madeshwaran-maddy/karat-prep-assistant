import json
import uuid
from pathlib import Path

from .ollama_service import generate_question
try:
    from config.languages import get_language
except ModuleNotFoundError:
    from backend.config.languages import get_language


BASE_DIR = Path(__file__).resolve().parent.parent
DRILLS_FILE = BASE_DIR.parent / "debugging_drill" / "data" / "java" / "drills.json"
PROMPT_FILE = BASE_DIR / "prompts" / "java" / "generate_question_prompt.txt"


def load_drills():
    if not DRILLS_FILE.exists():
        raise FileNotFoundError(f"drills.json not found: {DRILLS_FILE}")

    with open(DRILLS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    drills = []

    for collection_items in data.values():
        if not isinstance(collection_items, list):
            continue

        for item in collection_items:
            prompt = item["prompt"]

            drills.append({
                "id": item["id"],
                "title": item["title"],
                "difficulty": item["difficulty"],
                "topic": prompt["topic"],
                "bugTypes": prompt["bugTypes"],
                "rules": prompt["rules"],
            })

    return drills


def load_prompt():
    with open(PROMPT_FILE, "r", encoding="utf-8") as file:
        return file.read()


async def generate_round1_questions(count: int = 4, language_id: str = "java"):
    import random

    language = get_language(language_id)
    drills_file = BASE_DIR.parent / "debugging_drill" / "data" / language["id"] / "drills.json"
    with open(drills_file, "r", encoding="utf-8") as file:
        source_data = json.load(file)

    drills = []
    for collection_items in source_data.values():
        if isinstance(collection_items, list):
            for item in collection_items:
                prompt = item["prompt"]
                drills.append({
                    "id": item["id"],
                    "title": item["title"],
                    "difficulty": item["difficulty"],
                    "topic": prompt["topic"],
                    "bugTypes": prompt["bugTypes"],
                    "rules": prompt["rules"],
                })

    if len(drills) < count:
        raise ValueError(
            f"Only {len(drills)} drills are available; {count} are required."
        )

    selected_drills = random.sample(drills, count)
    prompt_template = load_prompt()

    questions = []

    for index, drill in enumerate(selected_drills):
        try:
            generated = await generate_question(
                topic=drill["topic"],
                difficulty=drill["difficulty"],
                bug_types=drill["bugTypes"],
                rules=drill["rules"],
                prompt_template=prompt_template,
            )

            if not all(key in generated for key in ("topic", "description", "code")):
                raise ValueError("Ollama response is missing required fields.")

            questions.append({
                "questionNo": index + 1,
                "language": language["id"],
                "topic": generated["topic"],
                "description": generated["description"],
                "code": generated["code"],
                "fileName": f"MockAssessment_Question{index + 1}.{language['fileExtension']}",
                "round": 1,
                "source": "ollama",
                "_difficulty": drill["difficulty"],
                "_bugTypes": drill["bugTypes"],
                "_rules": drill["rules"],
            })
        except Exception as e:
            print(f"✗ Error generating question {index + 1}: {e}")
            raise

    return questions


def create_assessment_id():
    return str(uuid.uuid4())
