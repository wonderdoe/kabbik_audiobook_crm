# Cache worker ops checklist

Intermittent dashboard slowness usually means Redis miss or worker not warming.

## Process

```bash
pm2 status crm-worker
pm2 logs crm-worker --lines 100
pnpm run verify:worker-imports   # after deploy, before restart — catches missing job modules
```

Expect every **15 minutes** (Asia/Dhaka):

- `[cron:scheduled-warm] ok` — sequential: **home → revenue → rent revenue page** (no user-report SQL)
- Phase logs: `phase home`, `phase revenue`, `phase rent-report`
- At **00:00** only: `midnight tick: home only` (rollup at **00:10** warms secondary report caches)
- `warm:home:last_ok`, `warm:revenue-warm:last_ok` updated during the pipeline

At **02:00** daily: `[cron:daywise-promo-cache-warm] ok` — **daywise promo** default range (`warmDaywisePromoCache`). Daywise API is cache-only; manual: `node scripts/warm-daywise-promo-cache.mjs`.

At **03:00** daily: `[cron:user-report-daily] ok` — heavy **user-report** warm only (`warmUserReport`). Redis logical TTL **25h** (`USER_REPORT_TTL`). Snapshot API serves cache only (no on-demand SQL).

At **00:10** daily: `[cron:rollup-and-warm] ok` (daily rollups + `warmSecondaryReportCaches` — signup, play, rent, package-wise; not daywise)

Startup: `warmSecondaryReportCaches` + `warmDaywisePromoCache`. Manual: `node scripts/backfill-daily-package-revenue.mjs` after migration.

After pulling worker-related changes on the app host:

```bash
cd /opt/kabbik-services/kabbik_audiobook_crm
git pull
pnpm run verify:worker-imports
pm2 restart crm-worker
```

Package-wise: `redis-cli TTL report:pkg-wise:v1:YYYY-MM-01:YYYY-MM-DD` (MTD key), `GET warm:package-wise:last_ok`. See [package-wise-baseline.md](./package-wise-baseline.md).

Bad signs: `redis unavailable`, `skipped (lock held)` every tick, repeated `failed`.

## Env parity (Next app vs worker)

Both must load the same `.env` (worker uses `scripts/load-env.mjs`):

| Variable | Notes |
|----------|--------|
| `REDIS_ENV` | `production` vs `staging` picks different host/db |
| `CACHE_ENABLED` | Must not be `false` |
| `REDIS_*` / `REDIS_STAGING_*` | Same values on app and worker hosts |

Quick check:

```bash
node scripts/check-cache-env.mjs
```

User-report SQL validation (before switching `USER_REPORT_ACTIVE_SOURCE`):

```bash
node scripts/validate-user-report-metrics.mjs
```

See [user-report-baseline.md](./user-report-baseline.md). After deploy, expect `[user-report] …ms` step logs during warm and `warmUserReport ok` within a few minutes once indexes exist.

## Redis keys

```bash
redis-cli TTL dash:home
redis-cli GET worker:heartbeat
redis-cli GET warm:home:last_ok
redis-cli GET warm:revenue-warm:last_ok
redis-cli GET warm:scheduled-warm:last_ok
redis-cli GET warm:user-report-daily:last_ok
redis-cli TTL report:user-report:v1:YYYY-MM-DD
redis-cli TTL report:rent-revenue:v1:YYYY-MM-01:YYYY-MM-DD:10:0
```

- `dash:home` TTL should stay near **86400** (hard retention); logical freshness is **60 min** inside the payload.
- `worker:heartbeat` updates every **60s** while worker runs (TTL **120s**).

HTTP: `GET /api/routes/cache-health`

## Server timezone

Worker cron uses **Asia/Dhaka** explicitly. Default cache date ranges use Dhaka via `src/server/utils/dhaka-date.js` — host TZ does not need to match, but logs are easier to read if TZ is documented.

## Debug cache hits

Set `CACHE_LOG_HITS=1` on the Next app to log `[cache] HIT|MISS|STALE` per key.
