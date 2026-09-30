# Phase — Subscription revenue caching

**Date:** 2026-09-30

## Delivered

| Item | Location |
|------|----------|
| Rollup table | `db/migrations/2026-09-30-daily-subscription-revenue-stats.sql` |
| Model | `src/app/api/models/daily-subscription-revenue-stats.model.js` |
| Facts + assembly | `src/server/jobs/revenue-daily-facts.js` |
| Model entry | `RevenueModel.getRevenueReport` → `assembleSubscriptionRevenueReport` |
| Redis job | `src/server/jobs/subscription-revenue.js` |
| Route | `GET /api/routes/revenue` — key `revenue:sub:v1:{start}:{end}`, TTL 600s |
| Refresh | `?refresh=1` + JWT permission `see_subscription_revenue_report` |
| Cron | `scripts/worker.js` — daily rollup 00:10 + warm, revenue refresh every 5 min; see `cache-warm.js` |
| Backfill | `pnpm run backfill:subscription-revenue [daysBack]` |

## UI

- `src/app/(dashboard)/dashboard/revenue/page.tsx` — Updated ago, Refresh

## Ops

1. Apply migration on MySQL.
2. Off-peak: `pnpm run backfill:subscription-revenue 90`
3. Run `pnpm run worker` beside Next (pm2/systemd).

See also [`subscription-revenue-baseline.md`](subscription-revenue-baseline.md).
