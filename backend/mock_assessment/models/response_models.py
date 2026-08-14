from typing import List
from pydantic import BaseModel


class Round1Question(BaseModel):
    questionNo: int
    topic: str
    description: str
    code: str
    fileName: str
    round: int
    source: str


class Round2Question(BaseModel):
    questionNo: int
    title: str
    code: str
    round: int
    source: str


class AssessmentResponse(BaseModel):
    assessmentId: str
    round1Questions: List[Round1Question]
    round2Question: Round2Question
