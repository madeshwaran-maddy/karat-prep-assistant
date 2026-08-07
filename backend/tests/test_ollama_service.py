import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from debugging_drill.services.ollama_service import OllamaService


class OllamaServiceTests(unittest.TestCase):
    def test_extract_code_value_from_truncated_json_response(self):
        service = OllamaService(host="http://localhost:11434", model="qwen2.5-coder:3b")
        response = '{"topic": "Map Debugging", "description": "Fix the bug", "code": "public class Demo {\\n  public static void main(String[] args) {\\n    Map<String, Integer> counts = new HashMap<>();\\n    counts.put(\\"a\\", 1);\\n    counts.put(\\"b\\", 2);\\n    System.out.println(counts.get(\\"a\\"));\\n  }\\n}"'

        code = service._extract_code_value(response)

        self.assertIsNotNone(code)
        self.assertIn("public class Demo", code)
        self.assertIn("Map<String, Integer>", code)


if __name__ == "__main__":
    unittest.main()
