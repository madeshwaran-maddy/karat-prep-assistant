import sys
import unittest
import os
from pathlib import Path

from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv()

from debugging_drill.services.ollama_service import OllamaService
from mock_assessment.services.ollama_service import _parse_json


class OllamaServiceTests(unittest.TestCase):
    def test_extract_code_value_from_truncated_json_response(self):
        service = OllamaService(host=os.environ["OLLAMA_URL"], model="qwen2.5-coder:3b")
        response = '{"topic": "Map Debugging", "description": "Fix the bug", "code": "public class Demo {\\n  public static void main(String[] args) {\\n    Map<String, Integer> counts = new HashMap<>();\\n    counts.put(\\"a\\", 1);\\n    counts.put(\\"b\\", 2);\\n    System.out.println(counts.get(\\"a\\"));\\n  }\\n}"'

        code = service._extract_code_value(response)

        self.assertIsNotNone(code)
        self.assertIn("public class Demo", code)
        self.assertIn("Map<String, Integer>", code)

    def test_parse_backtick_delimited_node_code(self):
        response = '''{
  "topic": "Node.js Event Loop and Asynchronous Programming Debugging",
  "description": "An asynchronous program with promise handling bugs.",
  "code": `
const fs = require('fs');

async function readFileAndHandleErrors(filename) {
  const data = await fs.promises.readFile(filename, 'utf8');
  console.log(data);
}

readFileAndHandleErrors('example.txt');
`
}'''

        parsed = _parse_json(response)

        self.assertTrue(parsed["code"].lstrip().startswith("const fs = require('fs');"))
        self.assertNotIn('"topic":', parsed["code"])


if __name__ == "__main__":
    unittest.main()
