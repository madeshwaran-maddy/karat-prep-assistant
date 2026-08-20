from __future__ import annotations

from debugging_drill.models.response_models import (
    EvaluationResult,
)

from debugging_drill.services.ollama_service import (
    OllamaService,
)

from debugging_drill.services.prompt_service import (
    PromptService,
)


class EvaluationService:
    """
    Business layer responsible for evaluating
    the user's debugging solution.
    """

    def __init__(
        self,
        ollama_service: OllamaService,
        prompt_service: PromptService,
    ) -> None:

        self.ollama = ollama_service
        self.prompts = prompt_service

    # ---------------------------------------------------------

    def evaluate(
        self,
        drill: dict,
        user_analysis: str,
        original_code: str | None = None,
        language: str = "java",
    ) -> dict:
        """
        Evaluate the submitted analysis.
        """

        print(
            f"[evaluation-service] building prompt language={language} "
            f"analysis_length={len(user_analysis or '')} "
            f"original_code_length={len(original_code or '')}",
            flush=True,
        )
        prompt = self.prompts.build_evaluation_prompt(
            drill=drill,
            user_analysis=user_analysis,
            original_code=original_code,
            language=language,
        )

        print(
            f"[evaluation-service] provider={self.ollama.provider} "
            f"model={self.ollama.model} operation=evaluation",
            flush=True,
        )
        response = self.ollama.evaluate_solution(prompt)
        print(
            f"[evaluation-service] provider={self.ollama.provider} "
            f"model={self.ollama.model} response_type={type(response).__name__} "
            f"keys={list(response.keys()) if isinstance(response, dict) else 'n/a'}",
            flush=True,
        )

        # Try to validate the LLM response against our schema. If validation
        # fails because fields are missing or malformed, fall back to a
        # best-effort construction so the frontend still receives the
        # important fields (score, correct, explanation, suggestions,
        # correctedCode) and the buggy code when available.
        try:
            validated = EvaluationResult.model_validate(response)
            result = validated.model_dump()
        except Exception as exc:
            print(f"[evaluation-service] response validation fallback: {exc}", flush=True)
            # Best-effort defaults and extraction
            score = int(response.get("score", 0)) if isinstance(response, dict) else 0
            if score < 0:
                score = 0
            if score > 10:
                score = 10

            correct = bool(response.get("correct", False)) if isinstance(response, dict) else False
            explanation = str(response.get("explanation", "")) if isinstance(response, dict) else ""
            suggestions = response.get("suggestions", []) if isinstance(response, dict) else []
            if not isinstance(suggestions, list):
                suggestions = [str(suggestions)]
            corrected = str(response.get("correctedCode", "")) if isinstance(response, dict) else ""

            result = {
                "score": score,
                "correct": correct,
                "explanation": explanation,
                "suggestions": suggestions,
                "correctedCode": corrected,
            }

        # Ensure buggyCode is present: prefer the original code provided by
        # the frontend, otherwise accept any buggyCode returned by the model.
        if original_code:
            result["buggyCode"] = original_code
        else:
            # If the model provided a buggyCode field, keep it; otherwise
            # default to empty string.
            result["buggyCode"] = response.get("buggyCode", "") if isinstance(response, dict) else ""

        # This endpoint grades the candidate's written analysis. It must not
        # trigger a second code-generation request or grade editor code.
        result["correctedCode"] = ""

        print("[evaluation-service] evaluation complete", flush=True)
        return result