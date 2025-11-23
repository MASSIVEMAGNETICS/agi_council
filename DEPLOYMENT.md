# Platform Deployment Guide

## Table of Contents

1. [Web Application (PWA)](#web-application-pwa)
2. [iOS Application](#ios-application)
3. [Android Application](#android-application)
4. [Windows Desktop](#windows-desktop)
5. [Legacy Runtime](#legacy-runtime)
6. [CI/CD Pipeline](#cicd-pipeline)

---

## Web Application (PWA)

### Development

```bash
# Start development server
npm run dev:client

# Build for production
npm run build:web
```

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

```bash
# Build
npm run build:web

# Deploy dist/web folder to your hosting provider
```

#### Option 2: Self-Hosted with Node.js

```bash
# Build
npm run build:web

# Start API server (serves static files)
npm start
```

#### Option 3: Docker Container

```bash
# Build Docker image
docker build -t omniforge-web -f Dockerfile.web .

# Run container
docker run -p 3000:3000 omniforge-web
```

### PWA Features

- Offline support with service workers
- Install to home screen
- Push notifications
- Background sync
- App-like experience

### Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://api.yourdomaincom
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_APP_NAME=OmniForge Council
```

---

## iOS Application

### Prerequisites

- macOS with Xcode 14+
- Apple Developer Account ($99/year)
- CocoaPods installed

### Setup

```bash
# Install dependencies
npm install

# Build web assets
npm run build:web

# Add iOS platform
npx cap add ios

# Sync
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Development

```bash
# Live reload during development
npx cap run ios --livereload --external --host=YOUR_IP
```

### App Store Submission

1. **Configure in Xcode**
   - Set Bundle Identifier: `com.massivemagnetics.omniforge`
   - Select your Development Team
   - Configure signing certificates

2. **Build Archive**
   - Product → Archive
   - Wait for archive to complete

3. **Upload to App Store Connect**
   - Distribute App → App Store Connect
   - Upload and wait for processing

4. **Submit for Review**
   - Add app metadata, screenshots, privacy policy
   - Submit for Apple review (typically 1-3 days)

### App Configuration

Edit `platforms/mobile/ios/App/App/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>OmniForge Council</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
```

### Required Assets

- App Icon: 1024x1024px (all sizes auto-generated)
- Screenshots: Per device size requirements
- Privacy Policy URL

---

## Android Application

### Prerequisites

- Android Studio
- Android SDK 33+
- Java Development Kit (JDK) 11+

### Setup

```bash
# Install dependencies
npm install

# Build web assets
npm run build:web

# Add Android platform
npx cap add android

# Sync
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Development

```bash
# Live reload during development
npx cap run android --livereload --external --host=YOUR_IP
```

### Google Play Submission

1. **Generate Signing Key**

```bash
keytool -genkey -v -keystore omniforge-release.keystore -alias omniforge -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Gradle**

Edit `platforms/mobile/android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../omniforge-release.keystore")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "omniforge"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
}
```

3. **Build Release APK/AAB**

```bash
cd platforms/mobile/android
./gradlew bundleRelease  # For AAB (recommended)
# or
./gradlew assembleRelease  # For APK
```

4. **Upload to Google Play Console**
   - Create app listing
   - Upload AAB file
   - Add screenshots, description
   - Submit for review

### App Configuration

Edit `platforms/mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<manifest package="com.massivemagnetics.omniforge">
    <application android:label="OmniForge Council">
    </application>
</manifest>
```

---

## Windows Desktop

### Prerequisites

- Node.js 18+
- Windows 10/11 or Wine on macOS/Linux

### Development

```bash
# Start dev mode (web + API)
npm run dev

# Or run separately
npm run dev:server  # API on port 3001
npm run dev:client  # Web on port 3000
```

### Build Executable

```bash
# Build desktop app
npm run build:desktop

# Output: release/OmniForge Council Enterprise-{version}-win-x64.exe
```

### Distribution Options

#### Option 1: NSIS Installer (Recommended)

- Provides installation wizard
- Creates Start Menu shortcuts
- Adds to Add/Remove Programs
- File: `OmniForge Council Enterprise-{version}-win-x64.exe`

#### Option 2: Portable Executable

- No installation required
- Run from any location
- File: `OmniForge Council Enterprise-{version}-win-x64-portable.exe`

### Auto-Update Configuration

Edit `electron-builder.json`:

```json
{
  "publish": {
    "provider": "github",
    "owner": "MASSIVEMAGNETICS",
    "repo": "agi_council"
  }
}
```

### Code Signing (Optional but Recommended)

1. Obtain code signing certificate
2. Configure in `electron-builder.json`:

```json
{
  "win": {
    "certificateFile": "cert.pfx",
    "certificatePassword": "PASSWORD"
  }
}
```

---

## Legacy Runtime

The original runtime is preserved for backward compatibility.

### Running Legacy Version

```bash
# Development
npm run dev:legacy

# Build
npm run build:legacy

# Production
npm start:legacy
```

### Migration Path

Users can migrate from legacy to enterprise version:

1. Export data from legacy runtime
2. Import into enterprise version
3. Verify functionality
4. Decommission legacy instance

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy All Platforms

on:
  push:
    tags:
      - 'v*'

jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:web
      - uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: dist/web

  build-desktop:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:desktop
      - uses: actions/upload-artifact@v3
        with:
          name: desktop-build
          path: release

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:web
      - run: npx cap sync ios
      # Add Fastlane or manual build steps

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:web
      - run: npx cap sync android
      # Add Gradle build steps
```

### Automated Testing

```bash
# Run all tests before deployment
npm test

# Generate coverage report
npm run test:coverage
```

### Version Management

Use semantic versioning in `package.json`:

```json
{
  "version": "2.0.0"
}
```

Versions sync automatically across:
- Web app
- Desktop app
- iOS app (CFBundleVersion)
- Android app (versionName)

---

## Monitoring & Analytics

### Production Monitoring

- **Uptime**: Pingdom, UptimeRobot
- **Performance**: New Relic, Datadog
- **Errors**: Sentry
- **Analytics**: Google Analytics, Mixpanel

### Health Checks

```bash
# API health check
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 86400,
  "version": "2.0.0"
}
```

---

## Support & Maintenance

### Update Schedule

- **Security patches**: Immediate
- **Bug fixes**: Weekly
- **Feature releases**: Monthly
- **Major versions**: Quarterly

### Rollback Procedure

If issues arise post-deployment:

1. Revert to previous version tag
2. Redeploy using CI/CD
3. Notify users of rollback
4. Investigate and fix issues
5. Deploy again after verification

---

## Platform-Specific Notes

### Web (PWA)
- Works on all modern browsers
- Progressive enhancement for older browsers
- Responsive design (mobile/tablet/desktop)

### iOS
- Requires iOS 13+
- App Store review time: 1-3 days
- TestFlight for beta testing

### Android
- Requires Android 8.0+ (API 26)
- Google Play review time: Hours to 1 day
- Internal testing track available

### Windows
- Requires Windows 10+
- No app store submission required
- Direct download from website

### Legacy
- Maintained for existing users
- Security updates only
- Deprecated in v3.0.0

---

## Cost Estimates

### One-Time Costs
- Apple Developer Account: $99/year
- Google Play Developer: $25 (one-time)
- Code signing certificate: $100-500/year (optional)

### Ongoing Costs
- Domain: $10-20/year
- Hosting (web): $5-50/month
- API server: $20-200/month
- Database: $10-100/month
- CDN: $5-50/month
- Monitoring: $0-100/month

**Total estimated monthly cost**: $40-500/month depending on scale

---

## Getting Help

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@massivemagnetics.com
- Discord: [Community Server]

---

**Last Updated**: November 2024  
**Version**: 2.0.0
