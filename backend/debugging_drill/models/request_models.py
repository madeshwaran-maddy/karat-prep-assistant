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

    userCode: str = Field(
        ...,
        min_length=1,
        description="User edited Java source code"
    )