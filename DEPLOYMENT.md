# Deployment Guide - Render.com

## Prerequisites
1. Create account at [render.com](https://render.com)
2. Install Git if not already installed
3. Push your code to GitHub

## Step 1: Push to GitHub

```bash
cd c:\tmp\costco-bill-splitter
git init
git add .
git commit -m "Initial commit - Costco Bill Splitter"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/costco-bill-splitter.git
git push -u origin main
```

## Step 2: Deploy on Render

### Option A: Using Blueprint (Recommended)
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create:
   - PostgreSQL database (free)
   - Backend web service (free)
   - Frontend static site (free)

### Option B: Manual Setup

#### Create Database:
1. New + → PostgreSQL
2. Name: `costco-bill-splitter-db`
3. Plan: Free
4. Create Database

#### Create Backend:
1. New + → Web Service
2. Connect repository, select `backend` folder
3. Name: `costco-bill-splitter-backend`
4. Runtime: Node
5. Build Command: `npm install && npx prisma generate && npx prisma db push`
6. Start Command: `npm start`
7. Add Environment Variables:
   - `DATABASE_URL` → Copy from database "Internal Database URL"
   - `JWT_SECRET` → Generate random string (e.g., use password generator)
   - `GOOGLE_CLIENT_ID` → Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` → Your Google OAuth Client Secret
   - `FRONTEND_URL` → (add after creating frontend)
   - `NODE_ENV` → `production`
8. Add Disk: `/opt/render/project/src/backend/uploads` (1GB)
9. Create Web Service

#### Create Frontend:
1. New + → Static Site
2. Connect repository
3. Name: `costco-bill-splitter-frontend`
4. Build Command: `cd frontend && npm install && npm run build`
5. Publish Directory: `frontend/dist`
6. Add Environment Variables:
   - `VITE_API_URL` → Your backend URL (e.g., `https://costco-bill-splitter-backend.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID` → Your Google OAuth Client ID
   - `VITE_GOOGLE_CLIENT_SECRET` → Your Google OAuth Client Secret
7. Create Static Site

## Step 3: Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Add Authorized Redirect URIs:
- `https://YOUR-FRONTEND-URL.onrender.com/auth/google/callback`
- Example: `https://costco-bill-splitter-frontend.onrender.com/auth/google/callback`

## Step 4: Update Backend Environment

In Render backend service, add/update:
- `FRONTEND_URL` → Your frontend URL (e.g., `https://costco-bill-splitter-frontend.onrender.com`)

## URLs After Deployment

- **Frontend**: `https://costco-bill-splitter-frontend.onrender.com`
- **Backend**: `https://costco-bill-splitter-backend.onrender.com`
- **Database**: Internal URL (not public)

## Important Notes

⚠️ **Free Tier Limitations**:
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- 750 hours/month free (enough for 1 service running 24/7)
- Database: 90 days then expires (export data before)

💡 **Tips**:
- Free services share resources, so may be slower
- Keep services active with cron job pinging `/api/health` every 14 minutes
- Monitor usage in Render dashboard

## Alternative Free Hosting Options

### Railway.app
- Similar to Render
- $5 free credit monthly
- More generous than Render but limited credits

### Fly.io  
- Free tier: 3 shared VMs
- Better for backend
- Pair with Vercel for frontend

### Vercel (Frontend) + Railway (Backend)
- Vercel: Best for React/Vite frontend (free, fast)
- Railway: Better database support
- Split deployment

## Testing Deployment

1. Visit your frontend URL
2. Try logging in with Google
3. Upload a receipt
4. Test all features

## Troubleshooting

**Database connection fails**:
- Check `DATABASE_URL` is set correctly
- Ensure `npx prisma db push` ran during build

**Google OAuth fails**:
- Verify redirect URIs in Google Console
- Check `FRONTEND_URL` in backend env vars
- Ensure `VITE_GOOGLE_CLIENT_ID` matches Google Console

**Images not loading**:
- Check disk is mounted at `/opt/render/project/src/backend/uploads`
- Verify upload functionality works

**CORS errors**:
- Ensure `FRONTEND_URL` is set in backend
- Check CORS configuration in `backend/src/index.ts`
