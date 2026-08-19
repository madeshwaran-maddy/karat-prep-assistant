from pathlib import Path
from typing import Any


class PromptService:
    """
    Responsible for building prompts that are
    sent to the LLM.

    Prompt templates are stored under:

        prompts/
            generate_prompt.txt
            evaluate_prompt.txt
    """

    def __init__(self) -> None:

        prompt_dir = (
            Path(__file__)
            .parent.parent
            / "prompts"
            / "java"
        )

        self.generate_template = (
            prompt_dir
            / "generate_prompt.txt"
        )

        self.evaluate_template = (
            prompt_dir
            / "evaluate_prompt.txt"
        )

    # ----------------------------------------------------
    # Template Readers
    # ----------------------------------------------------

    def _read_template(
        self,
        template_path: Path,
    ) -> str:

        return template_path.read_text(
            encoding="utf-8"
        )

    # ----------------------------------------------------
    # Helpers
    # ----------------------------------------------------

    @staticmethod
    def _format_list(
        values: list[str],
    ) -> str:

        return "\n".join(
            f"- {item}"
            for item in values
        )

    # ----------------------------------------------------
    # Generate Prompt
    # ----------------------------------------------------

    def build_generation_prompt(
        self,
        drill: dict[str, Any],
    ) -> str:

        template = self._read_template(
            self.generate_template
        )

        prompt = drill["prompt"]

        return template.format(

            topic=prompt["topic"],

            bug_types=self._format_list(
                prompt["bugTypes"]
            ),

            rules=self._format_list(
                prompt["rules"]
            ),

            difficulty=drill["difficulty"],
        )

    # ----------------------------------------------------
    # Evaluate Prompt
    # ----------------------------------------------------

    def build_evaluation_prompt(
        self,
        drill: dict[str, Any],
        user_analysis: str,
        original_code: str | None = None,
    ) -> str:

        template = self._read_template(
            self.evaluate_template
        )

        prompt = drill["prompt"]

        return template.format(

            topic=prompt["topic"],

            bug_types=self._format_list(
                prompt["bugTypes"]
            ),

            rules=self._format_list(
                prompt["rules"]
            ),

            difficulty=drill["difficulty"],

            user_analysis=user_analysis,

            original_code=original_code or "",
        )