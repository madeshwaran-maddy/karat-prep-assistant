from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_FILE = BASE_DIR / "data" / "round2_questions.xlsx"


def get_random_round2_question():
    if not EXCEL_FILE.exists():
        raise FileNotFoundError(f"Round 2 Excel file not found: {EXCEL_FILE}")

    df = pd.read_excel(EXCEL_FILE)

    required_columns = ["questionNo", "title", "code"]
    missing = [column for column in required_columns if column not in df.columns]

    if missing:
        raise ValueError(f"Missing Excel columns: {missing}")

    if df.empty:
        raise ValueError("Round 2 Excel file contains no questions.")

    row = df.sample(n=1).iloc[0]

    return {
        "questionNo": int(row["questionNo"]),
        "title": str(row["title"]),
        "code": str(row["code"]),
        "round": 2,
        "source": "excel",
    }
