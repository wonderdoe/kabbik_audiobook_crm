# Baseline — Phase 0

**Environment:** Staging MySQL (`192.168.7.14:3304`, database `kabbik`).  
**Date captured (DB metrics):** 2026-09-30

## Browser timings

**DevTools (recommended):** Network → **Disable cache** → hard reload while logged in on `http://localhost:8090` (or production URL). Replace “API baseline” below if numbers differ in-browser.

**API baseline (2026-09-30):** `curl` against local Next dev on port **8090**, staging DB. Dashboard home calls are **serial** in code; rewards list + summary are **parallel** in code (filters is a third call on mount).

### /dashboard
| Metric | Value |
|---|---|
| Total API requests on load | **10** (code + curl count) |
| Total page load time | ___ ms (fill from DevTools) |
| Time to Loader disappearing | ~**serial API wall** ~85,700 ms + render (see below) |
| total-user call duration | **26,928 ms** (warm curl; first hit ~30,000 ms with compile) |
| Each payments-day call duration (avg) | **10,419 ms** (7 calls, 9.4–12.9 s each) |
| Each promo call duration (avg) | **757 ms** (today 1,476 ms, yesterday 40 ms) |
| **Sum of serial API times (approx. loader bound)** | **~85,718 ms** |

**Code review:** ~10 serial API calls (1× `total-user`, 7× `total-payment-received`, 2× `promocode/top-most-used`). Relative URL bug: `fetch('api/routes/total-user...')` without leading `/`.

### /dashboard/rewards
| Metric | Value |
|---|---|
| Total API requests on load | **3** |
| List call duration | **1,191 ms** |
| Summary call duration | **48 ms** |
| Filters call duration | **41 ms** |
| Effective load (parallel list + summary) | ~**1,191 ms** (max of list/summary); filters adds ~**41 ms** separately on mount |

**Code review:** 3 requests on first load (`type=filters`, list, `type=summary`).

---

## EXPLAIN output

Full tables: [baseline-explain.md](./baseline-explain.md)

### Rewards list query (summary)
- `tier_user_reward_claim_log`: **ALL**, **Using temporary; Using filesort** (no index on `created_at`)
- Joins: users PK, tier_user_current_tier FK on `user_id`, tier hash join on small table, tier_reward PK

### Rewards count query (summary)
- Claim log: **ALL** full scan; join tables use indexes

### Rewards summary query (summary)
- Claim log: **ALL**; users joined via PK (join unused for unfiltered summary)

---

## Index snapshot

### tier_user_reward_claim_log
```
Table                         Non_unique  Key_name  Seq_in_index  Column_name
tier_user_reward_claim_log    0           PRIMARY   1             id
```
(Only PRIMARY on `id` — no indexes on `created_at`, `claim_status`, or `user_id`.)

### tier_user_current_tier
```
PRIMARY (id)
FK_tier-user-current-tier_users (user_id)
FK_tier-user-current-tier_tier (tier_id)
idx_tucct_user_id (user_id)
```

### users (partial — high-cardinality indexes)
```
PRIMARY (id)
user_name_idx (user_name)
package_id (package_id)
```

---

## Row counts

| Table | Approx rows (`information_schema.TABLES`) |
|---|---|
| tier_user_reward_claim_log | 24 |
| tier_user_current_tier | 21,928 |
| users | 2,071,741 |
| bkash_webhook | 732,917 |

_Staging row counts; production will differ. Rewards EXPLAIN `rows` on claim log reflects staging sample size._

---

## Duplicate tier rows

```sql
SELECT user_id, COUNT(*) AS c FROM tier_user_current_tier
GROUP BY user_id HAVING c > 1 LIMIT 20;
-- (no rows)
```

| Metric | Value |
|---|---|
| Users with duplicate tier rows | **0** |
| Winning row rule agreed | **N/A** (no duplicates on staging) |

---

## Infrastructure

| Item | Value |
|---|---|
| Deployment target | **VPS/Docker** — use `node-cron` worker (`scripts/worker.mjs`) in Phase 4 |
| Redis staging | `REDIS_ENV=staging` → `192.168.7.173:6379`, no TLS |
| Redis production | DigitalOcean managed Redis, TLS on port **25061** |
| Redis available | **yes** (credentials in `.env`) |
| Cron timezone | **Asia/Dhaka** (`+06:00` in existing SQL) |
| Phase 2 Redis client | Branch on `REDIS_ENV`; not `REDIS_URL` |

### DB round-trip (CLI from dev machine → staging MySQL)

| Query | Approx duration |
|---|---|
| `SELECT 1` (10 runs, sequential) | **~240 ms** average per query (~2.4 s total) |

---

## Verification checklist (Phase 0)

- [x] `docs/perf/baseline.md` exists with timings, request counts, EXPLAIN summary, row counts
- [x] `docs/perf/baseline-explain.md` contains full EXPLAIN output
- [x] API timings captured (curl @ `:8090`); optional DevTools “total page load” column still open
