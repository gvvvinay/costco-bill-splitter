# SplitFair - Play Store Publishing Guide

## Current Status ✅

- ✅ Java JDK 21 installed
- ✅ Android Studio installed
- ✅ Capacitor Android project created
- ✅ Frontend production build completed
- ✅ Signing keystore generated: `android/app/splitfair-release.keystore`
- ✅ build.gradle configured with signing
- ⏳ SDK components need installation

## Step 1: Complete Android SDK Setup

### Option A: Using Android Studio (Recommended)

1. **Find Android Studio** in your Start menu and launch it
2. **Accept the license** on first launch
3. **Complete the wizard** (let it download default packages)
4. Go to **Tools > SDK Manager**
5. Ensure these are installed:
   - **SDK Platforms tab**: Android 14 (API 34) or Android 15 (API 35)
   - **SDK Tools tab**:
     - Android SDK Build-Tools 35.0.0 (or latest)
     - Android Emulator (optional)
     - Android SDK Platform-Tools

6. **Close Android Studio** and continue to Step 2

### Option B: Manual SDK Installation

```powershell
# Download command-line tools
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
mkdir -p "$sdkPath\cmdline-tools\latest" -Force
cd "$sdkPath"

# Download and extract (you can download manually and extract)
# Then add to Path: $env:ANDROID_HOME = "$sdkPath"
# And install: sdkmanager "platforms;android-35" "build-tools;35.0.0"
```

## Step 2: Build Release Android App Bundle

Once SDK is installed, run:

```powershell
cd c:\tmp\costco-bill-splitter\android
.\gradlew.bat bundleRelease
```

**Expected Output:**
```
BUILD SUCCESSFUL in XXs
```

**Output Location:**
- `android/app/build/outputs/bundle/release/app-release.aab`

## Step 3: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay the **$25 one-time developer fee**
4. Complete your **Developer Profile**:
   - Display name
   - Contact email
   - Website (optional)

## Step 4: Create App on Play Console

1. Click **"Create new app"**
2. Fill in:
   - **App name**: SplitFair
   - **Default language**: English
   - **App type**: Application
   - **Category**: Finance or Productivity
   - **Free or paid**: Free
3. Click **Create**

## Step 5: Configure App Store Listing

### Basic Info
- **Title**: SplitFair
- **Short description** (80 chars):
  > Split bills with friends instantly. Fair, accurate, hassle-free bill splitting.

- **Full description** (4000 chars max):
  ```
  SplitFair makes splitting bills with friends quick and easy.
  
  Key Features:
  ✓ Instant bill splitting with multiple participants
  ✓ Receipt OCR scanning for automatic item recognition
  ✓ Dual authentication (email/password or Google OAuth)
  ✓ Automatic settlement calculations
  ✓ Email & WhatsApp summaries
  ✓ Detailed activity reports
  ✓ Offline support
  ✓ Beautiful, intuitive interface
  
  Perfect for:
  • Group dinners and parties
  • Roommate expenses
  • Travel groups
  • Shared subscriptions
  
  Simply upload a receipt, add participants, and we'll calculate who owes whom instantly!
  ```

### Graphics (Required)
1. **App Icon** (512x512 PNG):
   - Create a simple icon representing bills/money splitting
   - Can use a stylized "$" or money symbol

2. **Feature Graphic** (1024x500 PNG):
   - Header image for the app listing
   - Show app name and key value proposition

3. **Screenshots** (Minimum 2, recommended 5):
   - 1080x1920 PNG or JPEG (phone)
   - Show:
     1. Dashboard with balance display
     2. Receipt upload interface
     3. Bill split results
     4. Settlement summary
     5. Activity report

4. **Video** (Optional):
   - 30-60 second walkthrough video

### Content Ratings Questionnaire
1. Go to **Content ratings > Questionnaire**
2. Fill out the rating form (10 minutes)
3. Get your age rating (usually 12+ for finance apps)

### Target Audience & Content
- **Target audience**: 13+ years old
- **Content declarations**: Select relevant categories

## Step 6: Upload App Bundle & Submit

1. **Go to Release > Production**
2. **Create new release**
3. **Upload the AAB file**:
   - Click "Browse files"
   - Select `android/app/build/outputs/bundle/release/app-release.aab`
4. **Fill in Release notes**:
   ```
   Initial release of SplitFair
   - Fair bill splitting for groups
   - Receipt OCR support
   - Email and WhatsApp notifications
   ```
5. **Review all details** one more time
6. **Click "Submit release for review"**

## Step 7: Wait for Review

- **Timeline**: Usually 2-3 hours, but can take up to 24 hours
- **Check status**: Release tab > Production > View releases
- **Monitoring**: You'll get emails about approval/rejection

## If Rejected

Common reasons:
- **Privacy Policy**: Must be clear and accessible
- **Age rating**: Must match content
- **Crash on startup**: Ensure backend URL is correct
- **Permissions**: Must explain why each permission is needed

**To resubmit**: Fix issues and upload new AAB with incremented versionCode

## Keystroke Details (For Reference)

**Keystore Info:**
```
Location: android/app/splitfair-release.keystore
Alias: splitfair-key
Password: splitfair2025
Key Password: splitfair2025
Validity: 10000 days (27 years)
```

**DO NOT LOSE THIS KEYSTORE!** You'll need it for every future update.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with SDK error | Launch Android Studio once to auto-install SDKs |
| AAB file not generated | Check `android/app/build` directory, rebuild with `./gradlew clean bundleRelease` |
| Play Console rejects app | Check privacy policy link, ensure backend is accessible |
| Can't install on testing device | Generate APK instead: `./gradlew assembleRelease` |

## Future Updates

For version updates:
1. Increment `versionCode` in `android/app/build.gradle`
2. Update `versionName` (e.g., "1.1")
3. Rebuild: `./gradlew bundleRelease`
4. Upload new AAB to Play Console
5. Submit for review

## Important Links

- **Google Play Console**: https://play.google.com/console
- **Android Gradle Plugin**: https://developer.android.com/build
- **App Bundle Format**: https://developer.android.com/guide/app-bundle
- **Privacy Policy Template**: https://www.termsfeed.com/privacy-policy

## Backend URL Configuration

Make sure your backend is accessible from the app. The app connects to:
```
https://your-backend-url/api/...
```

If deploying backend, update:
1. `capacitor.config.json` - serverUrl if needed
2. `frontend/src/lib/api.ts` - API_BASE_URL
3. Rebuild and re-sync: `npx cap sync android`

---

**Next Step**: Launch Android Studio, complete SDK setup, then run `./gradlew bundleRelease`
