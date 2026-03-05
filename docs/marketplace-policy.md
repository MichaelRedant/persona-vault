# Marketplace Policy and Validation Rules

This document defines the current marketplace behavior for Persona Vault and acts as a reference for backend/frontend changes.

## 1. Scope and Ownership

- Every listing is scoped to a `workspace_id`.
- Non-admin users can only create/update/delete listings they own (`seller_user_id`).
- Source item ownership is enforced on create:
  - `persona` -> `personas.user_id`
  - `prompt` -> `prompts.user_id`
  - `bundle` -> `collections.user_id`
  - `asset` -> `files.uploader_user_id`
- Listing updates/deletes are only allowed inside the current workspace.

## 2. Visibility and Status

Allowed `visibility` values:
- `public`
- `unlisted`
- `private`

Allowed `status` values:
- `active`
- `paused`
- `flagged`
- `removed`

Search behavior:
- Public/anonymous users only see `active + public`.
- Admin users can filter by status/visibility.

## 3. Field Validation

- `title`: required, max 255 chars.
- `description`: max 5000 chars.
- `tags`: max 500 chars.
- `price_cents`: integer >= 0.
- `currency`: 3 uppercase letters (`EUR`, `USD`, ...).
- `cover_file_id`: numeric positive id or null.

## 4. Reporting and Moderation

Reporting:
- User cannot report own listing.
- Duplicate open reports from same user for same listing are rate-limited (24h).
- Report reasons are restricted to allowed values in backend validation.

Moderation:
- Only workspace admins/global admins can resolve listing reports.
- Report status transitions are validated server-side.
- Moderation can optionally update listing status.

## 5. Lifecycle Auditability

All important listing lifecycle actions are logged in `marketplace_listing_events`:
- `created`
- `updated`
- `deleted`
- `reported`
- `report_resolved`

Each event stores:
- `listing_id`
- `workspace_id`
- `actor_user_id` (nullable)
- `event_type`
- `payload_json`
- `created_at`

Frontend detail modal reads this history through `marketplace/listings_events_get.php`.

## 6. API Endpoints (Marketplace)

- `listings_create.php`
- `listings_update.php`
- `listings_delete.php`
- `listings_search.php`
- `listings_report.php`
- `listings_reports_get.php`
- `listings_reports_resolve.php`
- `listings_events_get.php`

## 7. Non-Goals (Current Version)

- No paid checkout/settlement flow.
- No public unauthenticated listing event history.
- No hard SLA around retention/archiving of lifecycle events yet.
