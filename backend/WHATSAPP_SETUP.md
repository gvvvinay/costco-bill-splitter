# WhatsApp Cloud API Setup Guide

## Quick Overview
To send WhatsApp messages, you need three credentials from Meta (Facebook):
1. **Access Token** – authenticates API calls
2. **Phone Number ID** – your WhatsApp Business Account's phone
3. **Recipient Number** – the target phone in E.164 format (e.g., +14255550123)

## Step-by-Step Setup

### 1. Create a Meta Business Account (if you don't have one)
- Go to [business.facebook.com](https://business.facebook.com)
- Sign up or log in with your Facebook account
- Create a new Business Account

### 2. Set Up WhatsApp Business Account
- In Business Manager, go to **Apps & Websites** → **Apps**
- Click **Create App**
- Choose **Business Type** and fill in details
- Alternatively, if you already have a WhatsApp Business Account, link it to your Business Manager

### 3. Get Your Permanent Access Token
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Navigate to **My Apps** → select your app
3. Go to **Settings** → **Basic** (copy your App ID and App Secret)
4. Go to **Tools** → **Access Token Generator**
5. Select your app and generate a token
6. For production, create a **System User**:
   - In Business Manager → **Users** → **System Users**
   - Create a new System User with **Admin** role
   - Generate a permanent access token (valid for 60+ days)
7. Copy the token and save it

### 4. Get Your Phone Number ID
1. In your app dashboard, go to **WhatsApp** → **Getting Started**
2. You'll see a test phone number provided by Meta (for sandbox testing)
3. Click on it to reveal the **Phone Number ID**
4. Copy and save this ID

**For Production:**
- Connect your actual WhatsApp Business Account number
- Go to **WhatsApp** → **Phone Numbers**
- Find your verified number and copy its ID

### 5. Set Your Recipient Number
- Use your personal phone number or any test number
- Format must be **E.164**: `+[country code][number]`
  - Example: `+14255550123` (US)
  - Example: `+447911123456` (UK)
  - Example: `+919876543210` (India)

### 6. Test Sandbox (Free)
Meta provides a **test phone number** for free testing:
1. App Dashboard → **WhatsApp** → **Getting Started**
2. You'll see a **Test Number** already provided
3. Use this for initial testing without production setup

**Sandbox Testing:**
- Phone Number ID: provided in dashboard
- Test numbers: available in the Getting Started tab
- Access Token: same as above
- Unlimited free messages during development

### 7. Fill in Your .env
Once you have the values, update `backend/.env`:

```env
WHATSAPP_ACCESS_TOKEN="EAABsbCS1iHgBAQXXXXXXXX..."
WHATSAPP_PHONE_NUMBER_ID="102401234567890"
WHATSAPP_RECIPIENT_NUMBER="+14255550123"
```

### 8. Test Sending
Run the test script:
```powershell
cd c:\tmp\costco-bill-splitter\backend
npx tsx src/scripts/sendWhatsAppNow.ts
```

Expected output (if successful):
```
📲 Sending WhatsApp summary to +14255550123 using userId=...
✅ WhatsApp summary sent successfully.
```

If it fails:
- Check credentials are correct (no extra spaces)
- Verify phone numbers are E.164 format
- Test number must be verified in sandbox settings
- Access token must have `whatsapp_business_messaging` permission

---

## Quick Reference: Finding Your Values

| Value | Where to Find |
|-------|---|
| **Access Token** | [developers.facebook.com](https://developers.facebook.com) → My Apps → Your App → Tools → Access Token Generator (or System User tokens) |
| **Phone Number ID** | App Dashboard → WhatsApp → Getting Started (sandbox) or WhatsApp → Phone Numbers (production) |
| **Recipient Number** | Your phone number in E.164 format (e.g., +1-425-555-0123 → +14255550123) |

## Useful Links
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Business Manager](https://business.facebook.com)
- [Developer Dashboard](https://developers.facebook.com)
- [Test Your API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)

## Common Issues

**"Invalid phone number"**
- Ensure E.164 format: +[country][area][number]
- Remove dashes, spaces, or parentheses

**"Invalid access token"**
- Token may have expired (refresh in dashboard)
- Check token has `whatsapp_business_messaging` permission

**"Phone number not in sandbox"**
- Add it to sandbox in WhatsApp → Getting Started → Add test numbers

---

Once you've filled in `.env`, restart the backend and the scheduler will send WhatsApp summaries at 8 PM daily, and you can manually trigger anytime with the test script.
