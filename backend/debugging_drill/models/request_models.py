from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """
    Request to generate a debugging question.
    """

    id: str = Field(
        ...,
        description="Unique drill id"
    )

    language: str = Field(
        default="java",
        description="Content language identifier",
    )


class EvaluateRequest(BaseModel):
    """
    Request to evaluate user submitted code.
    """

    id: str = Field(
        ...,
        description="Unique drill id"
    )

    language: str = Field(
        default="java",
        description="Content language identifier",
    )

    questionId: str | None = Field(
        default=None,
        description="Question id for the currently generated drill question"
    )

    assessmentId: str | None = Field(
        default=None,
        description="Current assessment id for the logged-in candidate"
    )

    # The candidate's analysis / explanation of the bug and approach
    userAnalysis: str = Field(
        ...,
        min_length=1,
        description="User-provided analysis / explanation text"
    )

    userCode: str | None = Field(
        default=None,
        description="User-submitted Java code"
    )

    # The original buggy Java code shown to the candidate (optional)
    originalCode: str | None = Field(
        default=None,
        description="Original generated buggy Java code"
    )
