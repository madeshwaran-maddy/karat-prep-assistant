from __future__ import annotations

import json
from typing import Optional

import httpx


class OllamaService:
    """
    Wrapper around the local Ollama REST API.

    Default endpoint:
        http://localhost:11434

    Default model:
        llama3.2:3b
    """

    def __init__(
        self,
        host: str = "http://localhost:11434",
        model: str = "qwen2.5-coder:3b",
        timeout: int = 180,
    ):

        self.host = host.rstrip("/")

        self.model = model

        self.timeout = timeout

        self.generate_url = (
            f"{self.host}/api/generate"
        )

    # ---------------------------------------------------------

    def _invoke(
        self,
        prompt: str,
        temperature: float = 0.3,
    ) -> str:

        payload = {

            "model": self.model,

            "prompt": prompt,

            "stream": False,

            "options": {

                "temperature": temperature,

            },
        }

        try:

            with httpx.Client(
                timeout=self.timeout
            ) as client:

                response = client.post(
                    self.generate_url,
                    json=payload,
                )

                response.raise_for_status()

                body = response.json()

                return body.get(
                    "response",
                    "",
                ).strip()

        except httpx.TimeoutException:

            raise RuntimeError(
                "Ollama request timed out."
            )

        except httpx.HTTPStatusError as ex:

            raise RuntimeError(
                f"Ollama returned HTTP {ex.response.status_code}"
            )

        except Exception as ex:

            raise RuntimeError(
                f"Ollama error: {ex}"
            )

    # ---------------------------------------------------------

    def generate_code(
        self,
        prompt: str,
    ) -> str:
        """
        Generate buggy Java code.
        """

        response = self._invoke(
            prompt,
            temperature=0.6,
        )

        code_value = self._extract_code_value(response)
        if code_value:
            return self._normalize_generated_code(code_value)

        return self._normalize_generated_code(response)

    # ---------------------------------------------------------

    def evaluate_solution(
        self,
        prompt: str,
    ) -> dict:
        """
        Ask Ollama to return JSON.

        If parsing fails,
        return a safe default.
        """

        response = self._invoke(
            prompt,
            temperature=0.2,
        )

        parsed = self._parse_json_response(response)
        if parsed is not None:
            return parsed

        return {
            "score": 0,
            "correct": False,
            "explanation": "Unable to parse model response.",
            "suggestions": [
                "Try again."
            ],
            "correctedCode": ""
        }

    # ---------------------------------------------------------

    def _parse_json_response(
        self,
        response: str,
    ) -> Optional[dict]:
        """Backward-compatible wrapper for evaluation parsing."""
        return self._extract_json_payload(response)

    def _extract_json_payload(
        self,
        response: str,
    ) -> Optional[dict]:
        """Parse JSON from model output, even with extra wrapper text."""
        candidate = response.strip()

        # Remove markdown fences if present.
        if candidate.startswith("```"):
            parts = candidate.split("\n")
            if len(parts) >= 2:
                candidate = "\n".join(parts[1:-1]).strip()

        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        decoder = json.JSONDecoder()
        for start in range(len(candidate)):
            if candidate[start] != "{":
                continue
            try:
                parsed, _ = decoder.raw_decode(candidate[start:])
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                return parsed

        return None

    def _extract_code_value(
        self,
        response: str,
    ) -> Optional[str]:
        """Extract a code string from JSON-like responses even when truncated."""
        parsed = self._extract_json_payload(response)
        if isinstance(parsed, dict):
            code_value = parsed.get("code")
            if isinstance(code_value, str):
                return code_value

        candidate = response.strip()
        marker = '"code"'
        start = candidate.find(marker)
        while start != -1:
            colon = candidate.find(":", start + len(marker))
            if colon == -1:
                break

            value_start = colon + 1
            while value_start < len(candidate) and candidate[value_start].isspace():
                value_start += 1

            if value_start < len(candidate) and candidate[value_start] == '"':
                content_start = value_start + 1
                escaped = False
                index = content_start
                while index < len(candidate):
                    char = candidate[index]
                    if escaped:
                        escaped = False
                    elif char == "\\":
                        escaped = True
                    elif char == '"':
                        return candidate[content_start:index]
                    index += 1
                return candidate[content_start:]

            start = candidate.find(marker, start + 1)

        return None

    @staticmethod
    def _normalize_generated_code(code: str) -> str:
        """Strip wrappers and repair simple truncation in generated Java."""
        candidate = code.strip()

        if candidate.startswith("```"):
            parts = candidate.split("\n")
            if len(parts) >= 2:
                candidate = "\n".join(parts[1:-1]).strip()

        candidate = candidate.strip()
        if not candidate:
            return candidate

        stack: list[str] = []
        pairs = {"{": "}", "(": ")", "[": "]"}
        opening = set(pairs)
        closing = set(pairs.values())

        for char in candidate:
            if char in opening:
                stack.append(char)
            elif char in closing:
                if stack and pairs[stack[-1]] == char:
                    stack.pop()

        if stack:
            missing = "".join(pairs[item] for item in reversed(stack))
            candidate = f"{candidate}\n{missing}"

        return candidate

    # ---------------------------------------------------------

    def health(self) -> bool:
        """
        Verify Ollama server
        is reachable.
        """

        try:

            with httpx.Client(
                timeout=5
            ) as client:

                response = client.get(
                    f"{self.host}/api/tags"
                )

                return response.status_code == 200

        except Exception:

            return False

    # ---------------------------------------------------------

    def available_models(
        self,
    ) -> list[str]:

        try:

            with httpx.Client(
                timeout=10
            ) as client:

                response = client.get(
                    f"{self.host}/api/tags"
                )

                response.raise_for_status()

                body = response.json()

                return [

                    model["name"]

                    for model in body.get(
                        "models",
                        []
                    )

                ]

        except Exception:

            return []