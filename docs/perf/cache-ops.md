# Cache worker ops checklist

Intermittent dashboard slowness usually means Redis miss or worker not warming.

## Process

```bash
pm2 status crm-worker
pm2 logs crm-worker --lines 100
```

Expect every **15 minutes** (Asia/Dhaka):

- `[cron:home] ok`
- `[cron:revenue-warm] ok` (skipped at **00:00** only; `rollup-and-warm` at **00:10** warms all)

At **00:10** daily: `[cron:rollup-and-warm] ok`

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

## Redis keys

```bash
redis-cli TTL dash:home
redis-cli GET worker:heartbeat
redis-cli GET warm:home:last_ok
redis-cli GET warm:revenue-warm:last_ok
```

- `dash:home` TTL should stay near **86400** (hard retention); logical freshness is **60 min** inside the payload.
- `worker:heartbeat` updates every **60s** while worker runs (TTL **120s**).

HTTP: `GET /api/routes/cache-health`

## Server timezone

Worker cron uses **Asia/Dhaka** explicitly. Default cache date ranges use Dhaka via `src/server/utils/dhaka-date.js` — host TZ does not need to match, but logs are easier to read if TZ is documented.

## Debug cache hits

Set `CACHE_LOG_HITS=1` on the Next app to log `[cache] HIT|MISS|STALE` per key.
