# Maintenance flag — client fetch contract

App and website read maintenance state **directly from the CDN**. No Express/MySQL/API call.

## URLs

Replace `{BASE}` with the CRM **CDN** base (includes `kabbik-maintenance` when env omits it), e.g.:

`https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/kabbik-maintenance`

| Platform | URL |
|----------|-----|
| App | `{BASE}/app.json` |
| Website | `{BASE}/website.json` |

**Not for clients:** `https://kabbik-space.sgp1.digitaloceanspaces.com/...` (no `cdn` in hostname) is the private origin — browsers get **AccessDenied**. Apps must use the **cdn.digitaloceanspaces.com** URL (or your custom CDN domain).

## JSON shape

```json
{
  "schemaVersion": 1,
  "platform": "app",
  "isUnderMaintenance": true,
  "title": { "en": "Scheduled Maintenance", "bn": "..." },
  "message": { "en": "We will be back by 3 AM.", "bn": "..." },
  "startsAt": null,
  "endsAt": "2026-10-04T03:00:00.000Z",
  "updatedBy": "admin1",
  "updatedAt": "2026-10-03T17:42:00.000Z"
}
```

- Timestamps: ISO 8601 UTC.
- `startsAt` / `endsAt`: optional `null`.
- Ignore unknown fields. If `schemaVersion` > supported, still honor `isUnderMaintenance`, `title`, `message`.

## When to fetch

| Client | Trigger |
|--------|---------|
| App | Launch; resume from background |
| Website | Page load; optional poll every 60s while maintenance UI is shown |

## Effective maintenance

Do **not** use device clock alone. Prefer HTTP **`Date`** header from the CDN response as `now`; fall back to device time only if missing.

```
effective = isUnderMaintenance
         AND (startsAt is null OR now >= startsAt)
         AND (endsAt   is null OR now <  endsAt)
```

## Copy by language

Use `title` / `message` for user locale (`en` / `bn`). Fall back to English if Bangla is empty.

Render title and message as **plain text** (not HTML).

## Failure handling (fail open)

| Condition | Behavior |
|-----------|----------|
| Network error, timeout (>5s suggested), invalid JSON | Treat as **not** under maintenance; continue normally |
| Never block startup | Run fetch in parallel; cache last good response locally |

## Outage vs maintenance

If the **main API** fails repeatedly but maintenance JSON says off, show a separate generic “Can’t connect, try again” screen with retry. Do not conflate with the maintenance screen.

## Caching

Origin sends `Cache-Control: public, max-age=15`. Expect up to ~15s delay after CRM toggles.

## Test checklist (staging)

1. Toggle on in CRM → clients show maintenance within ~15s.
2. Toggle off → normal experience returns.
3. Future `startsAt` → clients normal until window starts.
4. Past `endsAt` with flag on → clients normal (expired window).
5. Break URL or invalid JSON → fail open.
6. Backend/DB down → CRM can still flip flag; clients still read CDN JSON.

See also: [infra.md](./infra.md).
