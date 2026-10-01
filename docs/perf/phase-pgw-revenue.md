# Phase — Payment gateway wise caching

**Date:** 2026-09-30

## Delivered

| Item | Location |
|------|----------|
| Rollup table | `db/migrations/2026-09-30-daily-pgw-revenue-stats.sql` |
| Model | `src/app/api/models/daily-pgw-revenue-stats.model.js` |
| Facts + assembly | `src/server/jobs/revenue-daily-facts.js` |
| Model entry | `RevenueModel.getReport` → `assemblePgwRevenueReport` |
| Redis job | `src/server/jobs/pgw-revenue.js` |
| Route | `GET /api/routes/pgw-revenue` — key `revenue:pgw:v1:{start}:{end}`, TTL 600s |
| Refresh | `?refresh=1` + JWT permission `see_payment_gateway_wise_report` |
| Cron | `scripts/worker.mjs` — shared nightly rollup/warm; PGW default range warmed every 30 min |
| Backfill | `pnpm run backfill:pgw-revenue [daysBack]` |

## UI

- `src/app/(dashboard)/dashboard/pgw-revenue/page.tsx` — Updated ago, Refresh; reads `json.data`

## Ops

1. Apply migration (same deploy as subscription rollup).
2. Backfill shares builder with subscription: either backfill script works for PGW table too.
3. Optional HTTP cron: `GET /api/cron/revenue-reports` with `Authorization: Bearer $CRON_SECRET`

See also [`pgw-revenue-baseline.md`](pgw-revenue-baseline.md).
