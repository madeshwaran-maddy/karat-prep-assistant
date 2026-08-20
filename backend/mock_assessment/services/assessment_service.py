import json
import uuid
from pathlib import Path

from .ollama_service import generate_question
try:
    from config.languages import get_language
except ModuleNotFoundError:
    from backend.config.languages import get_language


BASE_DIR = Path(__file__).resolve().parent.parent


def load_drills(language_id: str = "java"):
    language = get_language(language_id)
    drills_file = BASE_DIR.parent / "debugging_drill" / "data" / language["id"] / "drills.json"
    if not drills_file.exists():
        raise FileNotFoundError(f"drills.json not found: {drills_file}")

    with open(drills_file, "r", encoding="utf-8") as file:
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


def load_prompt(language_id: str = "java"):
    language = get_language(language_id)
    prompt_file = BASE_DIR / "prompts" / language["id"] / "generate_question_prompt.txt"
    with open(prompt_file, "r", encoding="utf-8") as file:
        return file.read()


async def generate_round1_questions(count: int = 4, language_id: str = "java"):
    import random

    language = get_language(language_id)
    drills = load_drills(language["id"])

    if not drills:
        raise ValueError(
            f"No drills are available for language '{language['id']}'."
        )

    selected_drills = random.sample(drills, min(count, len(drills)))
    if len(selected_drills) < count:
        selected_drills.extend(random.choices(drills, k=count - len(selected_drills)))

    prompt_template = load_prompt(language["id"])

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
