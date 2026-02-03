# 🚀 SplitFair - Google Play Store Publishing Steps

## Quick Checklist

- [ ] Java JDK 11+ installed
- [ ] Android SDK installed
- [ ] Signing keystore created
- [ ] APK/AAB built
- [ ] Google Play Console account created
- [ ] App listing created
- [ ] Release submitted

---

## ⚡ Quick Start Commands

### 1. Verify Prerequisites
```powershell
# Check Java
java -version

# Check if Android SDK is available
echo $env:ANDROID_HOME
```

### 2. Build for Play Store
```powershell
cd c:\tmp\costco-bill-splitter\android

# Build release bundle (recommended for Play Store)
.\gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Sign the Bundle
If you haven't created a keystore yet:
```powershell
cd c:\tmp\costco-bill-splitter\android\app

# Create keystore (one-time only!)
keytool -genkey -v -keystore splitfair-release.keystore `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias splitfair-key

# Password: (choose and remember this!)
# Questions: Answer with your info
```

---

## 📱 Google Play Console Setup

### Step 1: Create Account
1. Go to https://play.google.com/console
2. Sign in with Google account
3. Click **Create app**
4. App name: **SplitFair**
5. Category: **Finance** or **Productivity**

### Step 2: Complete Store Listing
- **Description**: "Split bills transparently with friends. Automatic calculations, real-time notifications, and fair settlements."
- **Short description**: "Split bills fairly with friends"
- **Screenshots**: At least 2 (you can use device emulator screenshots)
- **Feature graphic**: 1024×500 PNG
- **Privacy policy**: https://yourwebsite.com/privacy (required)
- **Contact email**: your-email@gmail.com

### Step 3: Upload Release
1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release.aab` file
4. Add release notes:
   ```
   SplitFair v1.0.0
   
   - Split bills transparently with friends
   - Automatic settlement calculations
   - Real-time notifications
   - Secure Google OAuth login
   - Email summaries
   ```
5. Review and submit

---

## 🔐 Important Security Notes

**Before Publishing:**
- [ ] Update backend API URL (from localhost to production)
- [ ] Enable HTTPS for all API calls
- [ ] Set up privacy policy page
- [ ] Review app permissions
- [ ] Test on real Android device
- [ ] Remove test users from database

---

## 📞 Need Help?

If you get stuck on any step, let me know:
- "I don't have Java/Android SDK installed"
- "How do I create screenshots?"
- "Where do I set privacy policy?"
- "Build is failing"

I'll help you fix it! 💪
