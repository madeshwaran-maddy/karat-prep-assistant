from pydantic import BaseModel


class EvaluateRequest(BaseModel):
    assessment_id: str
    question_no: int
    user_code: str
