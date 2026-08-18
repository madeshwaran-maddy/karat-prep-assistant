# Database Integration Plan: Karat Prep Assistant

## Executive Summary

**Goal:** Integrate a persistent database into the Karat Prep Assistant to store candidate profiles, assessments, questions, and evaluation results.

**Technology Stack:** PostgreSQL + SQLAlchemy ORM (already in your `requirements.txt`)

**Timeline:** 3-4 days of development work across 4 phases

**Key Principle:** No frontend changes required—API response shapes remain identical; changes are purely backend infrastructure.

---

## Current State Analysis

### What Works Now
- ✅ FastAPI backend with clean route → service → model separation
- ✅ Pydantic models for request/response validation
- ✅ Ollama integration for AI-powered code generation and evaluation
- ✅ Frontend (Next.js) with functional assessment and debugging drill screens
- ✅ SQL libraries already installed (SQLAlchemy 2.0.51, Alembic, psycopg2-binary)

### Critical Gap
- ❌ **All data is in-memory** — Assessments stored in `ASSESSMENTS = {}` dict
- ❌ Data lost on server restart
- ❌ Reviewer dashboard uses hardcoded mock data
- ❌ No persistence layer designed or implemented

### Data Currently Needing Persistence
1. **Candidate Profiles** — Name, email, phone, status, lead name
2. **Assessment Records** — Round 1/2, created/completed dates, status
3. **Questions & Code** — Per-assessment question bank with generated code
4. **Evaluation Results** — Scores, feedback, corrected code, submission timestamps

---

## Recommended Architecture

### Database Choice: PostgreSQL

**Why PostgreSQL:**
- Free, open-source, production-grade RDBMS
- Excellent for structured relational data (candidates, assessments, evaluations)
- Installed ready: `psycopg2-binary` already in `requirements.txt`
- Scales from MVP (single instance) → production (replication, clustering)
- Strong JSON support if needed later (drill configs, etc.)
- Industry standard for Python/FastAPI stacks

**Alternative Considered (Not Recommended):**
- SQLite: Too simple, doesn't support concurrent writes well
- MongoDB: Overkill for structured data; harder to query relationships
- Firebase/Supabase: Trade-off between simplicity and vendor lock-in

### ORM Choice: SQLAlchemy

**Why SQLAlchemy:**
- Already installed (SQLAlchemy 2.0.51) and Alembic (migrations tool)
- Type-safe query builder; integrates seamlessly with FastAPI via dependency injection
- Declarative syntax keeps models readable
- Automatic migration generation via Alembic
- Can upgrade to async later via `asyncpg` when performance demands it

---

## Core Database Schema

### Tables & Relationships

```sql
-- Candidates (Users taking the assessment)
CREATE TABLE candidates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50),  -- pending, in_progress, completed , cleared , rejected
    role VARCHAR(50),  -- candidate, reviewer, admin
    lead_name VARCHAR(255),
    start_date date,
    karat_prep_timeline VARCHAR(255),  -- 4 weeks, 6 weeks, 8 weeks
    karat_assessment_date date,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    password_hash VARCHAR(1000)  -- for future authentication (bcrypt or argon2
);

-- Assessments (Each attempt/session)
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    attemptNo INTEGER NOT NULL,  -- 1, 2, 3...
    round INTEGER NOT NULL,  -- 1 or 2 or mock
    status VARCHAR(50),  -- in_progress, submitted, evaluated
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions (Per-assessment questions)
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    question_no INTEGER NOT NULL,
    topic VARCHAR(255),
    subtopic VARCHAR(255),
    difficulty VARCHAR(50),  -- easy, medium, hard
    description TEXT,
    code TEXT,
    source VARCHAR(50),  -- ollama, excel
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Evaluations (Candidate submissions & scores)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    user_code TEXT,
    user_analysis TEXT,  -- for debugging drill evaluations
    score INTEGER,  -- 0-10
    correct BOOLEAN,
    explanation TEXT,
    suggestions TEXT[],  -- JSON array
    corrected_code TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE practice_question_progress (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
	language_selected VARCHAR(255),
    section VARCHAR NOT NULL,
    topic_id VARCHAR NOT NULL,
    question_no INTEGER NOT NULL,
    status VARCHAR NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


```

### Relationships
```
Candidate (1) ──→ (Many) Assessment
Assessment (1) ──→ (Many) Question
Assessment (1) ──→ (Many) Evaluation
```

---

## Implementation Plan: 4 Phases

### Phase 1: Database Design & Setup (2-3 hours)

**Deliverables:**
1. SQLAlchemy ORM models matching schema above
2. Alembic migration initialization
3. Initial database schema migration script

**Files to Create:**
- `backend/database.py` — SQLAlchemy engine, SessionLocal, health checks, dependencies
- `backend/models/db_models.py` — SQLAlchemy ORM models (Candidate, Assessment, Question, Evaluation)
- `backend/models/schemas.py` — Pydantic schemas (keep separate from ORM)
- `backend/alembic/versions/001_initial_schema.py` — Auto-generated Alembic migration

**Key Code Patterns:**
```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/karat_prep_dev")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# models/db_models.py
from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    # ... other fields
    assessments = relationship("Assessment", back_populates="candidate")

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(String, primary_key=True)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    round = Column(Integer, nullable=False)
    # ... other fields
    candidate = relationship("Candidate", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment")
    evaluations = relationship("Evaluation", back_populates="assessment")
```

**Testing This Phase:**
- Run `alembic upgrade head` successfully
- Connect to database: `psql -U postgres -d karat_prep_dev`
- List tables: `\dt` — should show candidates, assessments, questions, evaluations
- Verify schema matches SQL above

---

### Phase 2: Backend Database Integration (4-6 hours)

#### 2a. Setup Database Layer (1 hour)
**Steps:**
1. Create `backend/database.py` with SQLAlchemy configuration
2. Create `backend/models/db_models.py` with ORM model definitions
3. Update `backend/main.py` to initialize database connection on app startup
4. Add `.env` file with `DATABASE_URL` (add `.env` to `.gitignore`)
5. Verify database connection via health check endpoint

**Files to Create/Modify:**
- Create: `backend/database.py`
- Create: `backend/models/db_models.py`
- Create: `.env`
- Create: `.env.example`
- Modify: `backend/main.py` — add `database.Base.metadata.create_all(bind=database.engine)` or migration step
- Modify: `backend/requirements.txt` — ensure `sqlalchemy`, `alembic`, `psycopg2-binary`, `python-dotenv` present

#### 2b. Migrate Mock Assessment Routes to DB (2-3 hours)

**Current Flow (In-Memory):**
```python
# routes.py
ASSESSMENTS = {}  # In-memory dict

@router.get("/questions")
async def get_questions():
    assessment_id = str(uuid.uuid4())
    questions = generate_round1_questions()  # Calls Ollama
    ASSESSMENTS[assessment_id] = {"round1": questions, "round2": ...}
    return AssessmentResponse(assessmentId=assessment_id, ...)

@router.post("/evaluate")
async def evaluate_question(request: EvaluateRequest):
    assessment = ASSESSMENTS[request.assessment_id]  # Dict lookup
    # Evaluate...
```

**New Flow (Database):**
```python
# routes.py with DB
@router.get("/questions", dependencies=[Depends(get_db)])
async def get_questions(db: Session = Depends(get_db)):
    assessment_id = str(uuid.uuid4())
    questions = generate_round1_questions()  # Calls Ollama (unchanged)
    
    # Store in DB
    assessment = Assessment(id=assessment_id, candidate_id="...", round=1)
    for q in questions:
        question = Question(assessment_id=assessment_id, question_no=q.number, ...)
        db.add(question)
    db.commit()
    
    return AssessmentResponse(assessmentId=assessment_id, ...)

@router.post("/evaluate")
async def evaluate_question(request: EvaluateRequest, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == request.assessment_id).first()
    # Evaluate... (unchanged logic)
    
    # Store evaluation
    evaluation = Evaluation(assessment_id=..., score=..., ...)
    db.add(evaluation)
    db.commit()
    
    return EvaluationResult(score=..., ...)
```

**Files to Modify:**
- `backend/mock_assessment/api/routes.py`
  - Import: `from database import get_db; from models.db_models import Assessment, Question, Evaluation`
  - Remove: `ASSESSMENTS = {}` in-memory dict
  - Update: `get_questions()` — create Assessment + Question records in DB
  - Update: `evaluate_question()` — fetch Assessment from DB, store Evaluation record
  - Keep: Ollama calls, evaluation logic, response shapes unchanged

- `backend/mock_assessment/services/assessment_service.py`
  - Update: `create_assessment_id()` — return UUID
  - Keep: Question generation logic, prompt building (no changes)

**Testing This Phase:**
1. Start PostgreSQL and FastAPI server
2. `GET /api/mock-assessment/questions` — verify Assessment record created in DB (`select * from assessments;`)
3. `POST /api/mock-assessment/evaluate` — verify Evaluation record created in DB
4. Restart server — verify data persists (not lost)
5. Frontend still works without changes (API contract unchanged)

#### 2c. Migrate Debugging Drill Routes to DB (1-2 hours)

**Similar process to 2b:**
- `backend/debugging_drill/api/routes.py` — add DB session dependency, store drill attempts
- Store generation and evaluation results in assessments/evaluations tables (or separate drill_attempts table if different schema needed)
- Keep Ollama service unchanged

**Files to Modify:**
- `backend/debugging_drill/api/routes.py` — add DB session, store results

#### 2d. Backend Reviewer Endpoints (1-2 hours)

**Create new reviewer API endpoint to replace mock data:**

**New Endpoint:**
```python
# backend/api/reviewer.py (new file)
@router.get("/candidates")
async def get_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "status": c.status,
            "leadName": c.lead_name,
            "attempts": len(c.assessments),  # Count assessments
            "assessments": [
                {
                    "id": a.id,
                    "round": a.round,
                    "completedAt": a.completed_at,
                    "score": avg(e.score for e in a.evaluations),
                }
                for a in c.assessments
            ]
        }
        for c in candidates
    ]

@router.get("/candidates/{candidate_id}")
async def get_candidate_details(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404)
    return {
        "id": candidate.id,
        "name": candidate.name,
        "assessments": [...],
        "evaluations": [...]
    }
```

**Files to Create/Modify:**
- Create: `backend/api/reviewer.py`
- Modify: `backend/main.py` — register reviewer routes

---

### Phase 3: Frontend Updates (1-2 hours)

**Minimal Changes Required** — API response shapes unchanged!

**Update Reviewer Dashboard:**
- `frontend/src/app/reviewer-dashboard/lib/reviewer-data.ts` — currently hardcoded mock data
- Replace with API calls: `fetch('http://localhost:8000/api/reviewer/candidates')`
- Keep UI components unchanged

**Files to Modify:**
- `frontend/src/app/reviewer-dashboard/lib/reviewer-data.ts`
- Optionally: `frontend/src/app/reviewer-dashboard/components/ReviewerShell.tsx` — add loading/error states

**Example Change:**
```typescript
// OLD (current)
export const reviewerData = {
  candidates: [
    { id: "1", name: "John Doe", email: "john@example.com", ... },
    ...
  ]
};

// NEW (after change)
export async function fetchReviewerData() {
  const response = await fetch('http://localhost:8000/api/reviewer/candidates');
  return response.json();
}
```

**Testing This Phase:**
- Load reviewer dashboard → data loads from backend API
- No assessment screens affected (no frontend changes needed)

---

### Phase 4: Testing, Deployment & Verification (2-3 hours)

#### Local Development Testing

**4a. Setup Local PostgreSQL (30 mins)**
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql
createdb karat_prep_dev

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb karat_prep_dev

# Windows (download PostgreSQL installer from postgresql.org)
# Set DATABASE_URL=postgresql://postgres:password@localhost:5432/karat_prep_dev
```

**4b. Run Migrations**
```bash
cd backend
python -m alembic upgrade head
```

Verify:
```bash
psql karat_prep_dev
\dt  # List tables
SELECT * FROM candidates;  # Empty initially
```

**4c. Integration Tests**
```bash
# Start FastAPI server
cd backend
uvicorn main:app --reload

# Test endpoints
curl http://localhost:8000/api/mock-assessment/questions

# Verify DB record created
psql karat_prep_dev -c "SELECT * FROM assessments;"

# Test evaluation
curl -X POST http://localhost:8000/api/mock-assessment/evaluate \
  -H "Content-Type: application/json" \
  -d '{"assessment_id": "...", "question_no": 1, "user_code": "..."}'

# Verify evaluation stored
psql karat_prep_dev -c "SELECT * FROM evaluations;"
```

**4d. Full End-to-End Test**
1. Start backend server with local PostgreSQL
2. Start frontend (`npm run dev`)
3. Navigate to candidate dashboard
4. Take a mock assessment (should create DB records)
5. Submit code (should create evaluation record)
6. Navigate to reviewer dashboard (should show data from DB)
7. Restart backend server → data still persists

#### Production Deployment (Choose One)

**Option A: AWS RDS PostgreSQL (Recommended for production)**
- Go to AWS RDS console → Create database (PostgreSQL)
- Get endpoint: `prod-db.xxxxx.us-east-1.rds.amazonaws.com`
- Update `.env` (or CI/CD): `DATABASE_URL=postgresql://user:pass@prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/karat_prep_prod`
- Run migrations: `alembic upgrade head`
- Deploy backend

**Option B: Supabase (Simpler, recommended for MVP)**
- Create Supabase project → PostgreSQL instance automatically created
- Get connection string from Supabase dashboard
- Same migration and deployment steps

**Option C: Railway / Render (Simpler alternative)**
- Connect GitHub repo
- Railway/Render auto-detects FastAPI, provisions PostgreSQL
- Set `DATABASE_URL` environment variable
- Auto-deploy on `git push`

**4e. Deployment Verification**
- Migrations run successfully: `alembic upgrade head` (no errors)
- Backend connects to production DB: Check logs for connection confirmation
- Assessment creation stores data: `SELECT COUNT(*) FROM assessments;` → should increase after each assessment
- Reviewer API returns production data: `curl https://prod-api.com/api/reviewer/candidates`

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repo (already done)
cd karat-prep-assistant

# 2. Setup backend environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
pip install python-dotenv  # NEW

# 4. Setup .env
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/karat_prep_dev
OLLAMA_URL=http://localhost:11434
EOF

# 5. Setup PostgreSQL
createdb karat_prep_dev

# 6. Run migrations
python -m alembic upgrade head

# 7. Start backend
uvicorn main:app --reload

# 8. In another terminal, start frontend
cd frontend
npm run dev
```

### After Code Changes

```bash
# If you modify ORM models (db_models.py):
alembic revision --autogenerate -m "Description of change"
alembic upgrade head

# If you only modify routes/services (no schema change):
# Just restart backend (--reload handles it)
```

---

## Configuration & Environment Variables

**Local Development (`.env` file, gitignore this)**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/karat_prep_dev
OLLAMA_URL=http://localhost:11434
DEBUG=True
```

**Production (Environment variables set in deployment platform)**
```
DATABASE_URL=postgresql://user:pass@prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/karat_prep_prod
OLLAMA_URL=https://ollama.prod.example.com  # or managed service
DEBUG=False
```

**Template (`.env.example`, commit to repo)**
```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/karat_prep_dev

# Ollama
OLLAMA_URL=http://localhost:11434

# Debug mode
DEBUG=True
```

---

## Verification Checklist

- [ ] **Phase 1 Complete**
  - [ ] `backend/database.py` created with SQLAlchemy engine
  - [ ] `backend/models/db_models.py` has Candidate, Assessment, Question, Evaluation models
  - [ ] Alembic migration runs: `alembic upgrade head` succeeds
  - [ ] PostgreSQL shows 4 tables: `psql -c "\dt"`

- [ ] **Phase 2 Complete**
  - [ ] `GET /api/mock-assessment/questions` creates Assessment in DB
  - [ ] `POST /api/mock-assessment/evaluate` creates Evaluation in DB
  - [ ] Data persists after server restart
  - [ ] Debugging drill endpoints also store data
  - [ ] `GET /api/reviewer/candidates` returns data from DB

- [ ] **Phase 3 Complete**
  - [ ] Reviewer dashboard loads candidates from backend API
  - [ ] No frontend assessment/drill changes needed

- [ ] **Phase 4 Complete**
  - [ ] Local PostgreSQL setup working
  - [ ] All migrations applied (`alembic upgrade head`)
  - [ ] Integration tests pass (manual or automated)
  - [ ] Production deployment platform chosen
  - [ ] Data persists across server restarts

---

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Alembic migration conflicts | Medium | Version control migrations; test locally first; document manual steps |
| Data loss during migration | High | Backup production DB before running migrations; test on staging first |
| API contract change breaks frontend | Critical | **Don't change response shapes**—keep Pydantic schemas identical; DB changes are internal only |
| Database connection timeout | Medium | Add retry logic; configure connection pooling; monitor in production |
| N+1 query problem (slow reviewer dashboard) | Low (MVP scale) | Add eager loading with `joinedload()` if needed; add indexes on foreign keys |

---

## Future Enhancements (Not Included in This Plan)

- **Authentication/Authorization** — Auth libs installed (bcrypt, passlib, python-jose) but not integrated; add JWT tokens for multi-user support
- **Caching Layer** — Redis for frequent queries (drill configs, leaderboards) if performance degrades
- **Audit Logging** — Track all candidate interactions for compliance/debugging
- **Data Export** — CSV/Excel reports for reviewers
- **Migration from JSON to DB** — Move drill configs from `drills.json` to `drill_configs` table
- **Async Database** — Upgrade to `asyncpg` for async SQLAlchemy if concurrency increases

---

## Summary

| Aspect | Details |
|--------|---------|
| **Database** | PostgreSQL (free, open-source, production-ready) |
| **ORM** | SQLAlchemy 2.0 + Alembic (already installed) |
| **Core Tables** | Candidates, Assessments, Questions, Evaluations |
| **Implementation** | 4 phases; largest is Phase 2 (backend DB integration) |
| **Frontend Impact** | Minimal—reviewer dashboard only; API contracts unchanged |
| **Timeline** | 3-4 days (40-50 hours developer time) |
| **Deployment Options** | AWS RDS (recommended), Supabase, Railway, Render, self-hosted |
| **Skill Gap** | SQLAlchemy + FastAPI dependency injection (medium difficulty) |
| **What to Start With** | Phase 1 (ORM models + schema design)—smallest scope, validates tech stack |

---

## Next Steps

1. **Refine This Plan** — Adjust scope, timeline, or deployment choice
2. **Phase 1 Kickoff** — Design ORM models, initialize Alembic
3. **Setup Local PostgreSQL** — Install and create development database
4. **Phase 2 Implementation** — Migrate routes one module at a time
5. **Integration Testing** — Verify data persistence end-to-end
6. **Production Deployment** — Choose platform, set environment variables, deploy

**Questions to answer before starting:**
- Deployment platform preference: AWS RDS, Supabase, Railway, or self-hosted?
- Should drill configs be persisted in DB (future enhancement)?
- Authentication needed for MVP or added later?
- Any existing candidate data to migrate, or starting fresh?