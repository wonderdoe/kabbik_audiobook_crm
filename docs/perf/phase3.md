# Phase 3 — Daily rollup & home snapshot

**Date:** 2026-09-30

## Changes

| Item | Path |
|---|---|
| Rollup table migration | `db/migrations/2026-09-30-daily-payment-stats.sql` (applied on staging) |
| Rollup model | `src/app/api/models/daily-payment-stats.model.js` |
| Snapshot builder | `src/server/jobs/dashboard.js` — `buildHomeSnapshot`, `buildDailyPaymentRollup` |
| Combined API | `GET /api/routes/dashboard-summary` (Redis `dash:home`, TTL 600s) |
| Backfill script | `scripts/backfill-daily-payments.js` |
| Home UI | Single fetch; “Updated … ago” + Refresh (`?refresh=1`, requires `dashboard` permission) |

## Backfill (optional)

```bash
node scripts/backfill-daily-payments.js 90
```

## Timings

| Endpoint | Notes |
|---|---|
| `GET /api/routes/dashboard-summary` | One HTTP call replaces 4 parallel home calls |
| Redis hit | Sub-second (after warm snapshot) |

Record curl/DevTools numbers after deploy:

| Metric | Value |
|---|---|
| Cold snapshot build | ___ ms |
| Cached snapshot | ___ ms |

## Verification

- [x] Home page uses one API request
- [x] Response includes `updatedAt`, `dashboardData`, `recentTotalPayments`, `topMostUsedPromos`
- [x] Past days read `daily_payment_stats`; anchor day uses live payment query
- [ ] Rollup for yesterday matches live sum (run after cron Phase 4 or manual `buildDailyPaymentRollup`)
