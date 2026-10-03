# User report — metrics baseline and validation

## Cards vs data sources

| UI card | API / builder | Meaning |
|---------|---------------|---------|
| Lifetime Subscribers | `usercount` | `COUNT(DISTINCT user_id)` on `user_subscription_payment_log` (non-BL filters) |
| Active Subscribed Users | `getSubcribedUser` | Latest payment log row per user (`from_banglalink = 0`), count `is_subscribed = 1` |
| Banglalink active | `blUserCount` | Latest log row per user (`from_banglalink = 1`) |
| Rent toggles | `getRentCount` ×4 | Single scan in `queryRentCountAllVariants()` |

BL segmentation on the report uses **`user_subscription_payment_log.from_banglalink`**, not `users.from_banglalink` (unused in CRM code). Sign-up reports use `users.client_id` — a different rule.

## Validation command

```bash
node scripts/validate-user-report-metrics.mjs
```

Compares:

1. **legacy_window** — original `ROW_NUMBER()` SQL (baseline)
2. **optimized_log** — `MAX(created_at)` latest-per-user join (default production path)
3. **users** — `users.is_subscribed = 1` with `client_id` BL heuristic + small log join for `is_recurring`

## Acceptance (suggested)

- **Path A (log):** optimized totals within **0.5%** of legacy window for both Kabbik and BL segments.
- **Path B (users):** optional only if within **0.5%** of legacy and product signs off on `client_id` BL definition.

## Runtime switch

| Env | Behavior |
|-----|----------|
| `USER_REPORT_ACTIVE_SOURCE=log` (default) | Optimized payment-log latest-per-user |
| `USER_REPORT_ACTIVE_SOURCE=users` | Users-based active counts |

Set the same value on **Next app** and **worker** (`scripts/load-env.mjs`).

## Refresh schedule

- Worker cron **03:30 Asia/Dhaka** runs `warmUserReport` (only time heavy SQL runs for this page).
- `/api/routes/user-report-snapshot` returns **503** if Redis has no snapshot (no cold populate on page load).

## Recorded decision

| Date | Owner | Path | Notes |
|------|-------|------|-------|
| 2026-10-03 | CRM | log | Active query dedupes latest row via `ROW_NUMBER` + `sub_request_id` on `created_at` ties; validate script checks active ≤ lifetime |

## Active vs lifetime invariant

Snapshot **Active Subscribers** (Kabbik) should be **≤** **Lifetime Subscribers**. If not, run `node scripts/validate-user-report-metrics.mjs` and check `created_at tie groups` plus `USER_REPORT_ACTIVE_SOURCE`.

## Indexes

Apply after staging `EXPLAIN`:

```bash
mysql ... < db/migrations/2026-10-02-user-report-indexes.sql
```

See migration file comments for column order rationale.
