from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid

from database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)
    role = Column(String(50), nullable=True)
    lead_name = Column(String(255), nullable=True)
    start_date = Column(DateTime, nullable=True)
    karat_prep_timeline = Column(String(255), nullable=True)
    karat_assessment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PracticeQuestionProgress(Base):
    __tablename__ = "practice_question_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    language_selected = Column(String(255), nullable=True)
    section = Column(String(255), nullable=False)  # equalsAndHashCode, collections, etc.
    topic_id = Column(String(255), nullable=False)  # list, set, map, etc.
    question_no = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)  # not_started, in_progress, completed
    time_spent_seconds = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_accessed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    print(f"Existing progress 1: {candidate_id}")
    # Unique constraint to prevent duplicates
    __table_args__ = (
        UniqueConstraint('candidate_id', 'section', 'topic_id', 'question_no', 
                        name='uq_candidate_question'),
        Index('idx_practice_progress_candidate', 'candidate_id'),
    )
