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
        self.prompt_dir = Path(__file__).parent.parent / "prompts"

    def _template(self, language: str, name: str) -> Path:
        return self.prompt_dir / language.strip().lower() / name

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
        language: str = "java",
    ) -> str:

        template = self._read_template(self._template(language, "generate_prompt.txt"))

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
        language: str = "java",
    ) -> str:

        template = self._read_template(self._template(language, "evaluate_prompt.txt"))

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