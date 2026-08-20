import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from .models import ConceptProgress, ConceptProgressSummary, UserProgressResponse

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class ConceptProgressService:
    """Service for managing concept learning progress"""

    @staticmethod
    def start_concept(candidate_id: str, concept_id: str) -> ConceptProgress:
        """Start tracking progress for a concept"""
        with engine.begin() as connection:
            # Check if already exists
            existing = connection.execute(
                text(
                    """
                    SELECT id, status FROM concept_progress
                    WHERE candidate_id = :candidate_id AND concept_id = :concept_id
                    """
                ),
                {"candidate_id": candidate_id, "concept_id": concept_id},
            ).fetchone()

            if existing:
                progress_id, status = existing
                if status == "not_started":
                    # Update to in_progress
                    connection.execute(
                        text(
                            """
                            UPDATE concept_progress
                            SET status = 'in_progress', started_at = NOW(), last_accessed = NOW(), updated_at = NOW()
                            WHERE id = :id
                            """
                        ),
                        {"id": progress_id},
                    )
                    return ConceptProgressService.get_progress(
                        candidate_id, concept_id
                    )
                else:
                    # Just update last_accessed
                    connection.execute(
                        text(
                            """
                            UPDATE concept_progress
                            SET last_accessed = NOW(), updated_at = NOW()
                            WHERE id = :id
                            """
                        ),
                        {"id": progress_id},
                    )
                    return ConceptProgressService.get_progress(
                        candidate_id, concept_id
                    )
            else:
                # Create new progress record
                progress_id = str(uuid.uuid4())
                connection.execute(
                    text(
                        """
                        INSERT INTO concept_progress (
                            id, candidate_id, concept_id, status, started_at, last_accessed, created_at, updated_at
                        ) VALUES (:id, :candidate_id, :concept_id, 'in_progress', NOW(), NOW(), NOW(), NOW())
                        """
                    ),
                    {
                        "id": progress_id,
                        "candidate_id": candidate_id,
                        "concept_id": concept_id,
                    },
                )

        return ConceptProgressService.get_progress(candidate_id, concept_id)

    @staticmethod
    def complete_concept(
        candidate_id: str, concept_id: str, time_spent_seconds: int = 0
    ) -> ConceptProgress:
        """Mark a concept as completed"""
        with engine.begin() as connection:
            existing = connection.execute(
                text(
                    """
                    SELECT id, time_spent_seconds FROM concept_progress
                    WHERE candidate_id = :candidate_id AND concept_id = :concept_id
                    """
                ),
                {"candidate_id": candidate_id, "concept_id": concept_id},
            ).fetchone()

            if existing:
                progress_id, existing_time = existing
                total_time = (existing_time or 0) + time_spent_seconds
                connection.execute(
                    text(
                        """
                        UPDATE concept_progress
                        SET status = 'completed', completed_at = NOW(), time_spent_seconds = :total_time, last_accessed = NOW(), updated_at = NOW()
                        WHERE id = :id
                        """
                    ),
                    {"id": progress_id, "total_time": total_time},
                )
            else:
                # Create and complete
                progress_id = str(uuid.uuid4())
                connection.execute(
                    text(
                        """
                        INSERT INTO concept_progress (
                            id, candidate_id, concept_id, status, started_at, completed_at, time_spent_seconds, last_accessed, created_at, updated_at
                        ) VALUES (:id, :candidate_id, :concept_id, 'completed', NOW(), NOW(), :time_spent, NOW(), NOW(), NOW())
                        """
                    ),
                    {
                        "id": progress_id,
                        "candidate_id": candidate_id,
                        "concept_id": concept_id,
                        "time_spent": time_spent_seconds,
                    },
                )

        return ConceptProgressService.get_progress(candidate_id, concept_id)

    @staticmethod
    def update_progress(
        candidate_id: str, concept_id: str, time_spent_seconds: int
    ) -> ConceptProgress:
        """Update progress with additional time spent"""
        with engine.begin() as connection:
            existing = connection.execute(
                text(
                    """
                    SELECT id, time_spent_seconds FROM concept_progress
                    WHERE candidate_id = :candidate_id AND concept_id = :concept_id
                    """
                ),
                {"candidate_id": candidate_id, "concept_id": concept_id},
            ).fetchone()

            if existing:
                progress_id, existing_time = existing
                total_time = (existing_time or 0) + time_spent_seconds
                connection.execute(
                    text(
                        """
                        UPDATE concept_progress
                        SET time_spent_seconds = :total_time, last_accessed = NOW(), updated_at = NOW()
                        WHERE id = :id
                        """
                    ),
                    {"id": progress_id, "total_time": total_time},
                )
            else:
                # Create with time
                progress_id = str(uuid.uuid4())
                connection.execute(
                    text(
                        """
                        INSERT INTO concept_progress (
                            id, candidate_id, concept_id, status, started_at, time_spent_seconds, last_accessed, created_at, updated_at
                        ) VALUES (:id, :candidate_id, :concept_id, 'in_progress', NOW(), :time_spent, NOW(), NOW(), NOW())
                        """
                    ),
                    {
                        "id": progress_id,
                        "candidate_id": candidate_id,
                        "concept_id": concept_id,
                        "time_spent": time_spent_seconds,
                    },
                )

        return ConceptProgressService.get_progress(candidate_id, concept_id)

    @staticmethod
    def get_progress(candidate_id: str, concept_id: str) -> ConceptProgress:
        """Get progress for a specific concept"""
        with engine.begin() as connection:
            row = connection.execute(
                text(
                    """
                    SELECT id, candidate_id, concept_id, status, started_at, completed_at, 
                           time_spent_seconds, last_accessed, notes, created_at, updated_at
                    FROM concept_progress
                    WHERE candidate_id = :candidate_id AND concept_id = :concept_id
                    """
                ),
                {"candidate_id": candidate_id, "concept_id": concept_id},
            ).fetchone()

            if not row:
                return None

            return ConceptProgress(
                id=str(row[0]),
                candidate_id=str(row[1]),
                concept_id=row[2],
                status=row[3],
                started_at=row[4],
                completed_at=row[5],
                time_spent_seconds=row[6],
                last_accessed=row[7],
                notes=row[8],
                created_at=row[9],
                updated_at=row[10],
            )

    @staticmethod
    def get_all_progress(candidate_id: str) -> UserProgressResponse:
        """Get all progress for a candidate with summary"""
        with engine.begin() as connection:
            rows = connection.execute(
                text(
                    """
                    SELECT id, candidate_id, concept_id, status, started_at, completed_at, 
                           time_spent_seconds, last_accessed, notes, created_at, updated_at
                    FROM concept_progress
                    WHERE candidate_id = :candidate_id
                    ORDER BY last_accessed DESC
                    """
                ),
                {"candidate_id": candidate_id},
            ).fetchall()

            progress_map = {}
            for row in rows:
                progress = ConceptProgress(
                    id=str(row[0]),
                    candidate_id=str(row[1]),
                    concept_id=row[2],
                    status=row[3],
                    started_at=row[4],
                    completed_at=row[5],
                    time_spent_seconds=row[6],
                    last_accessed=row[7],
                    notes=row[8],
                    created_at=row[9],
                    updated_at=row[10],
                )
                progress_map[row[2]] = progress

        # Calculate summary
        total_concepts = len(progress_map)
        completed = sum(1 for p in progress_map.values() if p.status == "completed")
        in_progress = sum(1 for p in progress_map.values() if p.status == "in_progress")
        not_started = total_concepts - completed - in_progress
        total_time = sum(
            p.time_spent_seconds or 0 for p in progress_map.values()
        )
        completion_percentage = (
            (completed / total_concepts * 100) if total_concepts > 0 else 0
        )

        summary = ConceptProgressSummary(
            total_concepts=total_concepts,
            completed_concepts=completed,
            in_progress_concepts=in_progress,
            not_started_concepts=not_started,
            total_time_spent_seconds=total_time,
            completion_percentage=completion_percentage,
        )

        return UserProgressResponse(progress_map=progress_map, summary=summary)
