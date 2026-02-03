# Railway Backend Deployment - Step by Step

## ✅ What We've Done So Far

1. ✅ Installed Railway CLI
2. ✅ Logged in to Railway (as CALLMEGVV@GMAIL.COM)
3. ✅ Created project: `dependable-truth`
4. ✅ Created Railway configuration files

## 🚀 Complete the Deployment

### Step 1: Add PostgreSQL Database (via Railway Dashboard)

1. Go to your project: https://railway.com/project/db7b1240-d692-4430-a9f9-108987b45a3d
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Wait for database to provision (~30 seconds)

### Step 2: Link Database to Your Service

Railway will automatically provide a `DATABASE_URL` environment variable.

### Step 3: Set Environment Variables

In the Railway dashboard for your backend service, add these environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
PORT=3001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llava
GOOGLE_CLIENT_ID=your-google-client-id-if-needed
GOOGLE_CLIENT_SECRET=your-google-client-secret-if-needed
FRONTEND_URL=https://gvvvinay.github.io/costco-bill-splitter
```

**Note:** The `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

### Step 4: Deploy Backend

From your terminal:

```bash
cd c:\tmp\costco-bill-splitter\backend
railway up
```

Or use:
```bash
railway up --detach
```

### Step 5: Generate Domain

After deployment completes:

```bash
railway domain
```

This will give you a URL like: `https://dependable-truth.up.railway.app`

### Step 6: Update Frontend Environment

Create `frontend/.env`:

```bash
cd c:\tmp\costco-bill-splitter\frontend
echo VITE_API_URL=https://dependable-truth.up.railway.app/api > .env
```

### Step 7: Rebuild and Deploy Frontend

```bash
npm run build
cd ..
git add -A
git commit -m "Connect frontend to Railway backend"
git push
```

## Alternative: Manual Deployment via GitHub

If CLI is giving issues, you can connect Railway to your GitHub repo:

1. Push your code to GitHub (already done!)
2. In Railway dashboard, click **"+ New"**
3. Select **"GitHub Repo"**
4. Choose `gvvvinay/costco-bill-splitter`
5. Set **Root Directory** to `backend`
6. Railway will auto-deploy on every push!

## Quick CLI Commands Reference

```bash
# Deploy backend
cd backend
railway up

# Check deployment status
railway status

# View logs
railway logs

# Generate public domain
railway domain

# Open Railway dashboard
railway open

# Set environment variable
railway variables set JWT_SECRET=your-secret-key

# Get backend URL
railway domain
```

## Troubleshooting

### If `railway up` hangs:
- Press Ctrl+C
- Try: `railway up --detach`
- Or use GitHub integration (easier!)

### Database connection issues:
- Ensure PostgreSQL service is running in Railway
- Check `DATABASE_URL` is set automatically

### Build fails:
- Check Railway build logs in dashboard
- Ensure all dependencies are in `package.json`

## Next Step

Run this command and I'll help with the output:

```bash
cd c:\tmp\costco-bill-splitter\backend
railway up --detach
```

Then get your backend URL:
```bash
railway domain
```
