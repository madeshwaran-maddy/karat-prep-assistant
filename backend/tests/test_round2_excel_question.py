from mock_assessment.services.excel_service import (
    EXERCISE_QUESTION_FILE,
    MOCK_ROUND2_EXCEL_FILE,
    get_random_exercise_question,
    get_random_round2_question,
)


def test_mock_round2_excel_file_matches_backend_workbook():
    assert MOCK_ROUND2_EXCEL_FILE.name == "round2_questions.xlsx"
    assert MOCK_ROUND2_EXCEL_FILE.exists()


def test_exercise_question_excel_file_matches_backend_workbook():
    assert EXERCISE_QUESTION_FILE.name == "exercise-questions.xlsx"
    assert EXERCISE_QUESTION_FILE.exists()


def test_random_mock_round2_question_is_loaded_from_excel():
    question = get_random_round2_question()

    assert question["round"] == 2
    assert question["source"] == "excel"
    assert question["title"].strip()
    assert question["code"].strip()
    assert isinstance(question["questionNo"], int)


def test_random_exercise_question_is_loaded_from_excel():
    question = get_random_exercise_question()

    assert question["round"] == 2
    assert question["source"] == "excel"
    assert question["title"].strip()
    assert question["code"].strip()
    assert isinstance(question["questionNo"], int)
