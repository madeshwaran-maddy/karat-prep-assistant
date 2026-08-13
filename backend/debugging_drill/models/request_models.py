from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """
    Request to generate a debugging question.
    """

    id: str = Field(
        ...,
        description="Unique drill id"
    )


class EvaluateRequest(BaseModel):
    """
    Request to evaluate user submitted code.
    """

    id: str = Field(
        ...,
        description="Unique drill id"
    )

    # The candidate's analysis / explanation of the bug and approach
    userAnalysis: str = Field(
        ...,
        min_length=1,
        description="User-provided analysis / explanation text"
    )