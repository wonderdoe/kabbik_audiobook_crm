# Package-wise report — baseline

**Response shape:** `{ list: [{ name, total }], total, updatedAt?, startDate?, endDate? }`

## Data sources

Legacy: single `UNION ALL` over payment tables in [`revenue-model.js`](../src/app/api/models/revenue-model.js) (`getPackageWiseRevenue`).

New (default): daily rows in `daily_package_revenue_stats` + live `queryPackageWiseDay` for today (Dhaka), assembled in [`package-wise-report.js`](../src/server/jobs/package-wise-report.js).

Set `PACKAGE_WISE_LEGACY=1` to force legacy SQL.

## Date rules

- Max range: **366 days** (`validateReportRange` from subscription revenue).
- Timezone: **Asia/Dhaka** for day boundaries.

## Commands

```bash
node scripts/benchmark-package-wise.mjs
node scripts/compare-package-wise-parity.mjs
node scripts/backfill-daily-package-revenue.mjs 90
```

## Parity

Totals should match legacy within **±1** per package line (rounding). Record results in deploy notes before removing legacy flag.

## Cache

- Key: `report:pkg-wise:v1:{startDate}:{endDate}`
- TTL: 30 min if `endDate >= today`, else 24 h
- Worker warms **month-start → today** after rollup
