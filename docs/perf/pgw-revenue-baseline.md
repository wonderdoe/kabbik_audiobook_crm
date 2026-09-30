# Payment gateway wise report — baseline / parity

**Date:** 2026-09-30

## Previous behavior

- `getReport` executed a large legacy UNION query (discarded), then `newQuery` on `user_subscription_payment_log` for the full date range grouped by `payment_method`, `is_recurring`.
- Subscriber counts from `rent_payment` CASE sums; amounts mapped through `getData()` (labels, images, BL/ROBI/GP percentages).
- Response: **array** of `{ payment_source, image, total_amount, new_subscribers, old_subscribers }`.

## New behavior

- Per-day facts → `daily_pgw_revenue_stats` (raw totals + subscriber counts).
- Range: sum rollup rows by `(payment_method, is_recurring)`; today live; then `mapPgwPaymentRow` / `getData()` equivalent.
- Legacy UNION removed.
- API: `{ updatedAt, startDate, endDate, data: [...] }` — UI uses `data ??` root array for compat.

## Parity checks

1. Default **today–today**: compare array length, `total_amount`, and subscriber fields vs pre-change API for same date.
2. 7-day range: aggregate should match old single range query (within rounding).
3. Yesterday rollup: `buildDailyRevenueFacts(yesterday)` vs live recompute for that day.

## Notes

- PGW shares payment-log scan with subscription facts in `buildDailyRevenueFacts` (one pass per day).
- Max range: 366 days.
