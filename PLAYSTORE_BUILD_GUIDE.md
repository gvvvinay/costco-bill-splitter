# SplitFair - Play Store Publishing Guide

## ✅ Setup Complete

Your React web app has been converted to an Android app using **Capacitor**!

### What Was Done:
- ✅ Installed Capacitor framework
- ✅ Built frontend for production (`frontend/dist`)
- ✅ Added Android platform
- ✅ Synced web assets to Android project
- ✅ Created `android/` directory with buildable project

---

## 📋 Prerequisites for Publishing

Before building the APK/AAB, you need:

### 1. **Java Development Kit (JDK)**
```powershell
# Check if JDK is installed
java -version
# Should be JDK 11 or higher

# If not installed:
winget install Oracle.JDK.21
```

### 2. **Android SDK**
```powershell
# Install Android Studio (includes SDK)
winget install Google.AndroidStudio

# OR set ANDROID_HOME environment variable manually
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

### 3. **Gradle** (usually included with Android Studio)
```powershell
# Verify gradle installation
gradle --version
```

---

## 🔑 Create Signing Certificate

Google Play requires all APKs to be signed with a signing certificate.

### Generate Keystore File:
```powershell
cd c:\tmp\costco-bill-splitter\android\app

# Create signing key (one-time)
keytool -genkey -v -keystore splitfair-release.keystore `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias splitfair-key

# Follow prompts:
# - Keystore password: (create strong password)
# - Key password: (same as keystore)
# - Common Name: Your Name
# - Organization: Your Company
# - Locality: City
# - State: State
# - Country: US (or your code)
```

**Important:** Save this keystore file securely. You'll need it for all future updates!

---

## 🏗️ Build APK for Testing

### Build Debug APK:
```powershell
cd c:\tmp\costco-bill-splitter\android

# Build debug APK (for testing)
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Test on Phone:
```powershell
# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or drag APK into Android Studio's Device Manager
```

---

## 📦 Build Release APK/AAB for Play Store

### Build Release APK:
```powershell
cd c:\tmp\costco-bill-splitter\android

# Build release APK (signed)
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### OR Build App Bundle (Recommended):
```powershell
# App Bundles are smaller and Google Play handles optimization
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📱 Upload to Google Play Console

### 1. **Create Google Play Console Account**
   - Go to https://play.google.com/console
   - Sign in with Google account
   - Accept terms

### 2. **Create New App**
   - Click "Create app"
   - App name: "SplitFair"
   - Default language: English
   - Category: Finance or Productivity
   - Content rating: Fill out questionnaire

### 3. **Set Up App Signing**
   - Go to: **Release** → **Setup** → **App Signing**
   - Option A: Let Google Play handle signing (recommended)
   - Option B: Upload your signing keystore

### 4. **Complete Store Listing**
   - **Branding**: Add app icon, screenshots (5 minimum), feature graphic
   - **Description**: Write compelling description
   - **Screenshots**: Show bill splitting, settlements, dashboard
   - **Video**: Optional promotional video
   - **Contact details**: Email, website, privacy policy

### 5. **Set Up Pricing & Distribution**
   - Pricing: Free (or Premium)
   - Countries: Select target markets
   - Content rating: Complete questionnaire

### 6. **Create Release**
   - Go to: **Release** → **Production**
   - Click "Create new release"
   - Upload your `.aab` file
   - Add release notes:
     ```
     Initial Release
     - Split bills transparently with friends
     - Automatic settlements
     - Real-time notifications
     - Google OAuth & email login
     ```
   - Review and submit

### 7. **Submit for Review**
   - Review all info
   - Click "Submit for review"
   - Google reviews (typically 24-48 hours)
   - App goes live! 🎉

---

## 🔄 Update Workflow

### For Future Updates:

1. **Update web app**
   ```powershell
   cd c:\tmp\costco-bill-splitter\frontend
   npm run build
   ```

2. **Sync to Android**
   ```powershell
   cd c:\tmp\costco-bill-splitter
   npx cap sync
   ```

3. **Update version number** in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1 for each release
   versionName "1.1.0"
   ```

4. **Build AAB**
   ```powershell
   cd c:\tmp\costco-bill-splitter\android
   ./gradlew bundleRelease
   ```

5. **Upload to Play Store** (same process as step 6 above)

---

## 🎨 App Icons & Screenshots

### Required Assets:
- **App Icon**: 512×512 PNG (no rounded corners, will be applied by system)
- **Feature Graphic**: 1024×500 PNG
- **Screenshots**: 
  - Minimum 2, recommended 5
  - 1080×1920 or 1440×2560 (9:16 aspect ratio)
  - Show: Login, Dashboard, Bill split, Settlements

### Create Professional Screenshots:
1. Use MockUp tools (free): https://www.mockup.design/
2. Frame9 or AppMockUp.co
3. Or create in Figma

---

## 🚀 CLI Commands Cheatsheet

```powershell
# Build process
npm run build                          # Build web app
npx cap sync                          # Sync to Android

# Testing
./gradlew assembleDebug               # Debug APK
adb install app-debug.apk             # Install on device

# Production
./gradlew bundleRelease               # Release bundle (.aab)
./gradlew assembleRelease             # Release APK (.apk)

# Signing (if manual)
jarsigner -verbose -sigalg SHA1withRSA `
  -digestalg SHA1 -keystore keystore.jks `
  app-release-unsigned.apk alias_name
```

---

## 🔐 Security Notes

### Before Publishing:
- ✅ Update backend API URLs for production
- ✅ Enable HTTPS for all API calls
- ✅ Review permissions in `android/app/src/main/AndroidManifest.xml`
- ✅ Add privacy policy URL
- ✅ Set up Google OAuth consent screen properly
- ✅ Remove debug logs and test users

### Post-Launch Monitoring:
- Monitor crash reports in Play Console
- Check user reviews regularly
- Track metrics (installs, crashes, ratings)

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Android Build Guide**: https://developer.android.com/build
- **Gradle Docs**: https://gradle.org/guides/

---

## ✨ Next Steps

1. Install Java JDK and Android SDK
2. Generate signing keystore
3. Build release AAB
4. Create Play Store listing
5. Upload and submit for review
6. Launch and monitor! 🚀

Good luck publishing SplitFair! 💰
