# Snap Suite — Project Document

_Last updated: 2026-02-17_

## 1) Project Overview
Snap Suite is a wedding photography/videography workflow management platform with role-based dashboards, project/event/task management, team collaboration, and invitation workflows.

## 2) System Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL (Django ORM models + migrations)
- **Auth**: DRF token auth + allauth/dj-rest-auth integration

## 3) Repository Layout
- `src/` — frontend app, pages, components, auth and API client
- `backend/` — Django project (`config`) and application (`api`)
- `supabase/` — SQL migrations and edge function(s)
- `docs/` — project documentation (this file)

## 4) Current Quality Baseline (Initial Audit)
### Strengths
- Modern FE stack and modular route structure.
- API layer and role-aware protected routes are in place.
- Backend models cover core product domain entities.

### Current Risks / Gaps
- Frontend lint debt (multiple `no-explicit-any` and hook dependency warnings).
- TypeScript strictness is intentionally relaxed.
- Backend automated tests are minimal/placeholder.
- Some runtime/config risks in backend settings and dependencies.

## 5) Targeted Quality Uplift Plan

### Phase 1 — Quality Gates & Safety (Priority: High)
1. Make `npm run lint` pass for high-impact modules (auth + dashboard + tasks).
2. Add backend smoke tests for auth and core CRUD permissions.
3. Ensure `python manage.py check` passes in local dev environment.

**Definition of Done**
- Lint errors reduced to 0 for touched modules.
- At least one backend test suite runs in CI/local.
- Django system check runs without missing dependency failures.

### Phase 2 — Type & API Reliability (Priority: High)
1. Replace `any` in shared API/client and auth boundaries with typed interfaces.
2. Introduce shared API DTO types for `Project`, `Event`, `Task`, `TeamMember`.
3. Add request/response error normalization.

**Definition of Done**
- Shared API helpers are fully typed.
- No `any` in common data paths.
- Better UI error behavior for API failures.

### Phase 3 — Security & Config Hardening (Priority: High)
1. Move secrets and environment-specific values to `.env` conventions.
2. Restrict permissive defaults (`DEBUG`, CORS, hosts) by environment.
3. Remove hardcoded localhost URLs in frontend/backend invitation paths.

**Definition of Done**
- No hardcoded secrets/localhost assumptions in production config.
- Local/dev/prod environment behavior documented.

### Phase 4 — Test Coverage & Maintainability (Priority: Medium)
1. Add frontend component/integration tests for critical flows.
2. Add API tests for team invitation lifecycle and access control.
3. Document architectural decisions and coding standards.

**Definition of Done**
- Critical user journeys have automated tests.
- Core backend endpoints have permission and behavior tests.

## 6) Working Agreement for Ongoing Documentation
From this point onward:
1. Every meaningful change should include a short entry in **Section 7 (Change Log)**.
2. Entries should capture **what changed**, **why**, and **how it was validated**.
3. If a change introduces risk/debt, it must include follow-up action items.

## 7) Project Change Log

| Date | Area | Change Summary | Validation | Owner |
|------|------|----------------|------------|-------|
| 2026-02-17 | Documentation | Created baseline project document and initial targeted quality uplift plan. | Manual review | AI agent |
| 2026-02-17 | Phase 1 Quality Gates | Implemented targeted frontend lint/type cleanup for auth/dashboard/tasks modules, added backend smoke tests for login and project permissions, and added missing `PyJWT` dependency to unblock Django checks. | `npx eslint ...`, `python3 -m pytest -q`, `python3 manage.py check` | AI agent |

## 8) Open Questions
1. Which deployment environments are currently active (dev/staging/prod)?
2. What CI provider and required checks should be enforced?
3. Should we standardize on Django token auth, JWT, or session-based auth for future roadmap?

## 9) Next Actionable Step
Start with **Phase 1** and execute in this order:
1. Resolve top lint errors in auth + dashboard files.
2. Add minimal backend tests for login + project listing permissions.
3. Fix backend dependency/config issue(s) blocking `manage.py check`.
