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
        user_code: str,
    ) -> dict:
        """
        Evaluate the submitted code.
        """

        prompt = self.prompts.build_evaluation_prompt(
            drill=drill,
            user_code=user_code,
        )

        response = self.ollama.evaluate_solution(
            prompt
        )

        validated = EvaluationResult.model_validate(
            response
        )

        return validated.model_dump()