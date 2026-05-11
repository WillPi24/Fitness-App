# Helm — Pre-Release Security Audit & Fix List

**Audit date:** 11 May 2026
**Scope:** `frontend/` (React Native + Expo mobile app). Website security work is already complete and live (see commit `e35f246`).
**Status:** Codex / next-developer handoff. Implementer must be able to build + run the iOS and Android apps and test on a device.

---

## Stack & threat model (read first)

- **Frontend:** React Native + Expo (SDK 55), TypeScript. iOS bundle ID `com.william.helm`, Android package `com.william.helm`.
- **Backend:** Supabase (Postgres + Auth + optional Storage). Anon key is bundled into the JS; the security model depends entirely on Row Level Security (RLS) being correctly configured on every table. **The RLS policies are not in this repo — they must be verified on the Supabase dashboard.**
- **Subscriptions:** RevenueCat SDK → Apple App Store / Google Play. RevenueCat customer is aliased to the Supabase user id via `Purchases.logIn`.
- **Sensitive data handled by the app:**
  - Account info (name, email, sex, bodyweight)
  - Workouts, sets, reps, weights
  - GPS routes (every point — can reveal home / workplace addresses)
  - Body measurements, bodyweight log
  - Progress photos
  - Nutrition logs (food, calories, macros)
  - Subscription / entitlement state
- **Out of scope for the mobile audit (already done or deferred):**
  - Website (helmfit.com) headers + CSP — shipped 11 May 2026
  - Backend RLS — must be verified manually
  - DAST / penetration testing of the live app — recommend a post-launch external test

---

## How to use this document

1. Pull this branch on the Mac.
2. Work top-down through the **MUST FIX** items. Each finding has: file path + line numbers, problem description, proposed fix (with code), and a verification step.
3. **SHOULD FIX** items are real bugs but not release-blockers — schedule for the first post-launch sprint if needed.
4. **NICE TO HAVE** items are polish/hardening.
5. Run the test plan at the end before submitting to TestFlight / Play Internal Track.
6. The "Verified on Supabase side" section is a separate checklist for the project owner — not a Codex coding task.

For each finding, line numbers are accurate as of commit `e35f246` (main, 11 May 2026). If the codebase has drifted, re-grep for the symbol mentioned.

---

# MUST FIX before App Store / Play Store submission

## M1 — Progress photo file is never copied to private storage
**Severity:** High (privacy + reliability bug)
**File:** `frontend/src/store/progressPhotoStore.tsx:57-59`

### Problem
`savePhotoFile` is a no-op that returns the source URI unchanged:

```ts
export async function savePhotoFile(sourceUri: string): Promise<string> {
  return sourceUri;
}
```

Photos selected via `expo-image-picker` (`ProgressPhotos.tsx:80`) return a **photo-library URI** that:
- iOS may revoke when the user deletes the asset from Photos → broken history in the app
- Other apps may also be able to resolve, depending on iOS version
- Is not under app control

Photos captured via `expo-camera` (`ProgressPhotos.tsx:68`) end up in the app cache, which iOS may purge under storage pressure.

### Fix
Copy to the app-private `documentDirectory` and return the new URI:

```ts
import * as FileSystem from 'expo-file-system';

export async function savePhotoFile(sourceUri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}progressPhotos/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}
```

Also add a cleanup utility used during `deletePhoto`:
```ts
export async function deletePhotoFile(uri: string): Promise<void> {
  if (uri.startsWith(`${FileSystem.documentDirectory}progressPhotos/`)) {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // ignore
    }
  }
}
```
Call `deletePhotoFile` wherever a photo is removed from state.

### Verify
1. Take a progress photo from the camera. Confirm the file exists in `documentDirectory/progressPhotos/`.
2. Pick a photo from the library. Same check.
3. Restart the app. Photos still render.
4. Delete the source photo from the iOS Photos app. The Helm photo still renders.

---

## M2 — Auth session + sensitive blobs in unencrypted AsyncStorage
**Severity:** High (data at rest)
**File:** `frontend/src/services/supabase.ts:7-14`, plus all `AsyncStorage` writes of sensitive keys

### Problem
`AsyncStorage` is unencrypted:
- Android: plaintext SQLite at `/data/data/com.william.helm/databases/`
- iOS: plist in app sandbox

Currently stored there:
- Supabase JWT access + refresh tokens (`supabase.ts`)
- `fitnessapp.userProfile.v1` — name, email, sex, bodyweight
- `fitnessapp.runs.v1` — entire GPS route per run (can reveal home / workplace)
- `fitnessapp.bodyMeasurements.v1`, `bodyweightLog.v1`
- `fitnessapp.progressPhotos.v1` — URIs (not the bytes — bytes covered by M1)
- All other `fitnessapp.*` keys

On a rooted Android device or jailbroken iPhone, an attacker can `cat` these.

### Fix
Two-tier approach:

**Tier 1 — Auth tokens to Keychain/Keystore (do this first):**

Create `frontend/src/services/secureStorage.ts`:
```ts
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has a ~2KB value limit; auth JWTs fit comfortably.
export const SecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};
```

Update `frontend/src/services/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
import { SecureStorage } from './secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Install if not already: `npx expo install expo-secure-store`.

**Migration note:** Existing users will be logged out once on first launch after the upgrade (the new client looks in Keychain, the old token is in AsyncStorage). That's acceptable; a one-time re-login is fine. Document this in the release notes.

**Tier 2 — Large sensitive blobs to encrypted MMKV (do this if you have time, but Tier 1 alone is the must-fix):**

`react-native-mmkv` with `encryptionKey` is the standard upgrade for the run/photo/measurement stores. Requires more refactoring; defer to v1.1 if needed. Keep AsyncStorage for non-sensitive things like theme preference.

### Verify
1. Log in. Force-close the app. Reopen — session restored.
2. Use ADB on Android: `adb shell run-as com.william.helm cat databases/RKStorage` — Supabase token should not appear (it's now in Android Keystore, which `adb` cannot dump without root).
3. Confirm `expo-secure-store` is in `package.json` dependencies.

---

## M3 — Android RevenueCat key is a sandbox key
**Severity:** Critical (Play Store purchases will not work)
**File:** `frontend/src/services/subscriptionConfig.ts:6`

### Problem
```ts
export const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? 'test_eedplghnocURrbvHMfsjoeDsQWn';
```

The `??` only uses the env var if defined. If the EAS Android build profile doesn't have `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` set, the sandbox key (`test_...`) ships in production — real purchases will fail.

(For reference: the iOS production key was added on commit `eedcac2` — Android was not.)

### Fix
1. Get the **production** Android API key from the RevenueCat dashboard (Project Settings → API Keys → Public Android API key for production app).
2. Add it as an EAS secret: `eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxxxx`.
3. Replace the fallback literal with the production key, OR remove the fallback so the build fails loudly if the env var is missing:

```ts
export const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? 'goog_REPLACE_WITH_PROD_KEY';
```

Recommended pattern (fail fast in production):
```ts
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
if (!androidKey && Platform.OS === 'android' && !__DEV__) {
  throw new Error('RevenueCat Android key missing in production build');
}
export const REVENUECAT_API_KEY_ANDROID = androidKey ?? 'test_eedplghnocURrbvHMfsjoeDsQWn';
```

### Verify
1. Build an Android production APK: `eas build --platform android --profile production`.
2. Install on a real Android device, sign in with a test Google account, attempt a purchase. The RC paywall + Play purchase dialog should appear and complete a test purchase.
3. Confirm in the RevenueCat dashboard that the transaction shows up under the production project (not sandbox).

---

## M4 — Duplicate `UIBackgroundModes.location` in Info.plist
**Severity:** Medium (App Store review risk)
**File:** `frontend/ios/FitnessApp/Info.plist:60-65`

### Problem
The `UIBackgroundModes` array contains `location` twice:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>location</string>
  <string>location</string>
  <string>fetch</string>
</array>
```
Apple's static analyser flags duplicates and the reviewer may bounce the binary.

### Fix
Manually dedupe the array in `Info.plist`. Final state:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>location</string>
  <string>fetch</string>
</array>
```

Re-running `npx expo prebuild --clean` may re-introduce the dup (likely caused by Expo merging the existing Info.plist with `app.json`'s `infoPlist` block). After prebuild, verify and fix.

### Verify
1. `grep -c '<string>location</string>' frontend/ios/FitnessApp/Info.plist` → should print `1`.
2. Run Xcode → Product → Analyze on the iOS scheme. No "duplicate UIBackgroundModes" warning.

---

## M5 — Confirm `__DEV__` subscription bypass strips in production
**Severity:** High (paywall bypass) — but only if it leaks into prod
**File:** `frontend/src/store/subscriptionStore.tsx:39-44, 126-128, 151`

### Problem
The code short-circuits subscription checks when `__DEV__ === true`:
```ts
if (__DEV__) {
  setIsSubscribed(true);
  // ...skip RC check
}
```

EAS production builds set `__DEV__ = false`, so this *should* be dead code in shipped binaries. But: a misconfigured build profile, or a `development` channel published to TestFlight by mistake, would ship with the bypass active.

### Fix
This is verification, not a code change. After building production:

1. Build production IPA: `eas build --platform ios --profile production`.
2. Download the IPA.
3. Unzip the IPA (`unzip -o Helm.ipa -d helm-ipa`).
4. Find the main JS bundle: `find helm-ipa -name 'main.jsbundle'`.
5. Confirm there is no `__DEV__=true`:
   ```sh
   strings main.jsbundle | grep -E 'DEV.{0,5}true' | head
   ```
   Should return nothing meaningful. (The string `__DEV__` may appear elsewhere — what you don't want to see is the bypass code path active.)

For belt-and-braces: refactor the `__DEV__` bypass into a separate dev-only helper that's tree-shaken in production, or guard it on a build-time env var like `EXPO_PUBLIC_ALLOW_PAYWALL_BYPASS` that defaults to false. But this is optional if the `__DEV__` verification passes.

### Verify
See above; production build does not contain the bypass active.

---

## M6 — Add App Review notes justifying the `audio` background mode
**Severity:** Medium (App Store review will likely reject without this)
**File:** Not a code change — App Store Connect notes field.
**Backing code:** `frontend/ios/FitnessApp/NativePaceKeeperModule.swift:294-332` (silent WAV generator)

### Problem
The PaceKeeper module plays a silent WAV (`helm-pacekeeper-silence.wav`) to keep the audio session alive between voice cues. Apple rejects apps that play silence solely to remain backgrounded ("plays silence to extend background time"). Your defence is that the silent buffer interleaves with real `AVSpeechUtterance` voice cues during outdoor runs.

### Fix
In **App Store Connect → My Apps → Helm → App Review → Review Notes**, add:

> **PaceKeeper background audio justification**
>
> PaceKeeper provides spoken pace cues ("Speed up 12 seconds per kilometre", "On pace") to runners during outdoor runs while the screen is locked. To prevent the iOS audio session from being torn down between cues — which would silence subsequent cues — a brief silent audio buffer is played between voice cues. This is only active during an active outdoor run AND when the PaceKeeper feature is enabled by the user. It stops immediately when the run is paused, finished, or discarded.
>
> Implementation: `NativePaceKeeperModule.swift`, gated by `runStore.tsx` lifecycle (start → silent buffer + cues; pause/finish → buffer torn down).

### Verify
Submit with these notes. If the reviewer still pushes back, you have written defence prepared.

---

## M7 — Complete Apple App Privacy nutrition label
**Severity:** Medium (App Store submission requirement; security/privacy compliance)
**Surface:** App Store Connect → My Apps → Helm → App Privacy

### Problem
Apple requires every app to declare what data it collects and how, via the App Privacy questionnaire. The labels must match what the app actually does and what the Privacy Policy says. A mismatch is grounds for rejection and, post-launch, an in-app warning to users.

### Fix
Complete the questionnaire to match the existing Privacy Policy:
- **Contact Info:** Name, Email Address — linked to identity, used for app functionality.
- **Health & Fitness:** Fitness — linked to identity, used for app functionality.
- **User Content:** Photos or Videos (progress photos) — linked to identity, used for app functionality.
- **Identifiers:** User ID — linked to identity, used for app functionality.
- **Purchases:** Purchase History — linked to identity, used for app functionality (handled by RevenueCat).
- **Location:** Precise Location — used for app functionality (during outdoor runs only).
- **Tracking:** None. Helm does not track users across apps or websites.

Match the existing Privacy Policy wording (in-app `LegalScreen.tsx` and `website/privacy.html`) so the labels and the policy are mutually consistent.

### Verify
Submit; Apple's automated check flags obvious mismatches before review.

---

# SHOULD FIX soon (Medium severity — schedule post-launch if needed)

## S1 — Sign-out doesn't purge local data
**File:** `frontend/src/store/userStore.tsx:283-288`

### Problem
`signOut` calls `supabase.auth.signOut()` and clears sync timestamps, but doesn't remove the per-store data keys (`fitnessapp.workouts.v2`, `fitnessapp.runs.v1`, `fitnessapp.progressPhotos.v1`, etc.). On a shared device, user A's data flashes briefly before user B's sync overwrites — or persists if user B never gets that far.

The constant `STALE_KEYS` already exists at the top of the file; `signUp` (line 183) and `deleteAccount` (line 298) already use it.

### Fix
Add to `signOut`:
```ts
await AsyncStorage.multiRemove(STALE_KEYS);
```
…before or after the `supabase.auth.signOut()` call. Same pattern as in `deleteAccount`.

Also: delete the contents of `${documentDirectory}progressPhotos/` after fixing M1 so the actual JPEGs don't linger.

### Verify
1. Sign in as user A. Log a workout, a run, take a progress photo.
2. Sign out.
3. Sign in as user B (different email).
4. None of A's data is visible at any point. Progress photo files no longer in `documentDirectory/progressPhotos/`.

---

## S2 — Data export is incomplete (UK GDPR Art 20)
**File:** `frontend/src/services/exportData.ts:14-30`

### Problem
`exportToJSON` covers `workouts`, `runs`, `calorieDays`. Missing:
- `bodyweightLog`
- `bodyMeasurements`
- `progressPhotos` (metadata at minimum — see note below for the bytes)
- `customExercises`
- `workoutTemplates`
- `savedMeals`
- `customPoses`
- `userProfile`

Your Privacy Policy (`LegalScreen.tsx`, also the published privacy.html) promises **"You can export Your Data at any time in standard formats (JSON, CSV) from within the app."** UK GDPR Art 20 (right to data portability) backs this up.

### Fix
Extend `exportToJSON` and `exportToCSV` to include all keys. Read the existing pattern in the file. Suggested addition order (alphabetical by store name).

For progress photos: include URI + metadata in the JSON. For the photo bytes themselves, options:
1. (Simplest) Don't include in JSON, but provide a separate "Export photos" button that zips the `documentDirectory/progressPhotos/` directory using `expo-file-system` + a JS zip lib.
2. (Comprehensive) Base64-encode and include — may make the JSON file huge, watch memory.

Option 1 is preferred.

### Verify
1. Sign in to an account with data in every store.
2. Export JSON. Open the file. Confirm every store key is present and non-empty (or empty array if user has none).
3. Re-import on a fresh account. Everything round-trips.

---

## S3 — `console.*` logs leak PII in production
**File:** Many — search for `console.log`, `console.error`, `console.warn` across `frontend/src/`

### Examples
- `calorieStore.tsx:707-713, 721-726` — logs `barcode`, `url`, request bodies
- `foodSearch.ts:329, 346, 382` — logs queries
- `subscriptionStore.tsx:40, 65, 77` — logs user IDs + subscription state
- Most stores have similar diagnostic logging

Accessible via `adb logcat` on Android, or `console.app` while connected to an iPhone.

### Fix
Add `babel-plugin-transform-remove-console` to dev dependencies:
```sh
cd frontend
npm install --save-dev babel-plugin-transform-remove-console
```

Edit `frontend/babel.config.js` (create if needed — Expo SDK 55 may have a `babel.config.js` with `babel-preset-expo`):
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: process.env.NODE_ENV === 'production'
      ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
      : [],
  };
};
```

Note: keeping `console.error` + `console.warn` is reasonable for crash diagnostics. If you have Sentry / similar wired up later, exclude becomes irrelevant.

### Verify
1. Build production IPA.
2. Connect device, open Console.app (Mac), filter for the app.
3. Use the app — no log spew. (Errors/warnings still appear if you kept them.)

---

## S4 — OSRM route snapping not disclosed in Privacy Policy
**File:** `frontend/src/services/routeSnapping.ts:3` + `frontend/src/screens/LegalScreen.tsx:59-218` + `website/privacy.html`

### Problem
GPS routes are sent to `router.project-osrm.org` (a public demo server, no SLA, no DPA) for road snapping. This is **third-party data sharing of location data** — Privacy Policy must disclose it.

Current Privacy Policy lists Supabase, RevenueCat, Apple, Google, OpenFreeMap, USDA, Open Food Facts — but NOT OSRM.

### Fix
Three options, in order of preference:

1. **Self-host OSRM** on Fly.io / a small VPS. ~£5/month for a UK + US instance. Removes the disclosure issue entirely.
2. **Disclose OSRM** in the Privacy Policy. Update both `LegalScreen.tsx` ("Third-Party Services" section) and `website/privacy.html` to add:
   > **OSRM (router.project-osrm.org)** — processes GPS route coordinates to snap your run path to roads for display. Operated by the OSRM open-source project.
3. **Drop route snapping for v1** — display the raw GPS trace without snapping. Easiest if you want to delay this work.

### Verify
- Privacy policies (in-app and website) match and mention OSRM, OR
- The codebase no longer calls `project-osrm.org`.

---

## S5 — Default Expo URL scheme not customised
**File:** `frontend/ios/FitnessApp/Info.plist:25-33`

### Problem
The iOS URL scheme is `com.anonymous.FitnessApp` (the default Expo placeholder). Any app on the device can register the same scheme and intercept `com.anonymous.FitnessApp://` URLs. There are no current deep-link handlers, so today's impact is zero — but if you add password-reset deep links or any auth flow that hands a URL back to the app, that link could be hijacked.

### Fix
1. In `app.json`, add a custom scheme:
   ```json
   "scheme": "helm"
   ```
   Or use the reverse-DNS form: `"com.william.helm"`.
2. Run `npx expo prebuild --clean`.
3. Confirm `Info.plist` `CFBundleURLSchemes` is now `helm` (or your chosen name).
4. If you add deep-link handlers later, validate inbound URLs against an allowlist before routing.

### Verify
1. `grep -A2 'CFBundleURLSchemes' frontend/ios/FitnessApp/Info.plist` shows the new scheme.
2. From another app or Safari, opening `helm://test` opens Helm.

---

## S6 — Verify `delete_own_account` cascades to RevenueCat
**File:** `frontend/src/store/userStore.tsx:298` calls `supabase.rpc('delete_own_account')`
**Where the actual cascade lives:** Supabase SQL function (out of repo)

### Problem
The client-side delete flow calls one Supabase RPC. For full GDPR Art 17 compliance, that RPC needs to:
1. Delete from `auth.users` (Supabase cascades to user tables via FK).
2. Delete or anonymise the **RevenueCat** customer profile (their subscription history is also personal data).
3. Return success only when both succeed.

If the RPC only does step 1, the RevenueCat customer persists forever with name/email/sub history.

### Fix
**This is a backend task, not a Codex code task.** The owner should:

1. Open Supabase SQL editor.
2. Find the `delete_own_account` function.
3. Add a Postgres `pg_net` HTTP call (or send to a Supabase Edge Function) that POSTs to RevenueCat's REST API to delete the customer:
   ```
   DELETE https://api.revenuecat.com/v1/subscribers/{user_id}
   Authorization: Bearer <secret API key — server-side only>
   ```
4. (Recommended) Use a RevenueCat webhook on Supabase user-deleted to handle this asynchronously, with retry, rather than blocking the user's delete request.

### Verify
1. Create a test account with a real RevenueCat purchase (sandbox is OK).
2. Delete account in-app.
3. Confirm the user is gone from Supabase `auth.users`.
4. Confirm the customer is gone from RevenueCat dashboard.

---

# NICE to have (Low severity)

## N1 — Weak password policy
**File:** `frontend/src/store/userStore.tsx:166, 337`

Min length is 6. NIST SP 800-63B + UK NCSC recommend ≥8. Bump to 8, and enable Supabase's **HIBP password breach check** in the dashboard (Authentication → Policies → "Block passwords found in breach databases").

```ts
if (password.length < 8) { return { error: 'Password must be at least 8 characters' }; }
```

## N2 — Login error reveals account existence
**File:** `frontend/src/store/userStore.tsx:178, 247`

Supabase's verbatim error distinguishes "Invalid login credentials" from "Email not confirmed", enabling account enumeration. Map all login errors to:
```ts
return { error: 'Email or password incorrect.' };
```

## N3 — Unused microphone permission description
**File:** `frontend/ios/FitnessApp/Info.plist:55-56`

`NSMicrophoneUsageDescription` is declared but the app never records. Remove the key/value pair. Apple's Privacy Manifest workflow flags unused declarations.

## N4 — No certificate pinning
Not required for indie release. If you ever distribute via enterprise or handle higher-risk data, look at `react-native-ssl-pinning` for Supabase + RevenueCat endpoints.

## N5 — Periodic AsyncStorage polling during runs
**File:** `frontend/src/store/runStore.tsx:626-642`

Polls every 2 s while a run is active. Battery cost is small but moving the foreground-task → JS bridge to an event-emitter pattern is cleaner. Defer.

---

# OWASP cross-cutting controls

Added 11 May 2026 after explicit review against OWASP MASVS, Mobile Top 10 2024, and API Security Top 10 2023. The owner asked whether three commonly-requested controls (rate limiting, input validation, API key handling) needed to be in the audit. This section maps each to Helm's actual surface, identifies the real gaps, and explicitly lists items that are NOT needed for this architecture so the audit isn't padded with boilerplate.

## Rate limiting (OWASP API4:2023, MASVS-AUTH)

### Already satisfied
- **Supabase auth endpoints** — rate-limited by Supabase per-IP and per-user on `/auth/v1/signup`, `/otp`, `/recover`, `/token`, `/verify`. Satisfies OWASP API4:2023 ("limit/throttle how often a single client can execute a single operation") and MASVS-AUTH ("enforcement must be on the remote endpoint"). See [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).
- **Cloudflare network-level DDoS protection** on helmfit.com — included by default on all Cloudflare plans, including Free.

### S7 (NEW — SHOULD FIX) — Add explicit rate-limit rule on the Events Worker
**Severity:** Medium
**Surface:** Cloudflare dashboard → `helmfit.com` zone → **Security → WAF → Rate Limiting Rules**

**Problem:** `helmfit.com/api/events` is unauthenticated and has no per-IP throttle. Per-request cost is low (KV-backed, 1-hour browser cache), but OWASP API4:2023 prescribes an explicit limit on resource consumption.

**Fix:** Create one rate-limit rule (Free Cloudflare plan includes 1):
- Match: URI Path equals `/api/events`
- Counting period: 10 seconds
- Threshold: 60 requests per period
- Action: Block (or Managed Challenge)

No code change required. This is a dashboard task.

### V7 — Supabase CAPTCHA (DEFERRED for v1)
**Decision (11 May 2026):** Deferred until post-launch.

**What it would do:** Supabase dashboard → **Authentication → Attack Protection** → enable hCaptcha or Cloudflare Turnstile on signup, signin, and password recovery. Adds bot protection (mass account creation, brute-force login, password-reset email spam) above the built-in rate limits.

**Why deferred:** This is not a pure dashboard toggle — enabling it on the Supabase side requires also integrating a CAPTCHA widget into the React Native app (SignUpScreen, LoginScreen, ForgotPasswordScreen) and passing the resulting token to the Supabase auth calls. Non-trivial client work. Supabase's built-in per-IP / per-user rate limits already block credential stuffing at the volume an indie app would see.

**Trigger to enable:** start seeing bot signups or password-reset abuse in the Supabase auth logs. At that point, integrate one of the React Native CAPTCHA libraries (e.g. `@hcaptcha/react-native-hcaptcha`) and turn it on in the dashboard.

### Not needed for Helm
- **App-side throttling code** — MASVS-AUTH explicitly defers enforcement to the remote endpoint. Adding client-side limits is theatre.
- **Custom WAF rules beyond the one above** — overkill at launch scale.
- **API gateway rate limiting infrastructure** — Supabase + Cloudflare already provide it.

---

## Input validation (OWASP MASVS-CODE-4, Mobile Top 10 2024 M4)

### Already satisfied by architecture
- **SQL injection** — closed: PostgREST parameterises all REST calls; the one `.rpc('delete_own_account')` is parameterless. (Verified in Appendix.)
- **XSS** — closed: React Native `<Text>` does not parse HTML; no `WebView`. MASVS-PLATFORM-2 (which is scoped to WebViews) is N/A.
- **Insecure deserialization** — N/A: app only consumes JSON via `fetch().json()`. No pickle-equivalent.
- **Email format / numeric range** — UX bugs, not security. Skip unless backing a schema invariant.

### S8 (NEW — SHOULD FIX) — Postgres CHECK constraints on user-text columns
**Severity:** Low-Medium (defence in depth)
**Surface:** Supabase migrations (outside this repo)

**Problem:** OWASP MASVS-CODE-4 calls for validation at trust boundaries. Postgres TEXT columns have no default length cap, so a buggy or malicious client could write a 100 MB workout-name and DoS storage / row reads.

**Fix:** Add CHECK constraints via a new Supabase migration. Schema audit step: enumerate every user-text column in the Supabase dashboard, decide a sensible cap, write the migration.

```sql
ALTER TABLE workouts             ADD CONSTRAINT workouts_name_len             CHECK (length(name) <= 200);
ALTER TABLE custom_exercises     ADD CONSTRAINT custom_exercises_name_len     CHECK (length(name) <= 100);
ALTER TABLE workout_templates    ADD CONSTRAINT workout_templates_name_len    CHECK (length(name) <= 200);
ALTER TABLE saved_meals          ADD CONSTRAINT saved_meals_name_len          CHECK (length(name) <= 200);
ALTER TABLE progress_photos      ADD CONSTRAINT progress_photos_pose_len      CHECK (length(pose) <= 50);
-- Inventory every user-text column and apply appropriate caps.
-- Notes/description fields: suggested cap 2000.
```

### S9 (NEW — SHOULD FIX) — Validate third-party API response shape
**Severity:** Low
**Files:**
- `frontend/src/services/foodSearch.ts` (USDA)
- `frontend/src/store/calorieStore.tsx` (Open Food Facts)
- `frontend/src/services/routeSnapping.ts` (OSRM)

**Problem:** Responses from USDA, Open Food Facts, and OSRM are currently trusted in shape. If any of those services is compromised or returns unexpected payloads, the app could persist or render malformed data. MASVS-CODE-4 explicitly covers "network" entry points as untrusted.

**Fix:** Install `zod` and validate response shape before use:
```sh
cd frontend && npm install zod
```
Pattern (apply per-endpoint):
```ts
import { z } from 'zod';

const FoodSchema = z.object({
  fdcId: z.number(),
  description: z.string().max(500),
  foodNutrients: z.array(z.object({
    nutrientId: z.number(),
    value: z.number(),
  })).optional(),
});

const raw = await response.json();
const parsed = FoodSchema.safeParse(raw);
if (!parsed.success) {
  // Treat as "not found" — graceful degradation, don't crash.
  return null;
}
const data = parsed.data;
```

### S5 extended — Deep-link parameter validation
S5 already covers renaming the URL scheme. **Additional fix when handlers are added later:** validate path and query params against an allowlist before routing. There are no deep-link handlers today, so no current code change.

### Not needed for Helm
- **Sanitisation libraries (DOMPurify etc.)** — no HTML rendering surface.
- **Regex email validation as a security control** — Supabase validates auth emails server-side.
- **Anti-XSS escaping** — React Native is XSS-safe by default.
- **Anti-SQL-injection libraries** — PostgREST parameterises everything.

---

## API key handling (OWASP MASVS-STORAGE-1/-2, MASVS-CRYPTO-2, Mobile Top 10 2024 M1)

### Complete key inventory
| Key | Public-by-design? | Location | Status |
|---|---|---|---|
| Supabase anon (`EXPO_PUBLIC_SUPABASE_ANON_KEY`) | Yes (gated by RLS) | env var, bundled | ✅ Correct |
| RevenueCat iOS (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`) | Yes (RC public SDK key — `appl_*`) | env var + hardcoded fallback in `subscriptionConfig.ts:4` | ⚠️ Remove fallback (relates to M3) |
| RevenueCat Android (`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`) | Yes (RC public SDK key — `goog_*`) | env var + **sandbox** fallback in `subscriptionConfig.ts:6` | ❌ See M3 |
| USDA `data.gov` (`EXPO_PUBLIC_USDA_API_KEY`) | Public (per-key rate limit) | env var, bundled | ⚠️ Rate-limit theft risk only |
| Cloudflare Worker `ADMIN_TOKEN` | Secret | Wrangler secret (not in code) | ✅ Correct |
| Supabase `service_role` | **SECRET — must NEVER bundle** | Not in code | ✅ (verify with V8) |
| RevenueCat secret API (`sk_*`) | **SECRET — must NEVER bundle** | Not in code | ✅ (verify with V8) |

### Why public-by-design keys are OK in the bundle
Per [RevenueCat docs](https://www.revenuecat.com/docs/projects/authentication) and Supabase architecture, the public SDK / anon keys are designed to ship in client binaries. Their safety depends on:
- For Supabase anon: **RLS coverage** on every table (verified separately in V1).
- For RevenueCat public: server-side receipt validation by RevenueCat infrastructure.
- For USDA: per-key rate limits at api.data.gov.

MASVS-STORAGE-1/-2 covers **sensitive** data — keys that are public by design are not in scope. MASVS-CODE-4's MASWE-0005 ("API Keys Hardcoded in the App Package") applies to secret keys, not public SDK keys.

### V8 (NEW verification) — Grep production bundle for secret-key leakage
After EAS production build:
```sh
# iOS
unzip Helm.ipa -d helm-ipa
find helm-ipa -name 'main.jsbundle'
strings helm-ipa/Payload/Helm.app/main.jsbundle | grep -E 'service_role|sk_[a-zA-Z]'

# Android
unzip Helm.apk -d helm-apk
strings helm-apk/assets/index.android.bundle | grep -E 'service_role|sk_[a-zA-Z]'
```
Expected output: nothing. Any match is a leak that must be fixed before submission.

### N6 (NEW — NICE) — Add secret scanning to CI
**File:** `.github/workflows/secret-scan.yml` (new)

```yaml
name: Secret scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
Alternative: enable GitHub's native secret scanning in repo Settings → **Code security and analysis** → toggle "Secret scanning".

### N7 (NEW — NICE) — Key rotation runbook
**File:** `docs/KEY_ROTATION.md` (new)

Document procedure per key:
- **Supabase anon compromised**: rotate in Supabase dashboard. Existing app builds break — push an app update. Sessions stored in `expo-secure-store` survive; only fresh logins fail until users update.
- **Supabase `service_role` compromised**: rotate immediately. Audit access logs. Re-deploy any Edge Functions / Workers using it.
- **RevenueCat public SDK key compromised**: rare — rotate via RC dashboard, update EAS env var, ship app.
- **RevenueCat secret API key compromised**: rotate immediately. Audit webhook delivery history.
- **USDA `data.gov` key compromised**: regenerate at api.data.gov, update EAS env var, ship app.
- **Cloudflare Worker `ADMIN_TOKEN` compromised**: `npx wrangler secret put ADMIN_TOKEN` in `website/workers/events-worker/`.

### Not needed for Helm
- **Native code obfuscation of API keys** — public keys are designed to be public. Obfuscating them gives no real security; an attacker can extract them at runtime with Frida regardless.
- **Encrypting public keys at rest in the bundle** — same reasoning.
- **Custom key vault (HashiCorp etc.)** — overkill for an indie launch with no genuine secrets in the client.

---

### OWASP references for this section
- [OWASP MASVS](https://mas.owasp.org/MASVS/) — AUTH, STORAGE, CRYPTO, CODE, PLATFORM categories
- [OWASP Mobile Top 10 2024](https://owasp.org/www-project-mobile-top-10/) — M1 (Improper Credential Usage), M4 (Insufficient Input/Output Validation)
- [OWASP API Security Top 10 2023, API4](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Cloudflare WAF rate-limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [RevenueCat API Keys & Authentication](https://www.revenuecat.com/docs/projects/authentication)

---

# Verification checklist — outside this repo

These are NOT Codex tasks. They are the project owner's responsibility because they live on third-party dashboards.

## V1 — Supabase RLS policies (CRITICAL — verify before launch)
For every user-owned table (workouts, runs, body_measurements, progress_photos, bodyweight_log, custom_exercises, workout_templates, saved_meals, custom_poses, user_profile, anything else), confirm policies exist for **SELECT, INSERT, UPDATE, DELETE**:

```sql
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```

Run this in the Supabase SQL editor to inventory:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Every user-owned table must have `rowsecurity = true` AND have policies covering all four operations. **Without these, any user with the anon key (which is in the bundle) can read every other user's data.**

## V2 — `delete_own_account` RPC behaviour
1. Open the function definition in Supabase SQL editor.
2. Confirm it uses `SECURITY DEFINER` and is scoped via `auth.uid()`.
3. Confirm it deletes from `auth.users` AND from every user-owned table (or relies on FK cascade — verify the FKs are `ON DELETE CASCADE`).
4. Confirm it calls RevenueCat's customer delete endpoint (see S6).

## V3 — Email confirmation enforcement
Supabase dashboard → Authentication → Providers → Email → **"Confirm email"** must be ON.

## V4 — Auth rate limiting
Supabase dashboard → Authentication → Rate Limits. Defaults are usually fine; confirm signup, signin, password-reset have non-zero limits.

## V5 — Database backup retention
Supabase Pro+ plans have daily backups. For Free tier, take periodic manual exports. Document the recovery procedure.

## V6 — RevenueCat webhook signing
RevenueCat → Project Settings → Integrations → Webhooks. If you have any backend webhook configured (for entitlement sync), confirm signing key is set and your handler verifies the signature.

## V9 — EAS production environment variables set
Before the first production build, confirm these are present as EAS secrets:

```sh
eas secret:list
```

Required:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_USDA_API_KEY`

Optional (have working fallbacks in code):
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (the in-code fallback is the real production key)

Without the required three, the build will compile but auth and food search won't work. To create one:

```sh
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co
```

## V10 — Two-factor authentication on developer dashboards
The single biggest unmitigated security risk for an indie app isn't a code bug — it's a phishing attack on one of your developer accounts. If any of these is compromised, the attacker bypasses every control in this audit. Enable 2FA on all of them:

- **Supabase** — Account Settings → Security. Compromise gives the attacker `service_role` access to the whole DB.
- **RevenueCat** — Account Settings → Two-Factor Authentication. Compromise lets them grant/revoke entitlements and rotate keys.
- **Cloudflare** — My Profile → Authentication. Compromise lets them change DNS / disable HSTS / serve a malicious response from helmfit.com.
- **GitHub** — Settings → Password and authentication. Compromise lets them push code with backdoors or leak repo contents.
- **Apple Developer** — already requires 2FA; verify it's on the correct contact device.
- **EAS / Expo** — Account Settings → Security. Compromise lets them push a backdoored build via `eas update`.

Use an authenticator app (Aegis / 1Password) rather than SMS. Document the recovery codes in a password manager separate from the device they protect.

---

# Test plan (before submission)

Run all of these on a real iPhone + a real Android device before pushing to TestFlight / Internal Track.

## Functional
- [ ] Sign up new account (email confirmation flow works end-to-end)
- [ ] Log in / log out / log back in (session restored from secure storage)
- [ ] Forgot password flow
- [ ] Log a workout, sync confirms
- [ ] Start outdoor run, lock screen for 30s, return — GPS still recording, voice cue heard
- [ ] Take progress photo (camera + library), restart app, photo still there
- [ ] Log food via search + via barcode scan
- [ ] Purchase Full Sail (sandbox / TestFlight)
- [ ] Restore Purchases on second device
- [ ] Export data — open the JSON, confirm every store appears
- [ ] Delete account — sign back in fails; in Supabase dashboard, user gone; in RC dashboard, customer gone

## Security
- [ ] `expo-secure-store` is installed and Supabase client uses it (M2)
- [ ] No JWT visible in `adb shell run-as com.william.helm cat databases/RKStorage` (M2)
- [ ] Progress photos in `documentDirectory/progressPhotos/` after capture (M1)
- [ ] `UIBackgroundModes` has `location` exactly once (M4)
- [ ] Production IPA bundle does not contain `__DEV__: true` (M5)
- [ ] Android production build uses production RC key, sandbox purchases reject with appropriate error (M3)
- [ ] `adb logcat | grep helm` during normal use shows no PII / queries / tokens (S3)
- [ ] Privacy policy mentions OSRM OR the codebase doesn't call OSRM (S4)
- [ ] After sign-out then sign-in as different user, no leakage of previous user's data (S1)
- [ ] Supabase RLS policies verified (V1)

## App Store / Play Store specifics
- [ ] App Review notes filled in (M6)
- [ ] Account deletion in-app (Apple Guideline 5.1.1(v)) — present in `AccountScreen.tsx`
- [ ] Restore Purchases in-app (Apple Guideline 3.1.1) — present in `AccountScreen.tsx`
- [ ] Manage Subscription link in-app — present in `AccountScreen.tsx`
- [ ] Privacy policy + Terms reachable from sign-up screen
- [ ] All declared permissions match actual usage strings (camera, location, photos)

---

# Recommended commit / PR strategy for Codex

Suggested branches (one PR per area for review-ability):

1. `security/M1-progress-photo-private-storage`
2. `security/M2-secure-store-session` (the big one — touches the auth flow and forces re-login)
3. `security/M3-android-revenuecat-prod-key` (often a one-liner + EAS secret)
4. `security/M4-info-plist-dedupe`
5. `security/S1-clear-local-on-signout`
6. `security/S2-complete-data-export`
7. `security/S3-strip-console-prod`
8. `security/S4-disclose-osrm` (or remove route snapping)
9. `security/S5-custom-url-scheme`
10. `security/S8-postgres-check-constraints` (Supabase migration)
11. `security/S9-zod-validate-third-party-responses`
12. `security/N1-N3-polish` (bundle the low-severity items)
13. `security/N6-gitleaks-ci` (GitHub Actions workflow)
14. `security/N7-key-rotation-runbook` (`docs/KEY_ROTATION.md`)

M5 (verify `__DEV__` strip), M6 (App Review notes), S7 (Cloudflare rate-limit rule), and V8 (bundle grep) are NOT PRs — they're verification + dashboard tasks. V7 (Supabase CAPTCHA) is deferred until post-launch (see OWASP section).

Each PR should:
- Reference this document's finding ID in the title (e.g., "M1: copy progress photos to documentDirectory")
- Include the verification step from this document in the PR description
- Be tested on at least one iOS device + one Android device before merging

---

# Appendix — items I verified during the audit

- ✅ `frontend/.env` is gitignored (`.gitignore:34` global rule) and has **never been committed** (verified via `git log --all -- frontend/.env`). Initial audit flagged this as critical; it's a false alarm.
- ✅ No `dangerouslySetInnerHTML`, `eval()`, raw HTML rendering anywhere in the codebase.
- ✅ Only one `.rpc()` call — `delete_own_account`, parameterless, no SQL injection vector.
- ✅ All external API calls use HTTPS (USDA, Open Food Facts, OSRM, OpenFreeMap, Supabase, RevenueCat).
- ✅ `NSAllowsArbitraryLoads = false` in Info.plist.
- ✅ Email verification IS enforced before profile creation (`userStore.tsx:192-217`).
- ✅ No analytics / telemetry SDKs (Sentry, Crashlytics, Firebase, Mixpanel) — privacy policy claim "no tracking" is accurate.
- ✅ `PrivacyInfo.xcprivacy` correctly declares `NSPrivacyTracking = false`.
- ✅ Geolocation watcher cleanup verified — `stopLocationUpdates` called on pause, finish, and discard.
- ✅ Global `ErrorBoundary` exists at `frontend/src/components/ErrorBoundary.tsx`.
- ✅ Demo / seed data is gated behind `__DEV__` checks.
- ✅ Background location is only requested when starting an outdoor run.

---

*End of document. Last updated 11 May 2026 after the website CSP work (commit e35f246).*
