# Phase 2 — Redis foundation

**Date:** 2026-09-30

## Added

- Dependency: `ioredis`
- [`src/server/config/redis.js`](../src/server/config/redis.js) — singleton client; `REDIS_ENV=staging|production`
- [`src/server/cache/index.js`](../src/server/cache/index.js) — `cacheGet`, `cacheSet`, `getOrSet`, `getOrSetLocked` (fail-open)
- [`.env.example`](../.env.example) — Redis, `CACHE_ENABLED`, `CRON_SECRET`

## Key conventions (for later phases)

| Purpose | Key | TTL |
|---|---|---|
| Home snapshot | `dash:home` | 3600 s (60 min) |
| Past-day payments | `dash:payments:YYYY-MM-DD` | 86400 s |
| Rewards filters | `rewards:filters` | 1200 s |
| Rewards summary | `rewards:summary:v{version}:{filterHash}` | 60 s |
| Rewards count | `rewards:count:v{version}:{filterHash}` | 60 s |
| Rewards list | `rewards:list:v{version}:{filterHash}:{page}:{pageSize}` | 15–30 s |
| Rewards version | `rewards:version` | no TTL |
| Subscription revenue | `revenue:sub:v1:{startDate}:{endDate}` | 3600 s (60 min) |
| PGW revenue | `revenue:pgw:v1:{startDate}:{endDate}` | 3600 s (60 min) |
| Cron locks | `cron:lock:{jobName}` | job-specific TTL |

## Redis server (ops)

- `maxmemory 256mb` (adjust per host)
- `maxmemory-policy allkeys-lru`
- Bind to localhost or private network; password required in production

## Verification

- [x] Client + cache helper implemented
- [ ] Routes not wired yet (Phase 3+)
- [x] Round-trip test against staging Redis (see command in README / below)

```bash
REDIS_ENV=staging REDIS_STAGING_HOST=... REDIS_STAGING_PORT=6379 CACHE_ENABLED=true \
  node --input-type=module -e "const { cacheSet, cacheGet } = await import('./src/server/cache/index.js'); const k='perf:test'; await cacheSet(k,{ok:1},60); console.log(await cacheGet(k));"
```
