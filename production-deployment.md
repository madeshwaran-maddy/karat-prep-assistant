# Production Deployment Checklist

This document describes the changes required before deploying Karat Prep Assistant to production.

## Current Status

The application is suitable for local development, but it is not production-ready yet. The main blockers are:

- Authentication is forgeable because the browser creates the `auth_token` value.
- Reviewer endpoints are not protected by reviewer authorization.
- Startup schema initialization can drop application tables.
- Mock assessment state is stored in backend memory.
- Local secrets and development settings are present in the local environment.
- Ollama and Judge0 require production service configuration, limits, and monitoring.

## Required Security Changes

### 1. Replace the current authentication

The current login flow creates a cookie similar to:

```text
auth_token=candidate-{candidate_id}
```

The backend trusts the candidate ID from that cookie. Anyone who obtains a candidate UUID can impersonate that candidate.

Implement one of these production approaches:

- Server-side sessions stored in PostgreSQL or Redis.
- Short-lived signed JWT access tokens with secure refresh handling.

The authentication cookie should be configured with:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` or `SameSite=Strict`, according to the deployment flow
- A suitable expiration time
- A production cookie name that does not expose internal implementation details

The backend must validate the session or token on every protected request. Do not rely only on frontend middleware or the presence of a cookie.

Relevant areas:

- `frontend/src/app/login/page.tsx`
- `frontend/src/components/AuthGuard.tsx`
- `frontend/middleware.ts`
- Authentication endpoints in `backend/main.py`
- Cookie checks in backend route modules

### 2. Add role-based authorization

Protect all reviewer routes with a reviewer/admin authorization dependency. At minimum, review:

- `GET /api/reviewer/candidates`
- `GET /api/reviewer/candidates/{candidate_id}`
- `GET /api/reviewer/candidates/{candidate_id}/learning-progress`
- `PUT /api/reviewer/candidates/{candidate_id}`

Also verify that candidates can only read and update their own progress and assessment data.

### 3. Protect sensitive data

- Do not return password hashes or internal database details.
- Do not expose raw exception strings to clients.
- Replace responses such as `detail=f"... {str(exc)}"` with a generic public message and a server-side log entry.
- Add rate limiting to signup, login, AI generation, evaluation, and code execution endpoints.
- Validate maximum input sizes for submitted code, analysis, prompt data, and uploaded files.
- Use HTTPS for every public request.

## Database and Persistence

### 1. Replace startup schema changes with migrations

The `ensure_schema()` function in `backend/main.py` currently performs schema creation and contains logic that can drop tables when the candidates table is missing. This must not be used as a production migration strategy.

Use Alembic migrations instead:

```powershell
Set-Location backend
venv\Scripts\Activate.ps1
alembic upgrade head
```

Recommended deployment order:

1. Back up the production database.
2. Run the reviewed Alembic migration.
3. Start the backend application.
4. Verify the database health endpoint.

Keep destructive or development-only schema repair scripts out of the production startup path.

### 2. Use managed PostgreSQL

Configure a production PostgreSQL instance with:

- A dedicated application user with least-privilege permissions
- TLS/SSL connections
- Automated backups
- Point-in-time recovery where available
- Monitoring and storage alerts
- Connection limits appropriate for the number of backend workers
- A separate staging database

Configure SQLAlchemy pool settings for the expected production traffic instead of relying only on development defaults.

### 3. Persist mock assessment state

`backend/mock_assessment/api/routes.py` contains an in-memory `ASSESSMENTS` store. This state is lost when the process restarts and is not shared between multiple workers.

Store assessment state in PostgreSQL or Redis before using multiple production workers or relying on assessment continuity.

## Environment Configuration

### Backend production environment

Set these values through the hosting provider's secret manager or environment configuration. Do not commit real values.

```env
DATABASE_URL=postgresql://app_user:strong-password@managed-db-host:5432/karat_prep_assistant
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5-coder:3b
OLLAMA_TIMEOUT_SECONDS=90
OLLAMA_NUM_PREDICT=512
ALLOWED_ORIGINS=https://app.example.com
```

Do not enable `DEBUG=True` in production.

The local `backend/.env` contains development credentials and must not be copied into a production image. Rotate the database password if it has been shared or exposed.

### Frontend production environment

```env
BACKEND_INTERNAL_URL=http://backend:8000
```

Use the internal backend hostname when the frontend and backend share a private network. If they are deployed separately, use the private or secured backend URL supplied by the hosting platform.

The existing rewrite configuration in `frontend/next.config.ts` uses `BACKEND_INTERNAL_URL` for server-side API forwarding.

## Backend Runtime

Run the backend without development reload:

```powershell
Set-Location backend
venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, place FastAPI behind an HTTPS reverse proxy or cloud load balancer. Configure:

- TLS certificate and automatic renewal
- Health checks
- Request and upstream timeouts
- Access logs
- Error logs
- Graceful shutdown
- Restart policy
- Resource limits

Use multiple workers only after all process-local state has been removed or moved to shared storage.

## Ollama and AI Services

Ollama is currently expected to be available as a local service. For production:

- Deploy Ollama on a dedicated machine or container with sufficient RAM/GPU capacity.
- Keep Ollama private; do not expose it directly to the public internet.
- Pull and pin the configured model before starting the backend.
- Monitor model availability and generation latency.
- Set request timeouts and concurrency limits.
- Decide how the application behaves when Ollama is unavailable.
- Add usage limits so one user cannot exhaust the AI service.

The backend should report database health and Ollama health separately.

## Judge0 and Code Execution

The Judge0 integration executes submitted code through an external service. Before production:

- Use an authenticated, trusted Judge0 endpoint.
- Configure execution time, memory, output, and queue limits.
- Confirm the service provides sandboxing and network restrictions.
- Avoid exposing Judge0 credentials to browser code.
- Keep the Next.js route as the server-side boundary for the Judge0 request.
- Handle service timeouts and unavailable results cleanly.
- Add abuse prevention and per-user quotas.

## Logging and Monitoring

Replace ad-hoc `print()` statements with structured application logging. Logs should include:

- Timestamp
- Request or correlation ID
- Route and HTTP method
- Response status
- Duration
- Safe user or assessment identifiers where appropriate
- Exception stack traces on the server only

Add monitoring for:

- Frontend availability
- Backend availability
- Database connectivity
- Ollama availability
- Judge0 failures and latency
- Authentication failures
- Error rates
- Slow requests
- Database storage and connection usage

Do not log passwords, tokens, database URLs, or submitted code unless there is a documented and protected debugging requirement.

## Deployment Architecture

A suitable initial architecture is:

```text
Browser
  |
HTTPS reverse proxy or load balancer
  |
Next.js frontend
  |
Private network rewrite
  |
FastAPI backend
  |              |
PostgreSQL       Ollama service

Next.js server route
  |
Authenticated Judge0 service
```

The database, Ollama, and backend should not be directly exposed to the public internet unless required and properly secured.

## Release Sequence

1. Implement signed or server-side authentication.
2. Add backend authorization dependencies for candidate and reviewer roles.
3. Replace `ensure_schema()` startup changes with reviewed Alembic migrations.
4. Move mock assessment state to PostgreSQL or Redis.
5. Remove development credentials and disable debug mode.
6. Configure production environment variables and CORS origins.
7. Deploy managed PostgreSQL and verify backups.
8. Deploy Ollama privately and verify the configured model.
9. Configure Judge0 authentication, sandboxing, quotas, and timeouts.
10. Add structured logs, health checks, monitoring, and alerts.
11. Configure HTTPS and the reverse proxy/load balancer.
12. Deploy the backend without `--reload`.
13. Deploy the frontend using the production build.
14. Run the staging verification checklist.
15. Take a database backup and perform the production rollout.

## Verification Checklist

### Frontend

```powershell
Set-Location frontend
npm ci
npm run lint
npm run build
npm run start
```

### Backend

```powershell
Set-Location backend
venv\Scripts\Activate.ps1
python -m pytest
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Endpoints

Verify from the deployment network:

```powershell
Invoke-WebRequest https://api.example.com/ping
Invoke-WebRequest https://api.example.com/api/health/db
```

Also verify that:

- Unauthenticated users cannot access candidate or reviewer data.
- Candidates cannot access reviewer routes.
- Candidates cannot access another candidate's progress.
- Login creates a secure server-validated session.
- Logout invalidates the session on the backend.
- Assessment state survives a backend restart.
- Assessment state works with more than one backend worker.
- Ollama failures return controlled errors.
- Judge0 timeouts do not leave requests running indefinitely.
- Database backups can be restored in staging.

## Minimum Production Gate

Do not release to real users until these four items are complete:

1. Authentication is no longer based on a client-created candidate ID.
2. Reviewer APIs enforce role-based authorization.
3. Production startup cannot drop or rebuild application tables.
4. Assessment state is stored in shared persistent storage.
