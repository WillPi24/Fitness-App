# Helm — App Store Submission Status

## Goal

Ship Helm (iOS) to the Apple App Store as a free app with an auto-renewing
subscription (Full Sail) for pro features. Target approval window: 3–5 days
from submission, assuming a clean first review.

Google Play submission is a separate follow-up, but much of the work here
(privacy disclosures, subscription terms, attribution, store listing copy)
ports across.

---

## ✅ Done

### App Store Connect metadata
- **App Name**: Helm
- **Subtitle**: `Workout, run & nutrition log`
- **Primary category**: Health & Fitness · **Secondary**: Sports
- **Description**: ASCII-safe version submitted (no em-dashes, no
  Unicode dividers); includes required auto-renewing subscription
  disclosures per App Store Review Guideline 3.1.2
- **Keywords** (100 chars):
  `fitness,tracker,gym,training,exercise,strength,cardio,calorie,counter,macro,meal,lifting,hiit,pace`
- **Promotional Text**: "Stop juggling five fitness apps..." hook
- **Support URL**: https://helmfit.com/support (dedicated FAQ page)
- **Marketing URL**: https://helmfit.com
- **Version**: 1.0
- **Copyright**: `2026 William Patterson`
- **Age Rating**: 9+ (Not Applicable override), driven by
  Health or Wellness Topics = Yes
- **Content Rights**: Yes, I have the necessary rights
  (attribution in-app for all sources)
- **EULA**: Apple's standard (custom ToS binds via in-app signup)
- **Routing App Coverage**: skipped — not a Navigation-category app

### App Privacy
- Privacy Nutrition Label questionnaire completed and published
- Data-types disclosed: Name, Email, Health, Fitness, Precise Location,
  Photos or Videos, Other User Content, User ID, Device ID, Purchase History
- All usage marked as App Functionality only
- All linked to identity · None used for tracking
- Privacy Policy live at https://helmfit.com/privacy.html

### Infrastructure and legal docs
- Privacy Policy and Terms of Service live (website + standalone PDF)
- Terms of Service covers Full Sail auto-renewal, cancellation paths,
  free trial terms, refunds, price changes (Apple requirement for IAP)
- Compare pages carry trademark disclaimer + verification date; denigratory
  language removed; "Strava Summit" (outdated) → "Strava subscription"
- Website deployed to Cloudflare Pages at helmfit.com (SSL + HSTS +
  Bot Fight Mode)
- Content Security Policy header on all pages
- Motion library pinned to 12.38.0 with SRI hash (no supply-chain risk)
- Supabase keep-alive GitHub Action runs every 3 days
  (prevents free-tier pause during App Review window)
- Cloudflare Worker (`helm-events`) serving `/api/events` weekly

### App configuration
- `ITSAppUsesNonExemptEncryption: false` in `frontend/app.json`
  (iOS export-compliance exemption self-declared)
- Unused `RECORD_AUDIO` Android permission removed
- Duplicate Android location permissions cleaned up
- RevenueCat plugin entries in app.json: re-added
- Credits section in Account screen:
  OSM, OpenFreeMap, USDA FoodData Central, Open Food Facts, RevenueCat

---

## ❌ Still to do — blockers for submission

### 1. Bundle identifier (critical)
Current value in `frontend/app.json`:
```
"bundleIdentifier": "com.anonymous.FitnessApp"
```
- Default Expo placeholder — embarrassing to ship
- Cannot be changed once the app is live
- Change to `com.helmfit.app` (or similar) before the production build
- Must also be registered in the Apple Developer portal under
  Certificates, Identifiers & Profiles

### 2. `NSPhotoLibraryUsageDescription` missing from app.json
- The progress-photos feature uses `expo-image-picker`
- iOS rejects any build that reads the photo library without a usage string
- One-line fix inside `ios.infoPlist`

### 3. RevenueCat keys still on test values
File: `frontend/src/services/subscriptionConfig.ts`
- Currently hardcoded as `test_eedplghnocURrbvHMfsjoeDsQWn` (iOS + Android)
- Needs production iOS key and production Android key before the
  production build
- Move to env vars (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, etc.) for cleanliness

### 4. Demo account for Apple reviewers
- Create a dedicated account (e.g. `apple-review@helmfit.com`)
- Use Supabase dashboard → Authentication → Add user → Auto Confirm User
  (skips email verification)
- Log into the account via the app and add: 1 sample workout, 1 run,
  a few food entries, 1 bodyweight reading
- Grant the account Full Sail entitlement via RevenueCat dashboard,
  so reviewers can test pro features

### 5. App Review Information
In App Store Connect → App Review Information:
- Contact first name, last name, phone, email
- **Sign-In Information**:
  - Username: (demo email)
  - Password: (demo pass)
- **Notes** field: step-by-step walkthrough for reviewers so they
  don't have to guess at the app's core flows

### 6. In-App Purchase: Full Sail
In App Store Connect → your app → Subscriptions:
- Create a subscription group
- Create the Full Sail product with:
  - Reference name
  - Display name + localized description
  - Subscription duration (monthly / annual)
  - Price tier
  - Review screenshot of the paywall
- Submit the IAP alongside the app binary for review
  (IAP goes through its own review)

### 7. Pricing and Availability
- Price: Free
- Territories: UK + US minimum; worldwide unless there's a reason not to
- Pre-orders: off (first release)
- Manual vs Automatic release: recommend Manual for v1 so you control
  the go-live moment after approval

### 8. Screenshots (the biggest time sink)
Required sizes:
- **iPhone 6.9"** (iPhone 16 Pro Max, 1290×2796) — at least 1, up to 10
- **iPad 13"** (2064×2752) — required because `supportsTablet: true`

Can be:
- Actual app screenshots (simplest)
- Device-framed screenshots with marketing copy overlays
- Some mix of the two

### 9. Production build
Upload the actual IPA to App Store Connect:
- Expo path: `eas build -p ios --profile production`
- Upload via EAS auto-submit or Transporter
- Build must have the new bundle ID, the photo library permission,
  and production RevenueCat keys

---

## 🟡 Worth verifying before submission

1. **1024×1024 App Store icon** uploaded in App Store Connect → App
   Information → App Icon
2. **Launch screen** configured via app.json `splash` block (already set,
   but confirm it renders correctly on device)
3. **Trademark quick check** on "Helm" as a fitness app name via UK IPO +
   USPTO — 10 min to avoid surprises later
4. **Test the demo account end-to-end** on a fresh device before
   submitting, including Full Sail entitlement

---

## 🟢 Nice-to-have (not blockers)

- TestFlight internal test with 2–3 people before App Store submission
- App Preview videos (can boost conversion; optional)
- Localized metadata for other languages (English-only is fine for v1)
- iPhone 6.5" screenshots in addition to 6.9" (deprecated but some users
  on older devices will see these)

---

## Suggested order of operations

1. Bundle ID change, photo library permission, RevenueCat env-var plumbing
   (~30 min, mostly config changes)
2. Create demo account, pre-load data, grant Full Sail entitlement
   (~30 min)
3. Screenshot production — actual time-sink, plan 2–4 hours
4. Configure Full Sail IAP in App Store Connect (~30 min)
5. Build production binary with `eas build` (~20 min compile + queue time)
6. Upload + fill in App Review Information + submit
7. Submit Full Sail IAP review alongside the app
8. Wait 3–5 days for decision

---

## Target submission date

_To be decided by William._

Last updated: 2026-04-24.
