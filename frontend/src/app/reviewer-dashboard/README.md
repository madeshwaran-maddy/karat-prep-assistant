# Reviewer Dashboard

This folder is designed to be copied directly inside an existing Next.js `frontend` folder.

Example:

frontend/
├── existing screens...
└── reviewer-dashboard/
    ├── page.tsx
    ├── candidate-report/
    ├── candidate-information/
    ├── components/
    ├── data/
    ├── lib/
    └── reviewer-dashboard.module.css

## Reviewer flow

Reviewer Dashboard
  -> Candidate Report
     -> Search Candidate
     -> Candidate Search Results
     -> Candidate Detailed Report
     -> View Solution
     -> Submitted Solution

Reviewer Dashboard
  -> Candidate Information
     -> Search Candidate
     -> Load Candidate
     -> Edit Candidate Details
     -> Update Candidate

Question Management and Add Candidate are NOT included.

## Current data source

All candidate and attempt data is currently in:

`data/reviewer-data.ts`

Later, replace the functions in:

`lib/reviewer-data.ts`

with API/database calls.

## Route

If this folder is inside the Next.js `app` directory, the route is:

`/reviewer-dashboard`

For example:

`frontend/app/reviewer-dashboard/`

If your project uses a different routing structure, keep the components and pages and connect them to your existing router.

No new npm packages are required.
