# SplitFair - Android Build & Play Store Setup Complete

## ✅ Installation Status

### Completed
- ✅ **Java JDK 21** - Installed at `C:\Program Files\Java\jdk-21.0.10\`
- ✅ **Android Studio** - Successfully installed
- ✅ **Environment Variables** - Configured:
  - `JAVA_HOME = C:\Program Files\Java\jdk-21.0.10`
  - `ANDROID_HOME = C:\Users\callm\AppData\Local\Android\Sdk`
- ✅ **Capacitor Android Project** - Ready to build
- ✅ **Frontend Production Build** - Available in `frontend/dist/`

## Next Steps

### 1. Launch Android Studio & Complete Setup (5 minutes)
```powershell
# Run Android Studio
& "C:\Program Files\Android\Android Studio\bin\studio.cmd"
```

First launch will:
- Prompt for license agreement (accept)
- Download SDK components automatically
- Configure Android SDK

### 2. Verify SDK Installation
Once Android Studio opens:
1. Go to **Settings > System Settings > Android SDK**
2. Ensure these are installed:
   - SDK Platform Android 14 (API 34) or higher
   - Android SDK Build Tools (latest)
   - Android Emulator
3. Note the **SDK Path** (usually shown as `C:\Users\callm\AppData\Local\Android\Sdk`)

### 3. Set Permanent Environment Variables
Open **Command Prompt as Administrator** and run:

```batch
setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.10"
setx ANDROID_HOME "C:\Users\callm\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools"
```

**IMPORTANT**: Close all terminals and reopen for changes to take effect.

### 4. Generate Signing Keystore
```powershell
cd C:\tmp\costco-bill-splitter\android\app

# Generate keystore (answer prompts with your details)
&"C:\Program Files\Java\jdk-21.0.10\bin\keytool" -genkey -v -keystore splitfair-release.keystore `
  -alias splitfair-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

When prompted, enter:
- Keystore password: (use a strong password)
- Key password: (same as keystore password)
- First/Last name: Your Name
- Organization: Your Organization
- Country code: US

**Save this password securely!**

### 5. Configure Gradle Signing
Edit `android/app/build.gradle` and add after `android {` block:

```gradle
signingConfigs {
    release {
        storeFile file("splitfair-release.keystore")
        storePassword "YOUR_PASSWORD_HERE"  // From step 4
        keyAlias "splitfair-key"
        keyPassword "YOUR_PASSWORD_HERE"    // From step 4
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 6. Build Release Bundle
```powershell
cd C:\tmp\costco-bill-splitter\android

# Build the App Bundle (required for Play Store)
.\gradlew bundleRelease

# Output location: app/build/outputs/bundle/release/app-release.aab
```

### 7. Create Google Play Developer Account
1. Go to https://play.google.com/console
2. Sign in with Google account
3. Pay **$25 one-time developer fee**
4. Complete developer profile

### 8. Create App on Play Console
1. **Create new app**
   - Name: "SplitFair"
   - Default language: English
   - App type: Application
   - Category: Finance
   - Target audience: Not for children

2. **Complete store listing**
   - Short description (80 chars)
   - Full description (4000 chars max)
   - Screenshots (minimum 2, recommended 5-8)
   - Feature graphic
   - Promotional video (optional)
   - Privacy policy URL (required)

3. **Content rating questionnaire**
   - Fill out to get age rating

4. **Target audience & content**
   - Declare content type
   - Set target age range

### 9. Upload & Publish
1. Go to **Release > Production**
2. Click **Create new release**
3. Upload `app-release.aab` from `android/app/build/outputs/bundle/release/`
4. Review all details
5. Click **Review release** and **Submit**
6. Google reviews within 2-3 hours
7. Once approved, publish to Play Store

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `gradlew` not found | Run from `android` directory, not `android/app` |
| JAVA_HOME not recognized | Run `setx JAVA_HOME "..."` in cmd as admin, restart terminal |
| SDK not found | Ensure Android Studio finished setup, check `%LOCALAPPDATA%\Android\Sdk` |
| Keystore password wrong | Delete keystore file, regenerate with step 4 |
| Build fails | Run `./gradlew clean` then retry `./gradlew bundleRelease` |

## File Locations

| File | Location |
|------|----------|
| Java JDK | `C:\Program Files\Java\jdk-21.0.10\` |
| Android SDK | `C:\Users\callm\AppData\Local\Android\Sdk` |
| Android Studio | `C:\Program Files\Android\Android Studio` |
| Capacitor Config | `c:\tmp\costco-bill-splitter\capacitor.config.json` |
| Android Project | `c:\tmp\costco-bill-splitter\android\` |
| Signing Keystore | `c:\tmp\costco-bill-splitter\android\app\splitfair-release.keystore` |
| Release Bundle | `c:\tmp\costco-bill-splitter\android\app\build\outputs\bundle\release\app-release.aab` |

## App Details for Play Store

- **App Name**: SplitFair
- **Package ID**: com.splitfair.app
- **Version Code**: Auto-increment with each build
- **Min SDK**: Android 7.1 (API 25)
- **Target SDK**: Android 15 (API 35)
- **Architecture**: arm64-v8a, armeabi-v7a

## Key Features to Highlight in Store Listing

✅ Split bills with friends instantly
✅ Dual authentication (email/password + Google OAuth)
✅ Receipt OCR parsing
✅ Automatic settlement calculations
✅ Email & WhatsApp summaries
✅ Activity reports & analytics

## Estimated Timeline

- **Step 1-2**: 5-10 minutes (Android Studio launch)
- **Step 3**: 2 minutes (set env vars)
- **Step 4**: 2 minutes (generate keystore)
- **Step 5**: 3 minutes (edit build.gradle)
- **Step 6**: 10-15 minutes (first build)
- **Steps 7-9**: 30+ minutes (Play Store setup)

**Total**: ~1-2 hours to first submission

## Support Files

- [BUILD_ANDROID_APK.md](BUILD_ANDROID_APK.md) - Detailed step-by-step guide
- [PLAYSTORE_BUILD_GUIDE.md](PLAYSTORE_BUILD_GUIDE.md) - Comprehensive reference
- [android/](android/) - Capacitor Android project (ready to build)
- [capacitor.config.json](capacitor.config.json) - Capacitor configuration

---

**Status**: ✅ All prerequisites installed. Ready to build Android package!
