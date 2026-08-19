import random
from pathlib import Path

import pandas as pd
try:
    from config.languages import get_language
except ModuleNotFoundError:
    from backend.config.languages import get_language


BACKEND_DIR = Path(__file__).resolve().parents[2]
def _language_directory(language_id: str) -> str:
    return get_language(language_id)["id"]


MOCK_ROUND2_EXCEL_FILE = BACKEND_DIR / "mock_assessment" / "data" / "java" / "round2_questions.xlsx"
EXERCISE_QUESTION_FILE = BACKEND_DIR / "exercise-question" / "java" / "exercise-questions.xlsx"


def _get_random_question_from_excel(file_path: Path):
    if not file_path.exists():
        raise FileNotFoundError(f"Excel file not found: {file_path}")

    df = pd.read_excel(file_path)
    if df.empty:
        raise ValueError(f"Excel file contains no questions: {file_path}")

    normalized_columns = {str(column).strip().lower(): column for column in df.columns}
    question_no_col = (
        normalized_columns.get("questionno")
        or normalized_columns.get("question no")
        or "QuestionNo"
    )
    title_col = normalized_columns.get("title") or "title"
    code_col = normalized_columns.get("code") or normalized_columns.get("code snippet") or "Code"

    missing = [
        column_name
        for column_name, column in {
            "questionNo": question_no_col,
            "title": title_col,
            "code": code_col,
        }.items()
        if column not in df.columns
    ]

    if missing:
        raise ValueError(f"Missing Excel columns: {missing}")

    valid_rows = []
    for _, row in df.iterrows():
        question_no = row.get(question_no_col)
        title = row.get(title_col)
        code = row.get(code_col)

        if pd.isna(question_no) or pd.isna(title) or pd.isna(code):
            continue

        title_text = str(title).strip()
        code_text = str(code).strip()
        if not title_text or not code_text:
            continue

        valid_rows.append(
            {
                "questionNo": int(question_no),
                "title": title_text,
                "code": code_text,
                "round": 2,
                "source": "excel",
            }
        )

    if not valid_rows:
        raise ValueError(f"Excel file contains no valid questions: {file_path}")

    return random.choice(valid_rows)


EXCEL_FILE = MOCK_ROUND2_EXCEL_FILE


def get_random_round2_question(language_id: str = "java"):
    file_path = BACKEND_DIR / "mock_assessment" / "data" / _language_directory(language_id) / "round2_questions.xlsx"
    return _get_random_question_from_excel(file_path)


def get_random_exercise_question(language_id: str = "java"):
    file_path = BACKEND_DIR / "exercise-question" / _language_directory(language_id) / "exercise-questions.xlsx"
    return _get_random_question_from_excel(file_path)
