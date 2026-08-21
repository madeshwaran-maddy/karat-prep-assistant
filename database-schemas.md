# Karat Prep Assistant Database Schema

The following PostgreSQL script creates all application tables currently used by the backend. Run it after creating the database configured in `backend/.env`.

```sql
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    language_selected VARCHAR(255),
    mock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255),
    status VARCHAR(50),
    role VARCHAR(50),
    lead_name VARCHAR(255),
    start_date DATE,
    karat_prep_timeline VARCHAR(255),
    karat_assessment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    interviewer_name VARCHAR(255),
    attempt_no INTEGER NOT NULL,
    round INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    question_no INTEGER NOT NULL,
    topic VARCHAR(255),
    subtopic VARCHAR(255),
    difficulty VARCHAR(50) DEFAULT 'medium',
    description TEXT DEFAULT '',
    code TEXT,
    source VARCHAR(50) DEFAULT 'excel',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    user_code TEXT,
    user_analysis TEXT,
    score INTEGER,
    correct BOOLEAN,
    explanation TEXT,
    suggestions TEXT,
    corrected_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concept_progress (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    concept_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (candidate_id, concept_id)
);

CREATE TABLE IF NOT EXISTS practice_question_progress (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    language_selected VARCHAR(255),
    section VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    question_no INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (candidate_id, section, topic_id, question_no)
);

CREATE TABLE IF NOT EXISTS learning_overview (
    id BIGSERIAL PRIMARY KEY,
    language VARCHAR(50) NOT NULL,
    round_no SMALLINT NOT NULL CHECK (round_no IN (1, 2)),
    screen VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255) NOT NULL,
    question_no INTEGER NULL,
    UNIQUE (
        language,
        round_no,
        screen,
        topic,
        subtopic,
        question_no
    )
);



CREATE UNIQUE INDEX IF NOT EXISTS uq_evaluations_question_id
    ON evaluations (question_id);

CREATE INDEX IF NOT EXISTS idx_concept_progress_candidate
    ON concept_progress (candidate_id);

CREATE INDEX IF NOT EXISTS idx_practice_progress_candidate
    ON practice_question_progress (candidate_id);
```
# Notes
Create a table called as learning_content_overview , and make sure all the content in json needs to be transferred here like below.

The table should hold data's Concept and Practice Question Screen from Round 1
and 
Format and Practice Question Screen from Round 2

```sql
INSERT INTO learning_overview
    (language, round_no, screen, topic, subtopic, question_no)
VALUES
    ('Java', 1, 'Concepts', 'Collections', 'collections-foundations', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'list', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'set', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'map', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'hashmap', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'linkedhashmap', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'queue-deque', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'sorting-comparison', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'iterators', NULL),
    ('Java', 1, 'Concepts', 'Collections', 'specialized-collections', NULL),

    ('Java', 1, 'Concepts', 'Exception Handling', 'exception-handling', NULL),
    ('Java', 1, 'Concepts', 'Exception Handling', 'exception-control-flow', NULL),
    ('Java', 1, 'Concepts', 'Exception Handling', 'custom-exceptions', NULL),
    ('Java', 1, 'Concepts', 'Exception Handling', 'try-with-resources', NULL),
    ('Java', 1, 'Concepts', 'Exception Handling', 'production-exception-design', NULL),

    ('Java', 1, 'Concepts', 'Multithreading', 'thread-basics', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'memory-model', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'race-condition', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'volatile', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'locks-atomics', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'deadlock', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'producer-consumer', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'concurrent-collections', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'executors-futures', NULL),
    ('Java', 1, 'Concepts', 'Multithreading', 'interruption-cancellation', NULL);

INSERT INTO learning_overview
    (language, round_no, screen, topic, subtopic, question_no)
SELECT
    'Java',
    1,
    'Practice Question',
    question_groups.topic,
    question_groups.subtopic,
    question_numbers.question_no
FROM (
    VALUES
        ('equalsAndHashCode', 'equals', 6),
        ('equalsAndHashCode', 'hashcode', 6),
        ('equalsAndHashCode', 'comparator', 8),

        ('collections', 'list', 9),
        ('collections', 'set', 8),
        ('collections', 'map', 9),
        ('collections', 'hashmap', 7),
        ('collections', 'linkedhashmap', 6),
        ('collections', 'concurrent-iteration', 6),
        ('collections', 'collections-framework', 4),
        ('collections', 'queue-deque', 4),
        ('collections', 'specialized-collections', 4),

        ('exceptions', 'exception', 10),
        ('exceptions', 'customException', 8),
        ('exceptions', 'tryWithResources', 8),
        ('exceptions', 'exception-control-flow', 8),
        ('exceptions', 'production-exception-design', 6),

        ('multithreading', 'thread-basics', 6),
        ('multithreading', 'race-condition', 6),
        ('multithreading', 'volatile', 6),
        ('multithreading', 'deadlock', 6),
        ('multithreading', 'producer-consumer', 6),
        ('multithreading', 'concurrent-collections', 6),
        ('multithreading', 'memory-model', 6),
        ('multithreading', 'locks-atomics', 6),
        ('multithreading', 'executors-futures', 6),
        ('multithreading', 'interruption-cancellation', 6)
) AS question_groups(topic, subtopic, question_count)
CROSS JOIN LATERAL generate_series(
    1,
    question_groups.question_count
) AS question_numbers(question_no);

INSERT INTO learning_overview
    (language, round_no, screen, topic, subtopic, question_no)
VALUES
    ('Node', 1, 'Concepts', 'Node.js', 'nodejs-fundamentals', NULL),
    ('Node', 1, 'Concepts', 'Node.js', 'nodejs-modules-npm', NULL),
    ('Node', 1, 'Concepts', 'Node.js', 'nodejs-async-programming', NULL);

INSERT INTO learning_overview
    (language, round_no, screen, topic, subtopic, question_no)
VALUES
    ('Node', 1, 'Practice Question', 'Node.js Fundamentals', 'event-loop-and-async', 1),
    ('Node', 1, 'Practice Question', 'Node.js Fundamentals', 'event-loop-and-async', 2),
    ('Node', 1, 'Practice Question', 'Node.js Fundamentals', 'event-loop-and-async', 3);
```


## Run the script

Copy the SQL block above into `psql`, pgAdmin, or another PostgreSQL client. From PowerShell, you can connect using the database configured in `DATABASE_URL`:

```powershell
psql "$env:DATABASE_URL"
```

If `DATABASE_URL` is not set in the current terminal, provide the connection details directly:

```powershell
psql -U karat_user -d karat_prep_assistant
```

Then paste the SQL block into the prompt and press `Enter` after the final semicolon.

The FastAPI backend also runs these `CREATE TABLE IF NOT EXISTS` statements automatically during startup.
