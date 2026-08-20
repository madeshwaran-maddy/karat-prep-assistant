import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.append(str(Path(__file__).resolve().parents[1]))

from ai_provider import extract_openrouter_text, get_ai_provider, get_openrouter_model


class AiProviderTests(unittest.TestCase):
    def test_ollama_is_the_default_provider(self):
        with patch.dict(os.environ, {"AI_PROVIDER": ""}, clear=False):
            os.environ.pop("AI_PROVIDER", None)
            self.assertEqual(get_ai_provider(), "ollama")

    def test_openrouter_model_defaults_to_nemotron(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("OPENROUTER_MODEL", None)
            self.assertEqual(
                get_openrouter_model(),
                "nvidia/nemotron-3-super-120b-a12b:free",
            )

    def test_extract_openrouter_chat_content(self):
        body = {
            "choices": [{"message": {"content": '{"score": 8}'}}],
        }
        self.assertEqual(extract_openrouter_text(body), '{"score": 8}')


if __name__ == "__main__":
    unittest.main()
