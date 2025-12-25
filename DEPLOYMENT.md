# Deployment Guide

This guide covers deploying SketchRoom to production environments.

## 📋 Prerequisites

- PostgreSQL database (managed service recommended)
- Domain name (optional, for custom domains)
- Accounts on hosting platforms:
  - Frontend: Netlify, Vercel, or similar
  - Backend: Render, Railway, Fly.io, or similar
  - WebSocket: Requires WebSocket support (Render, Railway, Fly.io)

## 🗄️ Database Setup

### Option 1: Managed PostgreSQL (Recommended)

**Recommended Services:**
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy PostgreSQL setup
- [Render](https://render.com) - Managed PostgreSQL

**Steps:**
1. Create a new PostgreSQL database
2. Copy the connection string
3. Use it as `DATABASE_URL` in all services

### Option 2: Self-Hosted PostgreSQL

1. Set up PostgreSQL on your server
2. Create a database:
   ```sql
   CREATE DATABASE sketchroom;
   ```
3. Use connection string: `postgresql://user:password@host:5432/sketchroom`

### Run Migrations

After setting up the database:

```bash
cd packages/db
pnpm prisma generate
pnpm prisma migrate deploy
```

## 🎨 Frontend Deployment (Netlify)

### Step 1: Build Configuration

Create `netlify.toml` in the root:

```toml
[build]
  command = "cd draw-app && pnpm install && pnpm build --filter excalidraw-frontend"
  publish = "draw-app/apps/excalidraw-frontend/.next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Environment Variables

In Netlify dashboard, set:

```
NEXT_PUBLIC_HTTP_BACKEND=https://your-api-domain.com/
NEXT_PUBLIC_WS_URL=wss://your-ws-domain.com/
```

### Step 3: Deploy

1. Connect your GitHub repository to Netlify
2. Set build command: `cd draw-app && pnpm install && pnpm build --filter excalidraw-frontend`
3. Set publish directory: `draw-app/apps/excalidraw-frontend/.next`
4. Add environment variables
5. Deploy!

## 🎨 Frontend Deployment (Vercel)

### Step 1: Project Configuration

1. Import your repository in Vercel
2. Set root directory to `draw-app/apps/excalidraw-frontend`
3. Vercel will auto-detect Next.js

### Step 2: Environment Variables

In Vercel dashboard, add:

```
NEXT_PUBLIC_HTTP_BACKEND=https://your-api-domain.com/
NEXT_PUBLIC_WS_URL=wss://your-ws-domain.com/
```

### Step 3: Deploy

Vercel will automatically build and deploy on push to main branch.

## 🔧 HTTP Backend Deployment (Render)

### Step 1: Create Web Service

1. Go to Render dashboard
2. Create new "Web Service"
3. Connect your GitHub repository

### Step 2: Build Settings

- **Build Command**: `cd draw-app && pnpm install && pnpm build --filter http-backend`
- **Start Command**: `cd draw-app/apps/http-backend && pnpm start`
- **Environment**: `Node`

### Step 3: Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-strong-secret-key
NODE_ENV=production
```

### Step 4: Deploy

Render will build and deploy automatically.

## 🔧 HTTP Backend Deployment (Railway)

### Step 1: Create Project

1. Create new project in Railway
2. Add PostgreSQL service
3. Add new service from GitHub repo

### Step 2: Configure Service

- **Root Directory**: `draw-app/apps/http-backend`
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### Step 3: Environment Variables

Link PostgreSQL service and add:

```
JWT_SECRET=your-strong-secret-key
```

### Step 4: Deploy

Railway auto-deploys on git push.

## ⚡ WebSocket Backend Deployment

**Important**: WebSocket backend requires a service that supports persistent WebSocket connections.

### Option 1: Render (Web Service)

1. Create new Web Service
2. **Build Command**: `cd draw-app && pnpm install && pnpm build --filter ws-backend`
3. **Start Command**: `cd draw-app/apps/ws-backend && pnpm start`
4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-strong-secret-key
   PORT=8080
   FLUSH_MS=10
   MAX_BATCH_SIZE=100
   ```

### Option 2: Railway

1. Add new service from GitHub
2. **Root Directory**: `draw-app/apps/ws-backend`
3. **Build Command**: `pnpm install && pnpm build`
4. **Start Command**: `pnpm start`
5. Add environment variables (same as above)

### Option 3: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `fly.toml` in `apps/ws-backend/`:
   ```toml
   app = "sketchroom-ws"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 80
       handlers = ["http"]
       force_https = true

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```
3. Deploy: `fly deploy`

## 🔐 Security Checklist

Before going to production:

- [ ] Use strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Use HTTPS/WSS for all connections
- [ ] Set secure CORS origins
- [ ] Enable database SSL connections
- [ ] Use environment variables (never commit secrets)
- [ ] Set up database backups
- [ ] Configure rate limiting (consider adding)
- [ ] Set up monitoring and error tracking
- [ ] Review and update dependencies regularly

## 🔄 Database Migrations in Production

**Never run `prisma migrate dev` in production!**

Use:
```bash
pnpm prisma migrate deploy
```

This applies pending migrations without creating new ones.

## 📊 Monitoring

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Logs**: Render/Railway built-in logs, or external service
- **Database Monitoring**: Your PostgreSQL provider's dashboard

### Health Checks

Add health check endpoints:

**HTTP Backend** (`/health`):
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
```

**WebSocket Backend**: Monitor connection count and message throughput.

## 🚀 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd draw-app && pnpm install
      - run: cd draw-app && pnpm build --filter excalidraw-frontend
      # Add deployment steps for your platform
```

## 🔧 Troubleshooting

### Frontend can't connect to backend

- Check `NEXT_PUBLIC_HTTP_BACKEND` and `NEXT_PUBLIC_WS_URL` are correct
- Ensure CORS is configured on backend
- Check firewall/security group settings

### WebSocket connection fails

- Verify WebSocket URL uses `wss://` (not `ws://`) in production
- Check that your hosting provider supports WebSockets
- Verify the WebSocket server is running and accessible

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check database is accessible from your hosting provider
- Ensure SSL is enabled if required
- Check database user permissions

### Build failures

- Ensure Node.js version matches (>=18)
- Check all environment variables are set
- Verify database migrations are applied
- Check build logs for specific errors

## 📝 Post-Deployment

1. **Test all features**:
   - User signup/signin
   - Room creation
   - Real-time drawing
   - Shape synchronization

2. **Monitor performance**:
   - Check response times
   - Monitor WebSocket connection stability
   - Watch database query performance

3. **Set up backups**:
   - Configure automatic database backups
   - Test restore procedures

4. **Update documentation**:
   - Update README with production URLs
   - Document any custom configurations

## 🎉 You're Live!

Once deployed, your SketchRoom instance should be accessible at your frontend URL. Share it with your users and start creating together!

