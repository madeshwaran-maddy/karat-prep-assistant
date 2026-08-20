from typing import List
from pydantic import BaseModel


class Round1Question(BaseModel):
    language: str = "java"
    questionNo: int
    topic: str
    description: str
    code: str
    fileName: str
    round: int
    source: str


class Round2Question(BaseModel):
    language: str = "java"
    questionNo: int
    title: str
    code: str
    round: int
    source: str


class AssessmentResponse(BaseModel):
    language: str = "java"
    assessmentId: str
    interviewerName: str
    round1Questions: List[Round1Question]
    round2Question: Round2Question
