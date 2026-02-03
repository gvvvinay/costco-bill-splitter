# GitHub Pages Deployment Guide

## ⚠️ Important: Backend Requirement

This app requires a **backend server** to function. GitHub Pages only hosts static files (frontend), so you need to:

### Option 1: Deploy Backend Separately (Recommended)

1. **Deploy backend to a cloud service:**
   - [Railway](https://railway.app/) (Easiest, free tier)
   - [Render](https://render.com/) (Free tier available)
   - [Heroku](https://heroku.com/) (Paid)
   - [Fly.io](https://fly.io/) (Free tier)

2. **Create `.env` file in frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

3. **Update `VITE_API_URL` with your backend URL:**
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

4. **Rebuild and push:**
   ```bash
   cd frontend
   npm run build
   cd ..
   git add -A
   git commit -m "Configure backend URL"
   git push
   ```

### Option 2: Local Development Only

If you only want to run locally:

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit `http://localhost:9000`

## Current GitHub Pages Setup

- **Live URL:** https://gvvvinay.github.io/costco-bill-splitter/
- **Status:** ✅ Frontend deployed (but needs backend to function)
- **Routing:** Uses HashRouter (URLs have `#` for GitHub Pages compatibility)

## What's Deployed

The GitHub Pages site contains:
- ✅ Static frontend files
- ✅ Privacy policy
- ❌ Backend API (needs separate deployment)

## Next Steps

1. **Deploy backend** to Railway/Render/Heroku
2. **Get backend URL** (e.g., `https://your-app.railway.app`)
3. **Update frontend `.env`** with backend URL
4. **Rebuild and push** to update GitHub Pages

## Quick Backend Deployment (Railway Example)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway init
railway up
railway domain  # Get your backend URL

# Update frontend with backend URL
cd ../frontend
echo "VITE_API_URL=https://your-app.railway.app/api" > .env

# Rebuild and redeploy
npm run build
cd ..
git add -A
git commit -m "Connect to Railway backend"
git push
```

## Troubleshooting

### App shows blank page
- Backend is not deployed or URL is incorrect
- Check browser console for API errors
- Verify `VITE_API_URL` in frontend `.env`

### API calls failing
- Ensure backend is running and accessible
- Check CORS settings in backend
- Verify backend URL is correct (include `/api` path)

### 404 on page refresh
- Fixed by using HashRouter
- URLs now use `#` (e.g., `/#/dashboard`)

## Alternative: Demo Mode

If you want a demo that works without backend, you could:
1. Create mock data
2. Disable API calls
3. Use localStorage for state

Let me know if you want help setting this up!
