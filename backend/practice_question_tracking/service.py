from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
import uuid

from practice_question_tracking.models import PracticeQuestionProgress
from practice_question_tracking.schemas import (
    PracticeQuestionProgressResponse,
    TopicProgressSummary,
    UserPracticeProgressResponse,
)


class PracticeQuestionProgressService:
    """Service for managing practice question progress"""

    @staticmethod
    def start_question(
        db: Session,
        candidate_id: str,
        section: str,
        topic_id: str,
        question_no: int,
        language_selected: str = None,
    ) -> PracticeQuestionProgressResponse:
        """Start tracking progress for a question"""
        
        # Check if already exists
        existing = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id,
            PracticeQuestionProgress.section == section,
            PracticeQuestionProgress.topic_id == topic_id,
            PracticeQuestionProgress.question_no == question_no,
        ).first()

        print(f"Existing progress: {existing}")
        print(f"Existing progress condition: {existing.status if existing else 'None'}")

        if existing:
            # Update to in_progress if not already completed
            if existing.status != "completed":
                existing.status = "in_progress"
                existing.started_at = existing.started_at or datetime.utcnow()
                existing.last_accessed = datetime.utcnow()
                existing.updated_at = datetime.utcnow()
                if language_selected:
                    existing.language_selected = language_selected
            else:
                # Just update last_accessed if completed
                existing.last_accessed = datetime.utcnow()
                existing.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(existing)
            return PracticeQuestionProgressResponse.from_orm(existing)
        else:
            # Create new progress record
            progress = PracticeQuestionProgress(
                id=uuid.uuid4(),
                candidate_id=candidate_id,
                section=section,
                topic_id=topic_id,
                question_no=question_no,
                status="in_progress",
                started_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                language_selected=language_selected,
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
            return PracticeQuestionProgressResponse.from_orm(progress)

    @staticmethod
    def complete_question(
        db: Session,
        candidate_id: str,
        section: str,
        topic_id: str,
        question_no: int,
        time_spent_seconds: int = 0,
    ) -> PracticeQuestionProgressResponse:
        """Mark a question as completed"""
        
        progress = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id,
            PracticeQuestionProgress.section == section,
            PracticeQuestionProgress.topic_id == topic_id,
            PracticeQuestionProgress.question_no == question_no,
        ).first()

        if not progress:
            # Create with completed status
            progress = PracticeQuestionProgress(
                id=uuid.uuid4(),
                candidate_id=candidate_id,
                section=section,
                topic_id=topic_id,
                question_no=question_no,
                status="completed",
                time_spent_seconds=time_spent_seconds,
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
            )
            db.add(progress)
        else:
            progress.status = "completed"
            progress.time_spent_seconds = time_spent_seconds
            progress.completed_at = datetime.utcnow()
            progress.last_accessed = datetime.utcnow()
            progress.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(progress)
        return PracticeQuestionProgressResponse.from_orm(progress)

    @staticmethod
    def update_time_spent(
        db: Session,
        candidate_id: str,
        section: str,
        topic_id: str,
        question_no: int,
        time_spent_seconds: int,
    ) -> PracticeQuestionProgressResponse:
        """Update time spent on a question"""
        
        progress = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id,
            PracticeQuestionProgress.section == section,
            PracticeQuestionProgress.topic_id == topic_id,
            PracticeQuestionProgress.question_no == question_no,
        ).first()

        if not progress:
            raise ValueError("Progress record not found")

        progress.time_spent_seconds = time_spent_seconds
        progress.last_accessed = datetime.utcnow()
        progress.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(progress)
        return PracticeQuestionProgressResponse.from_orm(progress)

    @staticmethod
    def get_question_progress(
        db: Session,
        candidate_id: str,
        section: str,
        topic_id: str,
        question_no: int,
    ) -> Optional[PracticeQuestionProgressResponse]:
        """Get progress for a specific question"""
        
        progress = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id,
            PracticeQuestionProgress.section == section,
            PracticeQuestionProgress.topic_id == topic_id,
            PracticeQuestionProgress.question_no == question_no,
        ).first()

        if not progress:
            return None
        
        return PracticeQuestionProgressResponse.from_orm(progress)

    @staticmethod
    def get_topic_progress(
        db: Session,
        candidate_id: str,
        section: str,
        topic_id: str,
    ) -> Dict[str, PracticeQuestionProgressResponse]:
        """Get all progress for a topic"""
        
        progress_records = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id,
            PracticeQuestionProgress.section == section,
            PracticeQuestionProgress.topic_id == topic_id,
        ).all()

        return {
            f"q{p.question_no}": PracticeQuestionProgressResponse.from_orm(p)
            for p in progress_records
        }

    @staticmethod
    def get_all_progress(
        db: Session,
        candidate_id: str,
    ) -> UserPracticeProgressResponse:
        """Get all practice progress for a candidate"""
        
        all_progress = db.query(PracticeQuestionProgress).filter(
            PracticeQuestionProgress.candidate_id == candidate_id
        ).all()

        # Build progress map
        progress_map = {
            f"{p.section}-{p.topic_id}-{p.question_no}": PracticeQuestionProgressResponse.from_orm(p)
            for p in all_progress
        }

        # Build summary by topic
        summary_by_topic = {}
        for p in all_progress:
            topic_key = f"{p.section}-{p.topic_id}"
            if topic_key not in summary_by_topic:
                summary_by_topic[topic_key] = {
                    "section": p.section,
                    "topic_id": p.topic_id,
                    "total_questions": 0,
                    "completed_questions": 0,
                    "in_progress_questions": 0,
                    "total_time_spent": 0,
                }
            
            summary_by_topic[topic_key]["total_questions"] += 1
            if p.status == "completed":
                summary_by_topic[topic_key]["completed_questions"] += 1
            elif p.status == "in_progress":
                summary_by_topic[topic_key]["in_progress_questions"] += 1
            
            summary_by_topic[topic_key]["total_time_spent"] += p.time_spent_seconds

        # Convert to TopicProgressSummary
        summary_objects = {}
        for topic_key, summary in summary_by_topic.items():
            total = summary["total_questions"]
            completed = summary["completed_questions"]
            progress_pct = (completed / total * 100) if total > 0 else 0
            avg_time = (summary["total_time_spent"] / total) if total > 0 else 0
            
            summary_objects[topic_key] = TopicProgressSummary(
                section=summary["section"],
                topic_id=summary["topic_id"],
                total_questions=total,
                completed_questions=completed,
                in_progress_questions=summary["in_progress_questions"],
                average_time_spent=avg_time,
                progress_percentage=progress_pct,
            )

        # Calculate total time spent
        total_time_spent = sum(p.time_spent_seconds for p in all_progress)

        return UserPracticeProgressResponse(
            progress_map=progress_map,
            summary_by_topic=summary_objects,
            total_time_spent=total_time_spent,
        )
