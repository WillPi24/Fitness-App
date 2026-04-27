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
- Bundle identifier set to `com.william.helm` (iOS + Android)
- `NSPhotoLibraryUsageDescription` + `NSPhotoLibraryAddUsageDescription`
  added to iOS infoPlist (required for progress-photos feature)
- Unused `RECORD_AUDIO` Android permission removed
- Duplicate Android location permissions cleaned up
- RevenueCat plugin entries in app.json: re-added
- Credits section in Account screen:
  OSM, OpenFreeMap, USDA FoodData Central, Open Food Facts, RevenueCat

### In-App Purchase: Full Sail
App Store Connect:
- Subscription Group `Helm Full Sail` (ID 22039665)
- `com.william.helm.monthly` — Ready to Submit
- `com.william.helm.yearly` — Ready to Submit
- Localization, screenshot, pricing, tax, availability all set
- Will be attached to the v1.0 binary submission via the
  "In-App Purchases and Subscriptions" section on the version page

RevenueCat:
- Entitlement `Helm_Full_Sail` (display: Helm Full Sail)
- Products `com.william.helm.monthly` + `com.william.helm.yearly` linked
- Offering `default` created with monthly + annual packages, set current
- `ENTITLEMENT_ID` in `subscriptionConfig.ts` set to `'Helm_Full_Sail'`
- iOS public SDK key (`appl_...`) wired in via env-var fallback

---

## ❌ Still to do — blockers for submission

### 1. RevenueCat Android key still on test value
File: `frontend/src/services/subscriptionConfig.ts`
- iOS key updated to `appl_dlPWYCpfkFXqVnzQURnNcsgipRl` (production)
- Android key still on test value — set up Android app in RevenueCat
  dashboard once an Android device is available
- Both readable via env vars (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`,
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`) with hardcoded fallback

### 2. Demo account for Apple reviewers (needs Mac)
- ✅ Account created in Supabase: `helmfitness@outlook.com` / `AppleTest123`
- ✅ Credentials entered in App Store Connect Sign-In Information
- ✅ Code change shipped: `Purchases.logIn(supabaseUserId)` is now called
  on auth state change (subscriptionStore.tsx). RC customer ID will
  equal the Supabase user UUID for any signed-in user.
- ✅ `Helm_Full_Sail` entitlement granted (lifetime promo) to the demo
  user UUID `528f94ac-b124-4dc3-98da-8c5b83518fd7` via the
  RevenueCat REST API. Expires year 2226.

NOTE: `__DEV__` bypasses RevenueCat entirely (subscriptionStore.tsx:36).
The steps below need a **release-style build** (TestFlight, EAS preview,
or production) so the SDK actually initialises. They cannot be done
from `expo start` / Metro.

- ⏳ **On Mac**: do an EAS build (preview or production profile) →
  install on simulator or device → open the app and log in as the
  demo user. The entitlement is already attached server-side, so
  `Purchases.getCustomerInfo` should immediately return
  `Helm_Full_Sail` as active and unlock paid features.
- ⏳ **In the app, still logged in as the demo user** (Mac):
  - Log 1 workout (upper-body session, 3–4 exercises, a few sets each)
  - Log 1 run (press start, walk a minute, save — gives reviewers a route)
  - Log 1 day of food entries (breakfast / lunch / dinner)
  - Log 1 bodyweight reading
  - Reason: empty app = "we couldn't evaluate the core feature" rejection
- ⏳ **Test before submission**: log in as the demo user on a fresh
  device, confirm Full Sail unlocks the gated features end-to-end.

To find the Supabase UUID for the demo user:
Supabase dashboard → Authentication → Users → click the helmfitness
row → copy the UUID at the top of the detail panel.

### 3. App Review Information
In App Store Connect → version page → App Review Information.

**Contact Information**: William Patterson, phone with country code,
email you check daily (Apple may email questions during review).

**Sign-In Information** (toggle on):
- Username: `helmfitness@outlook.com`
- Password: `AppleTest123`

**Notes** field — paste this draft (edit if any tab/feature names are
off):

```
Hi reviewer,

Thanks for reviewing Helm. Below is a quick walkthrough of the
core flows so you can evaluate the app efficiently.

DEMO ACCOUNT
The provided account (helmfitness@outlook.com) has been granted
the "Helm_Full_Sail" entitlement via RevenueCat, so all premium
features are unlocked without making a real purchase. The account
is pre-loaded with a sample workout, a sample run, food entries,
and a bodyweight reading.

CORE FLOWS TO TEST

1. Strength training (free)
   - Tap the Strength tab, then "Start Workout"
   - Add an exercise from the library, log a set, mark a PR

2. Cardio with GPS (free)
   - Tap the Cardio tab, then "Start Run"
   - The app will request "Always" location permission so GPS
     tracking works when the screen is off (used only during
     active runs, never in the background otherwise)

3. Nutrition logging (free, with paid extras)
   - Tap the Nutrition tab, then add a meal
   - Premium: barcode scanner (camera permission) and
     micronutrient tracking — both unlocked for this account

4. Progress tracking (free, with paid extras)
   - Tap the Progress tab to view weight + measurements
   - Premium: progress photos (photo library permission) — unlocked

5. Paywall flow (the "Full Sail" subscription)
   - Tap Account → Subscription, or any locked feature in
     "More Tools" — opens the paywall with monthly + annual options
   - This account already has the entitlement, so a real purchase
     is not required to test the paid features

DATA SOURCES (attribution in-app on the Account screen)
- Maps: OpenStreetMap data, OpenFreeMap tiles
- Food: USDA FoodData Central + Open Food Facts
- Subscriptions: RevenueCat (StoreKit 2)

PERMISSIONS RATIONALE
- Location (always): outdoor run GPS tracking; only active during runs
- Camera: barcode scanning for food logging
- Photo Library: progress photos feature

If you have any questions or need additional info during the review,
please email helmfitness@outlook.com — I respond within 24 hours.

Thanks,
William
```

**Attachment**: skip (you can attach a screen recording later if a
review note asks for one).

### 4. Pricing and Availability ✅
- Price: Free
- Availability: all countries except mainland China
  (China deselected due to ICP/PIPL compliance burden for indie devs)
- Pre-orders: off
- Release: manual (we press the go-live button after Apple approval)

### 5. Screenshots (the biggest time sink)
Required sizes:
- **iPhone 6.9"** (iPhone 16 Pro Max, 1290×2796) — at least 1, up to 10
- **iPad 13"** (2064×2752) — required because `supportsTablet: true`

Can be:
- Actual app screenshots (simplest)
- Device-framed screenshots with marketing copy overlays
- Some mix of the two

### 6. Production build
Upload the actual IPA to App Store Connect:
- Expo path: `eas build -p ios --profile production`
- Upload via EAS auto-submit or Transporter
- Build must have the photo library permission and production
  RevenueCat keys

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
