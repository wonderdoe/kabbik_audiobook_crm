# Subscription revenue report — baseline / parity

**Date:** 2026-09-30

## Previous behavior

- `getRevenueReport` ran range queries on `user_subscription_payment_log` (kabbik/mybl) and `store_log` (course) with `BETWEEN start AND end+1 day`.
- Response: `{ mybl, kabbik, course }` — each keyed by `YYYY-MM-DD`, values are nested gateway totals.
- Kabbik segment applies BL 50%, ROBI 49%, GP 70% in JavaScript after SQL sums.

## New behavior

- Per-day facts → `daily_subscription_revenue_stats` (raw totals).
- Range assembly: rollup for past days; **today** always recomputed live; missing rollup days backfilled on read.
- Same nested shape and percentage rules in `assembleSubscriptionRevenueReport`.
- API adds `updatedAt`, `startDate`, `endDate` (UI ignores extra fields for chart data).

## Parity checks

Run on staging after migration + optional backfill:

1. Pick a 7-day window ending yesterday (no “today” drift): compare old branch vs new `assembleSubscriptionRevenueReport` totals per date/gateway.
2. Single day yesterday: `buildDailyRevenueFacts(day)` then read rollup vs live single-day query — row counts and `raw_total` sums should match.
3. Today: live slice only; changing a payment should reflect on next `?refresh=1`.

## Notes

- Dead `myblQuery` removed; mybl uses same payment log filters as kabbik with `platform = 'MyBl'`.
- Max range: 366 days (`validateReportRange`).
