# Docker Deployment Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)

## Quick Start

1. **Copy environment variables**
   ```bash
   cp .env.docker .env
   ```

2. **Edit `.env` file and add your Google OAuth credentials**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```

3. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Commands

### Start containers (detached mode)
```bash
docker-compose up -d
```

### Stop containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose up --build
```

### Remove containers and volumes
```bash
docker-compose down -v
```

## Architecture

- **Backend**: Node.js + Express + Prisma + SQLite
- **Frontend**: React + Vite served by Nginx
- **Network**: Internal Docker network for service communication
- **Volumes**: Persistent storage for database and uploads

## Ports
- `3000`: Frontend (Nginx)
- `5000`: Backend API

## Environment Variables

### Backend
- `NODE_ENV`: Set to `production`
- `DATABASE_URL`: SQLite database path
- `JWT_SECRET`: Secret key for JWT tokens
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL (uses nginx proxy)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Volumes

- `backend-data`: SQLite database persistence
- `backend-uploads`: Uploaded receipt images

## Troubleshooting

### Port already in use
If ports 3000 or 5000 are already in use, stop the local development server or change the ports in `docker-compose.yml`.

### Prisma errors
If you see Prisma-related errors, ensure the database is properly initialized:
```bash
docker-compose exec backend npx prisma db push
```

### Frontend can't connect to backend
Check that the backend container is running and healthy:
```bash
docker-compose ps
docker-compose logs backend
```
