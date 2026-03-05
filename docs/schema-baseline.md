# Database Schema Baseline

This document defines the current schema stabilization workflow for Persona Vault.

## Goal

- Reduce environment drift between local/staging/production.
- Avoid runtime failures caused by missing columns/indexes/collation mismatch.
- Provide explicit maintenance endpoints for schema migrations and health checks.

## Endpoints

### 1) Schema health check

- Endpoint: `GET /vault/api/schema_health.php`
- Auth: admin token required.
- Purpose: report schema drift (missing tables/columns/indexes + collation warnings).

Example response fields:
- `success`
- `status`
- `summary.errors`
- `summary.warnings`
- `issues[]`

### 2) Baseline migration

- Endpoint: `POST /vault/api/migrate_schema_baseline.php`
- Auth: admin token required.
- Guard: `ALLOW_MAINTENANCE=1` must be set in backend env.

Optional request body:

```json
{ "dry_run": true }
```

When `dry_run` is true, no ALTER/CREATE statements are executed and the endpoint returns planned actions.

## Baseline tasks currently enforced

- Table collation conversion to `utf8mb4_unicode_ci` for core app tables.
- `persona_revisions`: ensure `user_id`, `workspace_id` + core indexes.
- `prompt_revisions`: ensure `user_id`, `workspace_id` + core indexes.
- `personas`/`prompts`/`collections`: ensure workspace/user indexes.

## Safe rollout procedure

1. Set `ALLOW_MAINTENANCE=1` temporarily.
2. Run `POST /vault/api/migrate_schema_baseline.php` with `{ "dry_run": true }`.
3. Review planned actions.
4. Run again without `dry_run` to apply.
5. Run `GET /vault/api/schema_health.php` and verify no errors.
6. Set `ALLOW_MAINTENANCE=0` again.

