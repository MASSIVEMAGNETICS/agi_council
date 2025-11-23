# OmniForge Council Mobile

Native iOS and Android applications built with Capacitor.

## Prerequisites

- Node.js 18+
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio with SDK 33+

## Setup

```bash
# Install dependencies
npm install

# Build web assets
npm run build:web

# Sync with mobile platforms
npx cap sync

# Open in IDE
npx cap open ios      # Open in Xcode
npx cap open android  # Open in Android Studio
```

## Development

```bash
# Live reload on mobile devices
npx cap run ios --livereload --external
npx cap run android --livereload --external
```

## Build for Production

### iOS
1. Open in Xcode: `npx cap open ios`
2. Select your signing team
3. Archive and upload to App Store Connect

### Android
1. Open in Android Studio: `npx cap open android`
2. Generate signed APK/AAB
3. Upload to Google Play Console

## Features

- Native iOS and Android apps
- Offline support with local storage
- Push notifications
- Biometric authentication
- Deep linking support
- Share functionality
- Native UI components

## App Store Submission

### iOS App Store
- Bundle ID: `com.massivemagnetics.omniforge`
- Version: Auto-synced from package.json
- Category: Productivity

### Google Play Store
- Package name: `com.massivemagnetics.omniforge`
- Version: Auto-synced from package.json
- Category: Productivity

## Platform-Specific Code

Platform-specific implementations are in:
- `platforms/mobile/ios/` - iOS native code
- `platforms/mobile/android/` - Android native code
