# iOS Local Dev Build for Background Location (Expo)

Background location on iOS requires a development build because Expo Go does not
support background execution. To test on a real iPhone, use a local Xcode build.

## Why Expo Go won't work
- Background location uses TaskManager + native background execution.
- Expo Go does not support background tasks on iOS.

## Local Xcode dev build (Mac + iPhone)
1) Install Xcode and open it once.
2) Add the dev client dependency:
   ```bash
   npx expo install expo-dev-client
   ```
3) Plug in your iPhone, trust the computer, and enable iOS Developer Mode
   (required on iOS 16+).
4) From the app folder (likely `frontend/`), run:
   ```bash
   npx expo run:ios --device
   ```
   This will generate native iOS project files (prebuild) and build the app
   locally with Xcode onto your device.

## Notes
- You will need to grant "Always" location permission to test background
  tracking.
- Background tracking will not work in Expo Go; use the dev build.
