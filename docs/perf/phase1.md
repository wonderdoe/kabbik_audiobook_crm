# Phase 1 — Quick wins

**Date:** 2026-09-30

## Changes

| Step | Done |
|---|---|
| 1.1 Fix relative `fetch('api/...')` | `dashboard/page.tsx`, `TopListners.tsx` |
| 1.2 `GET /api/routes/payments-week` | Batches 7 days (parallel `getSingleDayTotalPayment` server-side) |
| 1.3 Home page `Promise.all` | 4 parallel requests: total-user, payments-week, 2× promos |
| 1.4 Rewards indexes | Migration file only — **not applied** (see below) |
| 1.5 Summary query | `users` join only when `search` filter present |
| 1.6 Tier join | Latest `tier_user_current_tier` row per user (`ORDER BY id DESC LIMIT 1`) |

## Timings (curl @ localhost:8090, staging DB)

| Scenario | Approx |
|---|---|
| Phase 0 dashboard (10 serial API calls) | ~85,700 ms summed |
| Phase 1 dashboard (4 parallel API calls) | wall ~max of 4 (dominated by total-user + payments-week) |

Re-measure in DevTools after deploy; payments-week runs 7 payment queries in **parallel** on the server (one HTTP round-trip).

## Index migration

Apply when ready:

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_DATABASE" \
  < db/migrations/2026-09-30-rewards-indexes.sql
```

Then re-run EXPLAIN from [baseline-explain.md](./baseline-explain.md) and append results here.

## Verification

- [x] No `fetch('api/` without leading `/` in `src/`
- [x] Home uses 4 client requests instead of ~10 serial
- [ ] Index migration applied on DB (pending operator)
- [x] Rewards summary EXPLAIN without search: single table scan on `c` only (no `users` join)
