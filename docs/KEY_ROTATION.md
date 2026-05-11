# Key rotation runbook

This document describes what to do when a secret or API key associated with Helm is suspected to be compromised, or needs to be rotated as part of routine hygiene.

Keys fall into two classes:

- **Public-by-design** keys are intentionally embedded in the mobile app bundle and are safe to be visible in client traffic. Their safety depends on server-side enforcement (RLS, receipt validation, per-key rate limits).
- **Secret** keys must never be in the client bundle or in the public repo. They live only in Cloudflare / Supabase / EAS secrets.

## Inventory

| Key | Class | Where it lives | Where to rotate |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public-by-design | EAS env var, bundled into the app | Supabase dashboard → Settings → API |
| Supabase `service_role` | Secret | Never bundled. Only in Supabase Edge Functions and trusted server contexts. | Supabase dashboard → Settings → API |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (`appl_*`) | Public-by-design (RevenueCat public SDK key) | EAS env var, bundled | RevenueCat dashboard → Project Settings → API Keys |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (`goog_*`) | Public-by-design | EAS env var, bundled | RevenueCat dashboard → Project Settings → API Keys |
| RevenueCat secret API key (`sk_*`) | Secret | Used in Supabase Edge Functions / scripts for customer-management. Never in the app. | RevenueCat dashboard → Project Settings → API Keys |
| `EXPO_PUBLIC_USDA_API_KEY` | Public (per-key rate limit) | EAS env var, bundled | https://api.data.gov/signup/ |
| Cloudflare Worker `ADMIN_TOKEN` | Secret | Wrangler secret on `helm-events` worker | `npx wrangler secret put ADMIN_TOKEN` |

## Rotation procedures

### Supabase anon key compromised
The anon key is gated by RLS, so a leak doesn't directly expose data — but rotation is still recommended to invalidate any token-spoofing attempts and to limit reconnaissance surface.

1. Supabase dashboard → Settings → API → "Reset anon key" (or generate a new project API key).
2. Update the EAS secret: `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <new-value>` (delete the old one first).
3. Build a new app version and ship via EAS.
4. **Note:** all sessions cached in `expo-secure-store` from the previous client survive because Supabase issues JWTs against the project, not the anon key. Only fresh logins on old builds will fail (the old anon key stops working).

### Supabase `service_role` compromised
This is the highest-severity scenario. The service_role bypasses RLS — anyone with it has full database access.

1. **Immediately** rotate via Supabase dashboard → Settings → API → "Reset service role key".
2. Audit access logs in Supabase → Logs → check for unfamiliar IPs / unusual query patterns since the suspected compromise.
3. Update every place the key is configured:
   - Supabase Edge Functions: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<new-value>`
   - Any backend scripts / cron jobs
4. Verify no copies remain in `.env*` files, in deploy pipelines, or in committed code.
5. Consider a forensic investigation: when did the leak happen? What data could have been accessed during the exposure window?

### RevenueCat public SDK key compromised
Rare in practice — these are designed to be public. But if leaked in a way that triggers abuse (e.g., spoofed receipt validation calls), rotate.

1. RevenueCat dashboard → Project Settings → API Keys → "Rotate" on the relevant platform key.
2. Update EAS secret with the new key (or update the inline fallback in `frontend/src/services/subscriptionConfig.ts` for the Android prod key).
3. Build a new app version. Old builds will silently fail purchase / restore until they receive the update.

### RevenueCat secret API key compromised
1. RevenueCat dashboard → Project Settings → API Keys → revoke the compromised secret key.
2. Audit webhook delivery history for unauthorized configuration changes.
3. Update wherever the key was used (Supabase Edge Function for `delete_own_account` cascade, any scripts).

### USDA `data.gov` key compromised
Impact is only rate-limit theft (1000 req/hour per key).

1. Generate a new key at https://api.data.gov/signup/.
2. Update EAS secret: `eas secret:create --scope project --name EXPO_PUBLIC_USDA_API_KEY --value <new-value>`.
3. Build a new app version.

### Cloudflare Worker `ADMIN_TOKEN` compromised
The admin token guards the `/api/admin/refresh` endpoint that manually triggers the events collector.

1. Generate a new random token (`openssl rand -hex 32`).
2. `cd website/workers/events-worker && npx wrangler secret put ADMIN_TOKEN` and paste the new value.
3. Update any local scripts / dashboards that call `/api/admin/refresh` with the new token.

## Verification after rotation

After any rotation:

- **Public-by-design keys**: build a fresh production app, sign in, exercise the affected path (auth / purchase / food search). Confirm everything works with the new key.
- **Secret keys**: confirm the new key is set in the relevant secret store and re-run any cron / scheduled task that depends on it.
- **Always**: grep the repo (`git grep <old-key-fragment>`) to confirm no copy survives in the codebase. Push a commit if you find any.

## Preventing accidental commits

- `.gitignore` already excludes `frontend/.env` and `.env*` patterns.
- The `.github/workflows/secret-scan.yml` workflow runs gitleaks on every push and pull request.
- For an additional belt-and-braces layer, enable GitHub's native secret scanning in repo Settings → Code security and analysis.
