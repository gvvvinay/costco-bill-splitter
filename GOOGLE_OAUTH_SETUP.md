# Google OAuth Setup Instructions

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Costco Bill Splitter")
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type → Click "Create"
3. Fill in required fields:
   - App name: Costco Bill Splitter
   - User support email: your email
   - Developer contact email: your email
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Skip "Test users" → Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Costco Bill Splitter Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
6. Add Authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3001`
7. Click "Create"
8. Copy your Client ID

## Step 5: Update Your Application

1. Open `frontend/.env`
2. Replace `your-google-client-id-here` with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```
3. Save the file
4. Restart your development server

## Testing

1. Go to http://localhost:3000/login
2. You should see a "Sign in with Google" button
3. Click it to test the login flow

## Important Notes

- The Client ID is safe to expose in frontend code
- Never commit the `.env` file with real credentials to public repositories
- For production, add your production domain to the authorized origins and redirect URIs
- The first time you sign in with Google, you'll need to consent to sharing your email and profile

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure http://localhost:3000 is added to Authorized JavaScript origins in Google Cloud Console

### "Error 401: invalid_client"
- Double-check that your Client ID is correctly copied to the .env file
- Make sure there are no extra spaces

### Google button doesn't appear
- Check the browser console for errors
- Verify the .env file is in the frontend directory
- Restart the development server after updating .env
