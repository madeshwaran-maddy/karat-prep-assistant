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


if __name__ == "__main__":
    unittest.main()
