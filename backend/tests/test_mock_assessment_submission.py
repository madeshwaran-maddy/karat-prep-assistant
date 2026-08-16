import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mock_assessment.services.evaluation_service import build_evaluation_submission


class MockAssessmentSubmissionTests(unittest.TestCase):
    def test_mock_assessment_submission_has_empty_evaluation_fields(self):
        payload = build_evaluation_submission(
            assessment_id="a1b2c3",
            candidate_id="c1d2e3",
            question_id="q1w2e3",
            user_code="print('hello')",
        )

        self.assertEqual(payload["assessment_id"], "a1b2c3")
        self.assertEqual(payload["candidate_id"], "c1d2e3")
        self.assertEqual(payload["question_id"], "q1w2e3")
        self.assertEqual(payload["user_code"], "print('hello')")
        self.assertEqual(payload["user_analysis"], "")
        self.assertIsNone(payload["score"])
        self.assertIsNone(payload["correct"])
        self.assertEqual(payload["explanation"], "")
        self.assertEqual(payload["suggestions"], "")
        self.assertEqual(payload["corrected_code"], "")


if __name__ == "__main__":
    unittest.main()
