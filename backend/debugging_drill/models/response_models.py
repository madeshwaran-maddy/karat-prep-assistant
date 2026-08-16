from typing import List

from pydantic import BaseModel, Field

from pydantic import field_validator


class GenerateResponse(BaseModel):
    """
    Response returned after generating
    a debugging question.
    """

    id: str | None = Field(
        default=None,
        description="Persisted question id"
    )

    topic: str = Field(
        ...,
        description="Java topic"
    )

    difficulty: str = Field(
        ...,
        description="Difficulty level"
    )

    code: str = Field(
        ...,
        description="Generated buggy Java code"
    )


class EvaluateResponse(BaseModel):
    """
    Response returned after evaluating
    the user's solution.
    """

    score: int = Field(
        ...,
        ge=0,
        le=10,
        description="Score out of 10"
    )

    correct: bool = Field(
        ...,
        description="Whether the solution is correct"
    )

    explanation: str = Field(
        ...,
        description="Explanation of the result"
    )

    suggestions: List[str] = Field(
        default_factory=list,
        description="Improvement suggestions"
    )

    correctedCode: str = Field(
        ...,
        description="Corrected Java code"
    )

    buggyCode: str = Field(
        default="",
        description="Original buggy Java code"
    )

class EvaluationResult(BaseModel):

    score: int

    correct: bool

    explanation: str

    suggestions: list[str]

    correctedCode: str

    buggyCode: str | None = None

    @field_validator("score")
    @classmethod
    def validate_score(cls, value):

        if value < 0:
            return 0

        if value > 10:
            return 10

        return value