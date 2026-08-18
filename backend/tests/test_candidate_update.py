import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app


class FakeResult:
    def __init__(self, rows=None):
        self._rows = rows or []

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows

    def mappings(self):
        return self

    def first(self):
        return self._rows[0] if self._rows else None

    def all(self):
        return self._rows


class CandidateMetadataIntegrityTests(unittest.TestCase):
    def test_practice_progress_foreign_key_targets_declared_candidate_table(self):
        from database import Base
        from practice_question_tracking.models import PracticeQuestionProgress

        candidate_table = Base.metadata.tables.get("candidates")
        self.assertIsNotNone(candidate_table, "Candidate table metadata is missing from the declarative base")

        fk_targets = {
            fk.target_fullname for fk in PracticeQuestionProgress.__table__.foreign_keys
        }
        self.assertIn("candidates.id", fk_targets)


class CandidateUpdateEndpointTests(unittest.TestCase):
    def test_candidate_update_persists_db_fields(self):
        class DummyConnection:
            def __init__(self):
                self.calls = []

            def execute(self, query, params=None):
                self.calls.append((str(query), params))
                if "SELECT id FROM candidates" in str(query):
                    return FakeResult([("candidate-123",)])
                return FakeResult([])

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc_value, traceback):
                return False

        connection = DummyConnection()

        with patch("main.engine.begin") as begin_mock, patch("main.engine.connect") as connect_mock:
            begin_mock.return_value.__enter__.return_value = connection
            connect_mock.return_value.__enter__.return_value = connection

            client = TestClient(app)
            response = client.put(
                "/api/reviewer/candidates/candidate-123",
                json={
                    "name": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "9876543210",
                    "lead_name": "Riya",
                    "status": "completed",
                    "role": "candidate",
                    "start_date": "2026-08-01",
                    "karat_assessment_date": "2026-08-15",
                    "karat_prep_timeline": "6 week",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Jane Doe")
        self.assertEqual(response.json()["status"], "completed")
        self.assertTrue(any("UPDATE candidates" in call[0] for call in connection.calls))


class MissingCandidateTableRepairTests(unittest.TestCase):
    def test_ensure_schema_rebuilds_candidate_related_tables_when_candidates_table_is_missing(self):
        class DummyConnection:
            def __init__(self):
                self.calls = []
                self.tables = {"practice_question_progress": True}

            def execute(self, query, params=None):
                self.calls.append((str(query), params))
                query_text = str(query).lower()

                if "information_schema.tables" in query_text and "candidates" in query_text:
                    return FakeResult([("false",)] if "candidates" in query_text else [("true",)])

                if "drop table if exists assessments" in query_text:
                    self.tables["assessments"] = False
                if "drop table if exists questions" in query_text:
                    self.tables["questions"] = False
                if "drop table if exists evaluations" in query_text:
                    self.tables["evaluations"] = False
                if "drop table if exists concept_progress" in query_text:
                    self.tables["concept_progress"] = False
                if "drop table if exists practice_question_progress" in query_text:
                    self.tables["practice_question_progress"] = False

                if "create table if not exists candidates" in query_text:
                    self.tables["candidates"] = True
                if "create table if not exists assessments" in query_text:
                    self.tables["assessments"] = True
                if "create table if not exists questions" in query_text:
                    self.tables["questions"] = True
                if "create table if not exists evaluations" in query_text:
                    self.tables["evaluations"] = True
                if "create table if not exists concept_progress" in query_text:
                    self.tables["concept_progress"] = True
                if "create table if not exists practice_question_progress" in query_text:
                    self.tables["practice_question_progress"] = True
                return FakeResult([])

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc_value, traceback):
                return False

        connection = DummyConnection()

        with patch("main.engine.begin") as begin_mock:
            begin_mock.return_value.__enter__.return_value = connection

            from main import ensure_schema
            ensure_schema()

        self.assertTrue(any("create table if not exists candidates" in call[0].lower() for call in connection.calls))
        self.assertTrue(any("drop table if exists practice_question_progress" in call[0].lower() for call in connection.calls))
        self.assertTrue(connection.tables.get("candidates") is True)


class ReviewerCandidateQuestionTests(unittest.TestCase):
    def test_candidate_attempt_returns_all_questions(self):
        class DummyConnection:
            def __init__(self):
                self.calls = []

            def execute(self, query, params=None):
                self.calls.append((str(query), params))
                query_text = str(query)

                if "FROM candidates c" in query_text and "WHERE c.id::text" in query_text:
                    return FakeResult([
                        {
                            "id": "candidate-123",
                            "name": "Jane Doe",
                            "email": "jane@example.com",
                            "phone": "9876543210",
                            "created_at": "2026-08-01T00:00:00",
                            "start_date": "2026-08-01",
                            "karat_prep_timeline": "6 weeks",
                            "karat_assessment_date": None,
                            "role": "candidate",
                            "lead_name": "Riya",
                            "status": "active",
                            "round1_attempts": 0,
                            "round2_attempts": 0,
                            "mock_attempts": 1,
                        }
                    ])

                if "FROM assessments a" in query_text and "ORDER BY a.created_at ASC" in query_text:
                    return FakeResult([
                        {
                            "id": "assessment-1",
                            "round": 1,
                            "attempt_no": 1,
                            "created_at": "2026-08-02T00:00:00",
                        }
                    ])

                if "FROM questions q" in query_text and "LEFT JOIN evaluations e" in query_text:
                    return FakeResult([
                        {
                            "id": "question-1",
                            "assessment_id": "assessment-1",
                            "question_no": 1,
                            "topic": "Topic A",
                            "subtopic": "Sub A",
                            "code": "code1",
                            "user_code": "user1",
                            "user_analysis": "analysis1",
                            "score": 80,
                            "explanation": "explanation1",
                            "suggestions": '["suggestion1"]',
                        },
                        {
                            "id": "question-2",
                            "assessment_id": "assessment-1",
                            "question_no": 2,
                            "topic": "Topic B",
                            "subtopic": "Sub B",
                            "code": "code2",
                            "user_code": "user2",
                            "user_analysis": "analysis2",
                            "score": 70,
                            "explanation": "explanation2",
                            "suggestions": '["suggestion2"]',
                        },
                        {
                            "id": "question-3",
                            "assessment_id": "assessment-1",
                            "question_no": 3,
                            "topic": "Topic C",
                            "subtopic": "Sub C",
                            "code": "code3",
                            "user_code": "user3",
                            "user_analysis": "analysis3",
                            "score": 90,
                            "explanation": "explanation3",
                            "suggestions": '["suggestion3"]',
                        },
                    ])

                return FakeResult([])

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc_value, traceback):
                return False

        connection = DummyConnection()

        with patch("main.engine.connect") as connect_mock:
            connect_mock.return_value.__enter__.return_value = connection

            client = TestClient(app)
            response = client.get("/api/reviewer/candidates/candidate-123")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["attempts"][0]["questions"]), 3)
        self.assertEqual(response.json()["attempts"][0]["questions"][0]["questionNo"], 1)
        self.assertEqual(response.json()["attempts"][0]["questions"][2]["questionNo"], 3)


if __name__ == "__main__":
    unittest.main()
