# Maintenance flag — infrastructure (ops)

Object storage + CDN serve public JSON; CRM writes with scoped credentials. Express/MySQL are not in the read path.

## DigitalOcean Spaces (Kabbik)

| Setting | Value |
|---------|--------|
| Bucket | `kabbik-space` |
| Folder (object prefix) | `kabbik-maintenance/` |
| Object keys | `kabbik-maintenance/app.json`, `kabbik-maintenance/website.json` |
| API region | Spaces region slug, e.g. `sgp1` (must match bucket region) |
| S3 API endpoint | `https://<region>.digitaloceanspaces.com` (CRM sets this from `MAINTENANCE_REGION` if `MAINTENANCE_S3_ENDPOINT` is unset) |

Enable **object versioning** on the bucket (Spaces → bucket → Settings) for CRM history and rollback.

Public read (clients): enable **CDN** on the bucket or use the Spaces CDN URL, e.g.:

`https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/kabbik-maintenance/app.json`

**Do not** use the origin URL `https://kabbik-space.sgp1.digitaloceanspaces.com/...` in apps or the browser — the bucket is private and returns **AccessDenied**. CRM writes via the S3 API with keys; only the CDN edge is public.

Set CRM `MAINTENANCE_PUBLIC_BASE_URL` to the bucket or CDN host (with or without the `kabbik-maintenance` folder). CRM auto-appends the folder and rewrites origin hosts to **cdn** for display and docs.

Staging vs production: use **separate** Spaces access keys (or prefixes + keys scoped per prefix) and separate CRM env so staging writes cannot touch production JSON.

### On upload (CRM or CLI)

- `Content-Type: application/json`
- `Cache-Control: public, max-age=15`
- **`public-read` ACL** (CRM sets this on every Save). Without it, CDN/browser GET returns **AccessDenied** even when Save succeeds.

If the bucket blocks ACLs, add a bucket policy allowing anonymous `GetObject` on `kabbik-maintenance/*` only.

### Default seed (flag off)

Use [`seed-app-off.json`](./seed-app-off.json) and [`seed-website-off.json`](./seed-website-off.json).

### CORS

Spaces bucket CORS: allow `GET` from website origin(s). Mobile apps do not need CORS.

### Write identity (CRM)

Create a Spaces access key limited to:

- `GetObject`, `PutObject` on `kabbik-space/kabbik-maintenance/app.json` and `kabbik-space/kabbik-maintenance/website.json`
- `ListBucketVersions` (or list/read versions) on prefix `kabbik-maintenance/` for history API

No delete, no other prefixes. Rotate keys on a schedule.

CRM env (see [`.env.example`](../../.env.example)):

```bash
MAINTENANCE_BUCKET=kabbik-space
MAINTENANCE_REGION=sgp1
MAINTENANCE_KEY_PREFIX=kabbik-maintenance
MAINTENANCE_WRITE_KEY_ID=
MAINTENANCE_WRITE_SECRET=
MAINTENANCE_PUBLIC_BASE_URL=https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/kabbik-maintenance
# Optional override:
# MAINTENANCE_S3_ENDPOINT=https://sgp1.digitaloceanspaces.com
```

Do not use `MAINTENANCE_CDN_DISTRIBUTION_ID` (CloudFront); Spaces CDN relies on `Cache-Control` (~15s).

### Verify before CRM deploy

1. Public GET on both JSON URLs returns correct `Content-Type`, `Cache-Control`, and CORS (website).
2. CRM toggle updates objects; clients see change within ~15s.

## Break-glass (CRM unavailable)

1. Keep on/off JSON copies in a private ops repo (see seed files).
2. Upload with AWS CLI and Spaces endpoint:

```bash
aws s3 cp docs/maintenance/seed-app-off.json s3://kabbik-space/kabbik-maintenance/app.json \
  --endpoint-url https://sgp1.digitaloceanspaces.com \
  --acl public-read \
  --content-type application/json \
  --cache-control "public, max-age=15"
```

3. DigitalOcean control panel → Spaces → object edit also works.
4. Restrict break-glass to a named group; drill once on staging.

## MySQL audit (CRM dual write)

CRM inserts into `app_maintenance_status_log` **best-effort** after a successful Spaces write. Legacy `app_maintenance_status` is not used.

## Rollout checklist

1. Versioning on `kabbik-space`, seed both JSON under `kabbik-maintenance/`, CDN + CORS, scoped Spaces key.
2. CRM env vars; E2E toggle / history / restore on staging prefix or staging key.
3. Break-glass drill.
4. Production key + `MAINTENANCE_ENV_LABEL=production`; off-peak E2E.
5. Client teams: [`client-fetch-contract.md`](./client-fetch-contract.md).
