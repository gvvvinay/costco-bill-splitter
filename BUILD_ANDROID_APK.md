# Building Android APK for Play Store

## Current Status

✅ Java JDK 21 installed at: `C:\Program Files\Java\jdk-21.0.10\`
⏳ Android Studio installing (monitor in terminal)
✅ Environment variables configured
✅ Capacitor Android project synced

## Prerequisites Checklist

- [x] Java JDK 21 installed
- [ ] Android Studio installed (in progress)
- [ ] Android SDK API levels 28+ installed (via Android Studio)
- [ ] Gradle available

## Step 1: Complete Android Studio Installation

Android Studio is currently downloading. Once installation completes:

1. Launch Android Studio
2. Accept the license agreement
3. Let it download SDK components automatically
4. Ensure you have API level 28+ installed (Settings > SDK Manager > SDK Platforms)
5. Note the SDK location (usually `C:\Users\YourUsername\AppData\Local\Android\Sdk`)

## Step 2: Set Permanent Environment Variables

Once Android Studio finishes, open Command Prompt as Administrator and run:

```batch
setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.10"
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

Then **close and reopen all terminals** for changes to take effect.

## Step 3: Verify Environment Setup

```bash
java -version
# Should show: java version "21.0.10" 2026-01-20 LTS

echo %JAVA_HOME%
# Should show: C:\Program Files\Java\jdk-21.0.10

echo %ANDROID_HOME%
# Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk
```

## Step 4: Generate Signing Keystore

Create a keystore for signing your app (required for Play Store):

```bash
cd C:\tmp\costco-bill-splitter\android\app

keytool -genkey -v -keystore splitfair-release.keystore ^
  -alias splitfair-key ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -storepass YOUR_SECURE_PASSWORD ^
  -keypass YOUR_SECURE_PASSWORD
```

**Important**: Replace `YOUR_SECURE_PASSWORD` with a strong password and save it securely!

This creates `splitfair-release.keystore` file.

## Step 5: Configure Signing in Gradle

Edit `android\app\build.gradle` and add after `android {`:

```gradle
signingConfigs {
    release {
        storeFile file("splitfair-release.keystore")
        storePassword "YOUR_SECURE_PASSWORD"
        keyAlias "splitfair-key"
        keyPassword "YOUR_SECURE_PASSWORD"
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

## Step 6: Build Release APK

Navigate to Android project directory and build:

```bash
cd C:\tmp\costco-bill-splitter\android

# On Windows:
gradlew.bat bundleRelease
# OR for APK:
gradlew.bat assembleRelease

# Output will be in:
# - app/build/outputs/bundle/release/app-release.aab (for Play Store - PREFERRED)
# - app/build/outputs/apk/release/app-release.apk (direct APK install)
```

**Note**: `.aab` (Android App Bundle) is now required by Play Store. Use `bundleRelease`.

## Step 7: Prepare for Play Store Submission

1. **Create Google Play Console Account**
   - Go to https://play.google.com/console
   - Sign in with your Google account
   - Pay $25 one-time developer fee

2. **Create New App**
   - App name: "SplitFair"
   - Category: Finance
   - Content rating form (fill out)

3. **Upload Release Bundle**
   - Go to Release > Production
   - Upload `app/build/outputs/bundle/release/app-release.aab`

4. **Fill Out App Details**
   - Screenshots (5-8 recommended)
   - App description
   - Privacy policy URL
   - Contact email
   - Content rating
   - Target audience

5. **Review & Submit**
   - Check all requirements
   - Click "Submit for review"
   - Google will review within 2-3 hours

## Troubleshooting

**Problem**: `gradlew.bat: Command not found`
- **Solution**: Make sure you're in the `android` directory (not `android\app`)
- Run: `cd android` then `gradlew.bat bundleRelease`

**Problem**: `JAVA_HOME not set`
- **Solution**: Run: `setx JAVA_HOME "C:\Program Files\Java\jdk-21.0.10"` in Command Prompt as admin, then restart terminal

**Problem**: `SDK not found`
- **Solution**: Ensure Android Studio completed installation. Check: `%LOCALAPPDATA%\Android\Sdk` exists and contains `platforms`, `tools`, `platform-tools`

**Problem**: Keystore password wrong
- **Solution**: If you forget the password, delete the keystore file and regenerate with Step 4

## Next Actions

1. Monitor Android Studio installation (should complete within 5-10 minutes)
2. Once complete, verify environment variables are set permanently
3. Generate keystore with Step 4
4. Build the release bundle with Step 6
5. Create Play Store account and submit app

## Key Files

- Frontend build: `frontend/dist/` (production-ready)
- Capacitor config: `capacitor.config.json`
- Android manifest: `android/app/src/main/AndroidManifest.xml`
- Gradle wrapper: `android/gradlew` (Linux/Mac) or `android/gradlew.bat` (Windows)
- App build config: `android/app/build.gradle`
- Signing keystore: `android/app/splitfair-release.keystore` (after Step 4)

## Resources

- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Capacitor Deploy Guide](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Signing Documentation](https://developer.android.com/studio/publish/app-signing)
