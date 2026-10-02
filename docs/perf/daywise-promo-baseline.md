# Daywise promo activation — baseline and validation

## UI

| Route | API |
|-------|-----|
| `/dashboard/daywisepromo` | `GET /api/routes/daywise-promo-active` |

Query params (new path): `startDate`, `endDate` (YYYY-MM-DD, Asia/Dhaka), `offset`, `limit`.

Default range: **last 7 Dhaka calendar days** ending today.

## Legacy vs optimized

| | Legacy (`DAYWISE_PROMO_LEGACY=1`) | Optimized (default) |
|--|-----------------------------------|---------------------|
| Time scope | All history | `startDate`–`endDate` (Dhaka) |
| Row grain | One row per `userId` (`MAX(payment_time)`) | One row per promo **payment event** in range |
| Promo filter | `EXISTS (SELECT 1 FROM promo …)` | `INNER JOIN promo` |
| Count | Duplicate full UNION + `JOIN users` | `COUNT(*)` on filtered UNION (no users join) |
| List | `SELECT u.*, p.*` | Slim columns + `JOIN users` on page only |

Grain change is intentional: the page title is “Daywise Promo Activation”; optimized path lists activations in the selected window.

## Data sources (UNION)

- `bkash_onetime` (+ `promo`)
- `bkash_invoice` + `bkash_webhook` (+ `promo`)
- `nagad_payment`, `upay_payment`, `robi_payment` (+ `promo`)

## Validation

```bash
node scripts/validate-daywise-promo.mjs
```

Compares:

1. **legacy** — `queryDaywisePromoLegacy` (timing + total count)
2. **optimized** — `buildDaywisePromoPage` for yesterday (timing + total + sample rows)

Legacy totals are **not** expected to match optimized counts (different grain and date scope). Use the script for **runtime** regression checks after index/query changes.

## Env

| Variable | Behavior |
|----------|----------|
| `DAYWISE_PROMO_LEGACY=1` | API uses legacy all-time per-user query (no date params required) |
| default | Date-range event list + Redis cache (see `daywisePromoCacheKey` in cache-warm) |

## Indexes

See [`db/migrations/2026-10-03-daywise-promo-indexes.sql`](../../db/migrations/2026-10-03-daywise-promo-indexes.sql). Run `EXPLAIN` on staging before apply.

## Acceptance (suggested)

- Optimized list + count for 7-day default window **>50% faster** than legacy list+count on same hardware (validator logs ms).
- CRM: date range updates table; pagination shows table loader only.
