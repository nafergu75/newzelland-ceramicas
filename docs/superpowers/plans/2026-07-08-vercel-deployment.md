# Vercel E-commerce Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the complete Newzeland Cerámicas e-commerce platform (React frontend + Node.js/Express backend + PostgreSQL) to Vercel with proper environment configuration, serverless functions, and frontend routing.

**Architecture:** 
- Frontend (React + Vite + TypeScript) deploys as static SPA to Vercel edge network
- Backend (Express + TypeScript) deployed as Vercel serverless functions in `/api` directory
- PostgreSQL database via managed service (Render or similar)
- Environment variables configured via Vercel dashboard
- Frontend communicates with backend via `VITE_API_URL` environment variable
- Two separate Vercel projects OR one monorepo with proper routing

**Tech Stack:**
- Frontend: React 18, Vite 5, TypeScript 5, React Router v6, Axios
- Backend: Express 4.18, TypeScript 5, Node.js 18+, PostgreSQL 12+
- Deployment: Vercel CLI, GitHub + Vercel integration
- Security: JWT, CORS configuration, environment variable management

---

## Phase 1: Prepare Repository Structure

### Task 1: Create Backend API Directory Structure for Vercel Serverless

**Files:**
- Create: `api/index.js` (main serverless entry point)
- Create: `api/tsconfig.json` (TypeScript configuration for API)
- Modify: `backend/package.json` (add build script for API)
- Create: `.env.local.example` (template for environment variables)

**Background:**
Vercel serverless functions expect handlers in the `/api` directory. We'll export the Express app as a module that Vercel can invoke as a serverless function.

- [ ] **Step 1: Create API entry point for Vercel**

Create `api/index.js`:
```javascript
// api/index.js - Vercel serverless function entry point
import 'dotenv/config';

// Import the Express app configured in backend/src/app.ts
import app from '../backend/dist/app.js';

export default app;
```

- [ ] **Step 2: Configure TypeScript for API layer**

Create `api/tsconfig.json`:
```json
{
  "extends": "../backend/tsconfig.json",
  "compilerOptions": {
    "outDir": "../backend/dist",
    "rootDir": "../backend/src"
  },
  "include": ["../backend/src/**/*"],
  "exclude": ["../backend/node_modules", "../backend/dist"]
}
```

- [ ] **Step 3: Update backend build script**

Modify `backend/package.json` - change the `build` script:
```json
{
  "scripts": {
    "build": "tsc && npm run build:api",
    "build:api": "echo 'API built - ready for Vercel serverless'"
  }
}
```

- [ ] **Step 4: Create environment variables template**

Create `.env.local.example`:
```
# DATABASE
DATABASE_URL=postgresql://user:password@host:5432/ecommerce_db

# AUTHENTICATION
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRATION=7d

# FRONTEND
FRONTEND_URL=http://localhost:5173

# EMAIL (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SERVER
PORT=3000
NODE_ENV=development

# STRIPE (if using Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# VERCEL
VERCEL_URL=your-vercel-url.vercel.app
```

- [ ] **Step 5: Commit Phase 1**

```bash
git add api/ backend/package.json .env.local.example
git commit -m "chore: create Vercel serverless API structure

- Add api/index.js entry point for Vercel functions
- Configure TypeScript for API layer
- Create environment variables template
- Ready for backend deployment"
```

---

### Task 2: Update Frontend Configuration for Production Build

**Files:**
- Modify: `frontend/vite.config.ts` (add production configuration)
- Modify: `frontend/package.json` (update build script)
- Create: `frontend/.env.production.example` (production env template)

**Background:**
The frontend needs to:
1. Build a static SPA that can be deployed to Vercel
2. Use environment variables to point to the backend API
3. Handle client-side routing (React Router SPA)

- [ ] **Step 1: Update Vite configuration for production**

Modify `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
```

- [ ] **Step 2: Update frontend build script**

Modify `frontend/package.json` - update the scripts section:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "build:vercel": "npm run build"
  }
}
```

- [ ] **Step 3: Create environment template for frontend**

Create `frontend/.env.production.example`:
```
# API Configuration
VITE_API_URL=https://your-backend-url.vercel.app

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

- [ ] **Step 4: Update main.tsx to use environment variable**

Modify `frontend/src/main.tsx` (if it doesn't already set up axios baseURL):
```typescript
import axios from 'axios'

// Configure API base URL from environment or fallback
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.baseURL = apiUrl
```

If `main.tsx` doesn't exist or doesn't configure axios, create/update it with the above code.

- [ ] **Step 5: Commit Phase 2**

```bash
git add frontend/vite.config.ts frontend/package.json frontend/.env.production.example
git commit -m "feat: configure frontend for production builds

- Update Vite build configuration with code splitting
- Add production environment template
- Configure axios with API URL from environment
- Ready for static deployment to Vercel"
```

---

### Task 3: Create Vercel Configuration Files

**Files:**
- Modify: `vercel.json` (update routing configuration)
- Create: `vercel-frontend.json` (alternative frontend-only config)
- Create: `api/package.json` (minimal API package)

**Background:**
Vercel needs clear instructions on:
1. Which directory is the build output (frontend/dist)
2. How to route API requests to serverless functions
3. How to handle client-side routing for React Router

- [ ] **Step 1: Update root vercel.json**

Modify `vercel.json` - complete monorepo configuration:
```json
{
  "version": 2,
  "projectSettings": {
    "framework": "react",
    "buildCommand": "npm run build",
    "outputDirectory": "frontend/dist",
    "installCommand": "npm install && npm --prefix backend install && npm --prefix frontend install"
  },
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-builds",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "^/api/(.*)",
      "dest": "api/index.js",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    },
    {
      "src": "^/(?!api).*",
      "dest": "frontend/dist/index.html",
      "status": 200
    },
    {
      "src": "/",
      "dest": "frontend/dist/index.html"
    }
  ],
  "env": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "DATABASE_URL",
      "value": "@database_url"
    },
    {
      "key": "JWT_SECRET",
      "value": "@jwt_secret"
    },
    {
      "key": "FRONTEND_URL",
      "value": "@frontend_url"
    }
  ]
}
```

- [ ] **Step 2: Create minimal API package.json**

Create `api/package.json`:
```json
{
  "name": "newzelland-api",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "dotenv": "^16.3.0"
  }
}
```

- [ ] **Step 3: Create optional frontend-only config**

Create `vercel-frontend.json` (for deploying frontend separately):
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "react",
  "installCommand": "npm --prefix frontend install",
  "routes": [
    {
      "src": "^(?!api).*",
      "dest": "/index.html",
      "status": 200
    }
  ]
}
```

- [ ] **Step 4: Verify routing configuration**

Review the `vercel.json` routes section. Key points:
- `/api/*` routes to serverless function
- All other routes (including `/about`, `/products`, etc.) go to `frontend/dist/index.html`
- React Router handles client-side routing
- Test: visiting `/login` should serve `index.html` (React Router renders LoginPage)

- [ ] **Step 5: Commit Phase 3**

```bash
git add vercel.json vercel-frontend.json api/package.json
git commit -m "chore: add Vercel configuration for monorepo deployment

- Configure routing: /api → serverless, /* → React Router
- Set up builds for both frontend and backend
- Include environment variable declarations
- Support both monorepo and frontend-only deployments"
```

---

## Phase 2: Prepare Database & Environment

### Task 4: Set Up Database (PostgreSQL)

**Files:**
- Create: `DEPLOYMENT-DB-SETUP.md` (instructions for database setup)
- Reference: `backend/src/db/migrations.ts` (existing migrations)

**Background:**
Before deploying to Vercel, you need a PostgreSQL database accessible from the internet. Options:
1. **Render (recommended)** - Free tier, PostgreSQL managed
2. **Railway** - Similar to Render, generous free tier
3. **Heroku Postgres** - Paid, but reliable
4. **AWS RDS** - More complex setup
5. **Local + SSH tunnel** - Not recommended for production

We'll document the Render approach as it's free and straightforward.

- [ ] **Step 1: Create database setup instructions**

Create `DEPLOYMENT-DB-SETUP.md`:
```markdown
# Database Setup for Vercel Deployment

## Option 1: Render.com (Recommended - Free tier available)

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub account
- Verify email

### 2. Create PostgreSQL Database
- Dashboard → New → PostgreSQL
- Name: `ecommerce_db` or `newzelland_db`
- Database: `ecommerce_db`
- User: `postgres`
- Password: Generate strong password (save this!)
- Region: Pick closest to your users
- Create Database

### 3. Wait for Database Ready
- Status will show "Available" (takes 1-2 minutes)
- Copy the connection string (looks like):
  ```
  postgresql://user:password@host:5432/ecommerce_db
  ```

### 4. Add to Vercel
- Vercel Dashboard → Project Settings → Environment Variables
- Add: `DATABASE_URL` = (paste the connection string)
- Add: `FRONTEND_URL` = `https://your-project.vercel.app`

### 5. Test Connection Locally
```bash
cd backend
export DATABASE_URL="postgresql://user:password@host:5432/ecommerce_db"
npm run migrate
```

Expected output:
```
✓ Connected to database
✓ Created tables if not exist
```

## Option 2: Railway.app

1. Go to https://railway.app
2. Create New Project → Add PostgreSQL
3. Copy the DATABASE_URL from the PostgreSQL plugin
4. Follow steps 4-5 above with Railway URL

## Option 3: Heroku (Paid alternative)

1. Create Heroku account
2. Create new app
3. Add PostgreSQL add-on (Hobby tier: $9/month)
4. Copy DATABASE_URL from Config Vars
5. Follow steps 4-5 above

## Migration on First Deploy

Vercel will NOT automatically run migrations. You have two options:

### Option A: Manual Migration (Recommended for first deploy)
```bash
# After database created and DATABASE_URL added to Vercel
vercel env pull  # Pulls env vars locally
npm run migrate  # Run locally to set up schema
```

### Option B: Automatic Migration
Add to `vercel.json`:
```json
{
  "buildCommand": "npm install && npm --prefix backend install && npm --prefix backend run migrate && npm --prefix frontend install && npm --prefix frontend run build"
}
```

This runs migrations during build but may fail if database isn't ready.

## Monitoring Database

### Render Dashboard
- Go to Render.com → Your Database
- View connection info, backups, logs
- Monitor uptime

### From Local
```bash
psql postgresql://user:password@host:5432/ecommerce_db
# Then run SQL queries to verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

## Backup Strategy

Render provides automatic daily backups (free tier). For production:
1. Enable backup notifications
2. Test restore process monthly
3. Consider automated backups to S3 for critical data
```

- [ ] **Step 2: Verify backend database connection code**

Check `backend/src/db/connection.ts` exists and uses `DATABASE_URL`:
```bash
grep -n "DATABASE_URL\|process.env" backend/src/db/connection.ts
```

Expected to see: `process.env.DATABASE_URL` being used

- [ ] **Step 3: Verify migrations script**

Check `backend/src/db/migrations.ts` to ensure it:
1. Reads `DATABASE_URL` from environment
2. Creates tables if they don't exist
3. Can be run safely multiple times

Run locally to test:
```bash
cd backend
npm run migrate
```

Expected output: Schema created or "already exists" (no errors)

- [ ] **Step 4: Create environment verification script**

Create `backend/verify-env.ts`:
```typescript
// backend/verify-env.ts - Verify required environment variables
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'PORT'
];

const optional = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('=== Environment Variable Check ===\n');

let allRequired = true;

requiredEnvVars.forEach(v => {
  const value = process.env[v];
  if (!value) {
    console.error(`✗ MISSING REQUIRED: ${v}`);
    allRequired = false;
  } else {
    // Mask sensitive values
    const masked = v.includes('SECRET') || v.includes('PASSWORD') 
      ? value.substring(0, 4) + '...' 
      : value;
    console.log(`✓ ${v}: ${masked}`);
  }
});

optional.forEach(v => {
  const value = process.env[v];
  console.log(`  ${value ? '✓' : '○'} ${v}: ${value ? 'set' : 'not set'}`);
});

if (!allRequired) {
  console.error('\n⚠ Required variables missing!');
  process.exit(1);
}

console.log('\n✓ All required variables set');
process.exit(0);
```

- [ ] **Step 5: Commit Phase 4**

```bash
git add DEPLOYMENT-DB-SETUP.md backend/verify-env.ts
git commit -m "docs: add database setup instructions for Vercel

- Create Render.com PostgreSQL setup guide
- Add environment variable verification script
- Include backup and monitoring instructions
- Document migration process for first deploy"
```

---

### Task 5: Configure Environment Variables for Vercel

**Files:**
- Create: `VERCEL-ENV-SETUP.md` (instructions for Vercel dashboard)
- Modify: `.env.local` (local development)
- Create: `.env.vercel.example` (all production variables)

**Background:**
Never commit `.env` files. Vercel manages secrets via dashboard. We'll document exactly which variables are needed where.

- [ ] **Step 1: Create comprehensive environment setup guide**

Create `VERCEL-ENV-SETUP.md`:
```markdown
# Vercel Environment Variables Setup

## Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables

## Step 2: Add Required Variables

### Database Connection
| Key | Value | Visibility |
|-----|-------|-----------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Production, Preview |
| `NODE_ENV` | `production` | Production |

### Authentication
| Key | Value | Visibility |
|-----|-------|-----------|
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Production |
| `JWT_EXPIRATION` | `7d` | Production, Preview |

### Frontend
| Key | Value | Visibility |
|-----|-------|-----------|
| `FRONTEND_URL` | `https://your-project.vercel.app` | Production, Preview |
| `VITE_API_URL` | `https://your-project.vercel.app` | Production (for frontend build) |

### Email (SMTP) - Optional but Recommended
| Key | Value | Visibility |
|-----|-------|-----------|
| `SMTP_HOST` | `smtp.gmail.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_USER` | `your-email@gmail.com` | Production |
| `SMTP_PASS` | App-specific password (see below) | Production |

### Stripe (if using payment processing)
| Key | Value | Visibility |
|-----|-------|-----------|
| `STRIPE_SECRET_KEY` | From Stripe dashboard (live key) | Production |
| `STRIPE_PUBLISHABLE_KEY` | From Stripe dashboard | Production, Preview |

## Step 3: Generate Secure JWT Secret

```bash
# Run this in terminal (macOS/Linux)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or in PowerShell (Windows)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as `JWT_SECRET` value.

## Step 4: Set Up Gmail SMTP (Optional)

### For Gmail:
1. Enable 2-Factor Authentication on Gmail
2. Create App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your setup)
4. Copy the generated 16-character password
5. In Vercel:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = your@gmail.com
   - `SMTP_PASS` = (paste the 16-char app password)

### For Other Email Providers:
- SendGrid, Mailgun, Brevo, etc. - check their SMTP documentation

## Step 5: Frontend Environment Variables

Create `frontend/.env.production` (after determining your Vercel URL):

```
VITE_API_URL=https://your-project.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**IMPORTANT:** These must be set BEFORE running `npm run build` in frontend.

## Step 6: Test Configuration

After setting all variables:

```bash
# Pull environment variables locally
vercel env pull

# Test backend can connect to database
cd backend
npm run migrate

# Test frontend builds with correct API URL
cd ../frontend
npm run build

# Check the built files
cat dist/index.html | grep -o "VITE_API_URL" || echo "API URL injected correctly"
```

## Step 7: Deploy!

```bash
git push origin main
# Vercel will automatically build and deploy
```

Monitor at: https://vercel.com/dashboard/your-project

## Troubleshooting

### "DATABASE_URL not found"
- Check it's added in Vercel Settings → Environment Variables
- Check it's visible for the right environments (Production, Preview)
- Redeploy after adding it

### "JWT_SECRET not found"
- Same as above
- Don't use special characters that need escaping
- Use the crypto-generated string directly

### "FRONTEND_URL not matching"
- Update it to your actual Vercel URL
- Frontend needs to know where backend is deployed
- Both should be in production environment

### Frontend build fails with "Cannot find VITE_API_URL"
- The variable must be in `.env.production`
- Vercel must have `VITE_API_URL` in environment variables
- Use `vercel env pull` to sync locally before testing

### Email not sending
- Check SMTP credentials are correct
- Test Gmail app password: https://myaccount.google.com/apppasswords
- Look at Vercel function logs: Settings → Functions → Logs
```

- [ ] **Step 2: Create local .env.local file from template**

Create `.env.local` for local development:
```
# .env.local - Local development (DO NOT COMMIT)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
PORT=3000
NODE_ENV=development
```

- [ ] **Step 3: Create comprehensive environment variables file**

Create `.env.vercel.example`:
```
# ==================================================
# VERCEL PRODUCTION ENVIRONMENT VARIABLES
# Copy values from .env.local and update for production
# ==================================================

# DATABASE - REQUIRED
# Get from Render.com, Railway, or Heroku PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/ecommerce_db

# AUTHENTICATION - REQUIRED
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=generate-this-with-crypto-command

# Expiration time for JWT tokens
JWT_EXPIRATION=7d

# FRONTEND - REQUIRED
# Your Vercel project URL (without path)
FRONTEND_URL=https://newzelland-ceramicas.vercel.app

# API URL for Frontend build - REQUIRED for VITE
# Same as FRONTEND_URL for monorepo deployment
VITE_API_URL=https://newzelland-ceramicas.vercel.app

# SERVER
NODE_ENV=production
PORT=3000

# EMAIL CONFIGURATION - OPTIONAL
# Enable for sending confirmation emails, order updates, etc.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=app-specific-password-from-gmail-settings

# STRIPE PAYMENT GATEWAY - OPTIONAL
# Get from Stripe dashboard (live keys for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# VERCEL SPECIFIC
# Automatically set by Vercel, but listed for reference
VERCEL_URL=newzelland-ceramicas.vercel.app
VERCEL_ENV=production
```

- [ ] **Step 4: Add environment variable verification to deployment**

Modify `backend/package.json` to add pre-startup check:
```json
{
  "scripts": {
    "check-env": "node -e \"const vars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL']; const missing = vars.filter(v => !process.env[v]); if (missing.length) { console.error('Missing:', missing); process.exit(1); }\"",
    "start": "npm run check-env && node dist/app.js",
    "dev": "npm run check-env && ts-node-dev --respawn src/app.ts"
  }
}
```

- [ ] **Step 5: Commit Phase 5**

```bash
git add VERCEL-ENV-SETUP.md .env.local .env.vercel.example
git commit -m "docs: create comprehensive environment variable setup guide

- Add step-by-step Vercel dashboard configuration
- Document JWT secret generation with crypto
- Include Gmail SMTP setup instructions
- Create environment variable templates for local and production
- Add verification scripts to ensure vars are present at startup"
```

---

## Phase 3: Build & Test Locally

### Task 6: Test Local Build and API Integration

**Files:**
- Modify: `backend/package.json` (add pre-deployment build check)
- Modify: `frontend/src/services/api.ts` or create if missing (API client)
- Create: `TEST-CHECKLIST.md` (verification checklist)

**Background:**
Before deploying to Vercel, verify everything builds and communicates correctly. This is critical to avoid discovering issues in production.

- [ ] **Step 1: Create API client service for frontend**

Create `frontend/src/services/api.ts`:
```typescript
// frontend/src/services/api.ts - Centralized API client
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

- [ ] **Step 2: Create test checklist**

Create `TEST-CHECKLIST.md`:
```markdown
# Pre-Deployment Testing Checklist

Run these tests locally before deploying to Vercel.

## Setup (5 minutes)
- [ ] Database running locally or via Render
- [ ] `npm install` in backend and frontend
- [ ] `.env.local` configured with DATABASE_URL
- [ ] Backend migrations run: `cd backend && npm run migrate`

## Backend Build (2 minutes)
- [ ] Run `cd backend && npm run build`
- [ ] Check for TypeScript errors (should show 0 errors)
- [ ] Verify `backend/dist/` folder created with compiled JS

## Frontend Build (2 minutes)
- [ ] Run `cd frontend && npm run build`
- [ ] Check for TypeScript errors (should show 0 errors)
- [ ] Verify `frontend/dist/index.html` exists
- [ ] Verify `frontend/dist/assets/` contains JS/CSS bundles

## API Connectivity (5 minutes)

### Start services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (in another terminal)
cd frontend
VITE_API_URL=http://localhost:3000 npm run dev
```

### Test endpoints
1. **Health Check**
   - Request: `curl http://localhost:3000/api/health`
   - Expected: `{"status":"ok","timestamp":"..."}`

2. **Register**
   - POST to `http://localhost:5173/api/auth/register`
   - Body: `{"email":"test@test.com","password":"Test123!","name":"Test User"}`
   - Expected: `{"success":true,"token":"..."}`

3. **Login**
   - POST to `http://localhost:5173/api/auth/login`
   - Body: `{"email":"test@test.com","password":"Test123!"}`
   - Expected: `{"success":true,"token":"..."}`

4. **Protected Route**
   - GET to `http://localhost:3000/api/user/profile`
   - Header: `Authorization: Bearer {token}`
   - Expected: `{"id":"...","email":"test@test.com","name":"Test User"}`

## Frontend UI (5 minutes)

1. **Home Page**
   - [ ] Page loads without console errors
   - [ ] Images load correctly
   - [ ] Responsive on mobile (use DevTools)

2. **Login Flow**
   - [ ] Navigate to `/login`
   - [ ] React Router renders LoginPage
   - [ ] Login form submits to `/api/auth/login`
   - [ ] Token stored in localStorage
   - [ ] Redirects to `/dashboard` on success

3. **Protected Pages**
   - [ ] `/dashboard` only accessible when logged in
   - [ ] `/admin` only accessible when logged in
   - [ ] Logout redirects to `/login`

4. **API URL Correct**
   - [ ] Open DevTools → Network
   - [ ] Make API request from frontend
   - [ ] Check that request goes to `http://localhost:3000/api/...`
   - [ ] Not to `http://localhost:5173/api/...`

## Error Handling (3 minutes)

1. **Bad Database URL**
   - Stop database service
   - Run `npm run dev` in backend
   - Expected: Connection error (clear message, not crash)

2. **Missing JWT_SECRET**
   - Remove JWT_SECRET from .env.local
   - Run `npm run dev` in backend
   - Expected: Startup error mentioning JWT_SECRET

3. **Wrong FRONTEND_URL**
   - Set FRONTEND_URL to wrong URL in .env.local
   - Try login from frontend
   - Expected: CORS error in console (CORS properly configured)

## Vercel-Specific (2 minutes)

1. **Check Vercel Configuration**
   - [ ] `vercel.json` exists and is valid JSON
   - [ ] Routes section has `/api/` rule
   - [ ] Routes section has SPA fallback to `index.html`

2. **Test Build Command**
   ```bash
   npm install && npm --prefix backend install && npm --prefix frontend install && npm --prefix backend run build && npm --prefix frontend run build
   ```
   - Should complete without errors
   - Should produce `frontend/dist/` and `backend/dist/`

3. **Verify Build Outputs**
   - [ ] `frontend/dist/index.html` exists
   - [ ] `frontend/dist/assets/*.js` files exist
   - [ ] `backend/dist/app.js` exists
   - [ ] `api/index.js` exists

## Final Sign-Off

If all checks pass:
- [ ] Ready to deploy to Vercel
- [ ] No console errors in frontend or backend
- [ ] All API endpoints working
- [ ] Database connection working
- [ ] CORS properly configured
- [ ] Environment variables set correctly

If any fail, fix before deploying.
```

- [ ] **Step 3: Run full local build test**

Execute these commands:
```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Clean previous builds
rm -r backend/dist frontend/dist

# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build

# Check outputs
ls -la dist/  # Should show index.html and assets/
cd ../backend
ls -la dist/  # Should show app.js and other compiled files
```

Expected output:
```
✓ backend/dist/ contains compiled TypeScript
✓ frontend/dist/ contains built SPA
✓ No build errors
```

- [ ] **Step 4: Test environment variable loading**

Create a quick test file:
```bash
cd backend
node -e "require('dotenv').config(); console.log('DATABASE_URL:', !!process.env.DATABASE_URL); console.log('JWT_SECRET:', !!process.env.JWT_SECRET)"
```

Expected:
```
DATABASE_URL: true
JWT_SECRET: true
```

- [ ] **Step 5: Commit Phase 6**

```bash
git add TEST-CHECKLIST.md frontend/src/services/api.ts
git commit -m "test: add comprehensive pre-deployment testing checklist

- Create centralized API client with axios interceptors
- Document health check, auth, and protected route tests
- Include CORS and error handling verification
- Add Vercel-specific configuration checks
- Ensure builds complete without errors"
```

---

## Phase 4: Deploy to Vercel

### Task 7: Deploy Backend to Vercel Serverless Functions

**Files:**
- Already prepared: `api/index.js`, `vercel.json`
- Reference: `backend/dist/` (compiled output)

**Background:**
Deploying to Vercel means the backend runs as serverless functions. Each request to `/api/` triggers a function instance. Key differences from local:
- No persistent server process
- Cold starts (first request slower)
- 10-second timeout by default
- Environment variables injected automatically
- Database connection pooling important

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

Verify:
```bash
vercel --version
```

Expected: `Vercel CLI 33.0.0` (or similar version)

- [ ] **Step 2: Link GitHub Repository to Vercel**

Option A (Recommended - via Vercel Dashboard):
1. Go to https://vercel.com/import
2. Click "Import Project"
3. Select "Import Git Repository"
4. Paste repo URL or connect GitHub
5. Select repository
6. Click "Import"

Option B (via CLI):
```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
vercel link
```

Follow prompts:
- Scope: Your personal account or organization
- Project name: `newzelland-ceramicas` (or preferred name)
- Link existing project: No (create new)

- [ ] **Step 3: Set Production Environment Variables**

```bash
# Using Vercel CLI
vercel env add DATABASE_URL
# Paste: postgresql://...

vercel env add JWT_SECRET
# Paste: (generated secret from Task 5)

vercel env add FRONTEND_URL
# Paste: https://newzelland-ceramicas.vercel.app

vercel env add VITE_API_URL
# Paste: https://newzelland-ceramicas.vercel.app

# SMTP variables (if configured)
vercel env add SMTP_HOST
# Paste: smtp.gmail.com

vercel env add SMTP_PORT
# Paste: 587

vercel env add SMTP_USER
# Paste: your-email@gmail.com

vercel env add SMTP_PASS
# Paste: app-password
```

Or via Dashboard:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable one by one
3. Select environment: Production

- [ ] **Step 4: Deploy to Vercel**

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
vercel --prod
```

Expected output:
```
Vercel CLI 33.0.0
> Project linked to newzelland-ceramicas
> Ready to deploy to vercel.com? [Y/n] y
> Creating deploy...
> Deployment complete! https://newzelland-ceramicas.vercel.app [4s]
```

- [ ] **Step 5: Test Backend is Deployed**

```bash
curl https://newzelland-ceramicas.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-07-08T12:34:56.789Z"}
```

If error: Check Vercel logs
```bash
vercel logs https://newzelland-ceramicas.vercel.app/api/health
```

- [ ] **Step 6: Monitor Deployment**

1. Go to https://vercel.com/dashboard
2. Select your project
3. View "Deployments" tab
4. Click latest deployment
5. View "Functions" to see serverless function execution

Look for:
- [ ] No errors in logs
- [ ] Function responding in <1s
- [ ] All environment variables loaded

- [ ] **Step 7: Commit Phase 7**

```bash
git add .vercel/  # If generated
git commit -m "chore: deploy backend to Vercel serverless

- Backend now running as serverless functions
- API available at /api/* endpoints
- Environment variables configured in Vercel dashboard
- Database connected via DATABASE_URL
- Health check available at /api/health"
```

---

### Task 8: Deploy Frontend to Vercel Static

**Files:**
- Already prepared: `frontend/dist/` (build output)
- Already prepared: `vercel.json` (routing config)

**Background:**
The frontend is deployed as static files to Vercel's edge network. Vercel automatically serves from CDN locations worldwide for fast access. React Router handles all client-side routing.

- [ ] **Step 1: Ensure Frontend Build Uses Correct API URL**

Create `.env.production`:
```
VITE_API_URL=https://newzelland-ceramicas.vercel.app
```

Verify frontend package.json has this script:
```bash
grep '"build"' frontend/package.json
```

Should show: `"build": "tsc -b && vite build"`

- [ ] **Step 2: Build Frontend with Production Config**

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas\frontend"

# Set production API URL
$env:VITE_API_URL="https://newzelland-ceramicas.vercel.app"

# Build
npm run build
```

Expected:
```
✓ 42 modules transformed
✓ 2.5MB transferred

✓ built in 12.34s
```

- [ ] **Step 3: Verify Build Output**

```bash
# Check that index.html exists
ls dist/index.html

# Check that React bundle is built
ls dist/assets/*.js | wc -l
# Should show multiple .js files (chunks)

# Verify API URL in built files
grep "newzelland-ceramicas" dist/assets/*.js | head -5
```

Expected: API URL should be embedded in built files

- [ ] **Step 4: Configure Vercel Routing for SPA**

Already done in `vercel.json`, but verify:

```bash
grep -A 10 '"routes"' vercel.json | head -15
```

Should show:
```json
"routes": [
  {
    "src": "^/api/(.*)",
    "dest": "api/index.js"
  },
  {
    "src": "^(?!api).*",
    "dest": "frontend/dist/index.html",
    "status": 200
  }
]
```

This means:
- `/api/*` → backend serverless
- Everything else → React app (index.html)
- React Router handles client-side routing

- [ ] **Step 5: Deploy Frontend**

If not already deployed with previous task:

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
vercel --prod --confirm
```

Or with Vercel Dashboard:
1. GitHub push to main branch
2. Vercel automatically builds and deploys
3. URL: https://newzelland-ceramicas.vercel.app

- [ ] **Step 6: Test Frontend Deployment**

```bash
# Test different routes
curl -I https://newzelland-ceramicas.vercel.app/
curl -I https://newzelland-ceramicas.vercel.app/login
curl -I https://newzelland-ceramicas.vercel.app/catalog
curl -I https://newzelland-ceramicas.vercel.app/dashboard
```

All should return HTTP 200 (and serve index.html)

Then test in browser:
1. Go to https://newzelland-ceramicas.vercel.app/
2. Should load home page without errors
3. Click links, navigate to `/login`
4. Open DevTools → Network
5. Click register, check that POST goes to `/api/auth/register`
6. Request should go to backend (https://newzelland-ceramicas.vercel.app/api/...)

- [ ] **Step 7: Verify CORS Configuration**

Test CORS headers from frontend:

```bash
curl -I -H "Origin: https://newzelland-ceramicas.vercel.app" \
  https://newzelland-ceramicas.vercel.app/api/health
```

Should see:
```
Access-Control-Allow-Origin: https://newzelland-ceramicas.vercel.app
```

If missing, update `backend/src/app.ts` CORS config:
```typescript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Then rebuild and redeploy backend.

- [ ] **Step 8: Commit Phase 8**

```bash
git add frontend/.env.production
git commit -m "chore: deploy frontend to Vercel static hosting

- Frontend deployed to edge network (fast, worldwide CDN)
- React Router SPA routing configured
- API URL points to backend serverless functions
- CORS properly configured for both domains
- All routes serve index.html, React Router handles navigation"
```

---

### Task 9: Configure Custom Domain (Optional but Recommended)

**Files:**
- Reference: `vercel.json` (domain config)
- Create: `CUSTOM-DOMAIN-SETUP.md`

**Background:**
By default, your app is at `newzelland-ceramicas.vercel.app`. You likely want it at `newzelland.com` (or similar). This task adds a custom domain.

- [ ] **Step 1: Purchase Domain**

Options:
- Vercel Domains (easiest)
- Namecheap, GoDaddy, Google Domains (cheaper)
- Your current registrar

Note: Domain should already be purchased/available (not part of this task).

- [ ] **Step 2: Add Domain to Vercel**

Via Dashboard:
1. Vercel Dashboard → Project Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `newzelland.com` (or your domain)
4. Vercel provides nameservers

Via CLI:
```bash
vercel domains add newzelland.com
```

- [ ] **Step 3: Update DNS Nameservers**

If domain not on Vercel:

1. Go to your domain registrar (Namecheap, etc.)
2. Find "Nameservers" section
3. Replace with Vercel nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   - `ns3.vercel-dns.com`
   - `ns4.vercel-dns.com`
4. Save
5. Wait 24-48 hours for propagation (DNS cache)

Test propagation:
```bash
nslookup newzelland.com
# Should show Vercel nameservers
```

- [ ] **Step 4: Set Primary Domain**

Vercel Dashboard → Project Settings → Domains:
- [ ] Set `newzelland.com` as primary domain
- [ ] Add `www.newzelland.com` as alias
- [ ] Set `newzelland-ceramicas.vercel.app` to redirect to primary

- [ ] **Step 5: Enable SSL Certificate**

Vercel automatically provides free SSL/TLS certificate (Let's Encrypt).

Should see in Dashboard:
- [ ] SSL/TLS badge showing "Valid"
- [ ] Both `newzelland.com` and `www.newzelland.com` covered

Test:
```bash
curl -I https://newzelland.com
# Should return HTTP 200, no SSL warnings
```

- [ ] **Step 6: Update Environment Variables**

Update `FRONTEND_URL` in Vercel:

Old: `https://newzelland-ceramicas.vercel.app`
New: `https://newzelland.com`

Redeploy backend:
```bash
cd backend
vercel --prod
```

- [ ] **Step 7: Create Domain Setup Documentation**

Create `CUSTOM-DOMAIN-SETUP.md`:
```markdown
# Custom Domain Setup for Newzeland

## Current Status
- Production URL: https://newzelland-ceramicas.vercel.app
- Custom domain: To be configured

## To Add Custom Domain:

### Prerequisites
- Domain purchased (e.g., newzelland.com)
- Access to domain registrar account

### Step 1: Add Domain to Vercel
```bash
vercel domains add newzelland.com
```

Or via Dashboard:
1. Vercel.com → Project Settings → Domains
2. Click "Add"
3. Enter domain name

### Step 2: Update DNS

Go to your domain registrar (Namecheap, GoDaddy, etc.):

1. Find "Nameservers" or "DNS Settings"
2. Replace current nameservers with:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   - `ns3.vercel-dns.com`
   - `ns4.vercel-dns.com`
3. Save changes
4. Wait 24-48 hours for DNS to propagate

### Step 3: Verify in Vercel

1. Vercel Dashboard → Domains
2. Should show "Domain Working" with checkmarks
3. SSL certificate auto-provisioned

### Step 4: Update Backend Environment

Update `FRONTEND_URL` in Vercel:
- Old: `https://newzelland-ceramicas.vercel.app`
- New: `https://newzelland.com`

Then redeploy backend for CORS to work correctly.

### Step 5: Test

```bash
curl https://newzelland.com
# Should load homepage

curl https://newzelland.com/api/health
# Should return {"status":"ok"...}
```

## Monitoring

1. Vercel Dashboard → Analytics
   - View edge request counts
   - Monitor response times
   - Check error rates

2. Google Search Console (SEO)
   - Add property for newzelland.com
   - Submit sitemap
   - Monitor indexing

3. SSL Certificate
   - Vercel auto-renews (no action needed)
   - Certificate valid for 1 year
```

- [ ] **Step 8: Commit Phase 9 (Optional)**

```bash
git add CUSTOM-DOMAIN-SETUP.md
git commit -m "docs: add custom domain setup instructions

- Document Vercel domain configuration
- Include DNS nameserver update instructions
- Add SSL/TLS certificate info
- Explain CORS update for custom domain"
```

---

## Phase 5: Verify & Document

### Task 10: Final Verification & Create Deployment Guide

**Files:**
- Create: `DEPLOYMENT-COMPLETE.md` (final checklist)
- Create: `TROUBLESHOOTING.md` (common issues)
- Update: `README.md` (add deployment section)

**Background:**
After deployment, document:
1. What's live and where
2. How to verify it works
3. Common issues and fixes
4. Maintenance procedures

- [ ] **Step 1: Create final deployment checklist**

Create `DEPLOYMENT-COMPLETE.md`:
```markdown
# Deployment Complete - Verification Checklist

## Overview
Newzeland Cerámicas e-commerce is now deployed on Vercel:
- **Frontend (React SPA):** https://newzelland-ceramicas.vercel.app
- **Backend (Serverless API):** Same URL, `/api/*` routes
- **Database:** PostgreSQL on Render.com (or similar)
- **Status:** ✓ Production ready

## URLs and Credentials

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://newzelland-ceramicas.vercel.app | Live |
| Backend API | https://newzelland-ceramicas.vercel.app/api | Live |
| Health Check | /api/health | ✓ |
| Vercel Dashboard | https://vercel.com/dashboard | Admin |
| Database (Render) | https://render.com | Admin |

## Quick Verification (5 minutes)

### 1. Frontend Loads
```bash
curl -I https://newzelland-ceramicas.vercel.app/
# Expected: HTTP 200
```

### 2. Backend Responds
```bash
curl https://newzelland-ceramicas.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 3. Manual Testing
1. Open https://newzelland-ceramicas.vercel.app in browser
2. DevTools → Network tab
3. Click "Register" button
4. Should make POST request to `/api/auth/register`
5. Should NOT error with CORS
6. Should receive response with token

### 4. Protected Routes
1. After login, navigate to `/dashboard`
2. Should show user data from `/api/user/profile`
3. Logout should remove token and redirect to `/login`

## Environment Variables Check

Verify all required variables are set in Vercel:

```bash
vercel env ls
```

Should show:
- [ ] DATABASE_URL (PostgreSQL connection string)
- [ ] JWT_SECRET (long random string)
- [ ] FRONTEND_URL (https://newzelland-ceramicas.vercel.app)
- [ ] VITE_API_URL (same as FRONTEND_URL)
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (if configured)
- [ ] NODE_ENV (production)

## Logs and Monitoring

### View Backend Logs
```bash
vercel logs https://newzelland-ceramicas.vercel.app/api
```

Check for:
- No errors on startup
- Database connection successful
- No "missing environment variable" errors

### View Build Logs
1. Vercel Dashboard → Project → Deployments
2. Click latest deployment
3. View logs for build phase
4. Should see:
   ```
   ✓ Built backend (compiled TypeScript)
   ✓ Built frontend (React bundles)
   ```

### Monitor Function Execution
1. Vercel Dashboard → Functions
2. View execution time per endpoint
3. Should be <500ms for most requests
4. Watch for slow queries (database optimization needed)

## Deployment Workflow Going Forward

### To Deploy Changes
```bash
# 1. Make changes locally
git add .
git commit -m "feat: your feature"

# 2. Test locally
npm run dev    # in frontend
npm run dev    # in backend (in another terminal)

# 3. Push to GitHub
git push origin main

# 4. Vercel automatically deploys
#    Check status: vercel logs --follow
```

### To Roll Back to Previous Version
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirmed rolled back in seconds

## Database Maintenance

### Backup Database
```bash
# Render provides automatic daily backups
# Manual backup:
pg_dump postgresql://user:pass@host:5432/ecommerce_db > backup.sql
```

### Run Migrations After Schema Changes
```bash
# After schema changes in backend/src/db/migrations.ts:
DATABASE_URL="postgresql://..." npm run migrate
```

## Performance Monitoring

### Vercel Analytics
1. Dashboard → Analytics
2. Monitor:
   - Edge location performance
   - Error rates
   - Cold start times

### Browser Performance
1. Frontend has no external dependencies slowing it down
2. Code splitting enabled (Vite)
3. CSS minified
4. Test with: https://pagespeed.web.dev/

## Cost Monitoring

### Vercel
- Free tier includes:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - 2 concurrent concurrent deployments
- Cost: Usually $0/month for starter projects

### Render PostgreSQL
- Free tier: 
  - 1 PostgreSQL database
  - 256 MB storage
  - No backups
- Cost: $7/month for hobby tier (1GB, backups)

### Total Monthly Cost: $7-15 (if using paid Render tier)

## Next Steps

1. [ ] Configure custom domain (optional)
2. [ ] Set up monitoring alerts
3. [ ] Plan database backup strategy
4. [ ] Document API for frontend developers
5. [ ] Set up CI/CD pipeline for automated testing

## Support Contacts

- **Vercel Issues:** https://vercel.com/support
- **Render.com Issues:** https://render.com/help
- **Local Testing:** See INSTRUCC-SETUP.md
```

- [ ] **Step 2: Create troubleshooting guide**

Create `TROUBLESHOOTING.md`:
```markdown
# Deployment Troubleshooting Guide

## Problem: "Database connection refused"

**Symptoms:**
- Backend logs show "connect ECONNREFUSED"
- API returns 500 error
- Error: "getaddrinfo ENOTFOUND"

**Solution:**
1. Check DATABASE_URL is set in Vercel:
   ```bash
   vercel env ls | grep DATABASE_URL
   ```

2. Test connection locally:
   ```bash
   DATABASE_URL="postgresql://..." psql -c "SELECT 1"
   ```

3. Verify Render database is "Available":
   - Go to Render.com dashboard
   - Check PostgreSQL instance status
   - If "Suspending", upgrade or redeploy

4. Check IP whitelist (if applicable):
   - Vercel IPs need access to database
   - Render allows all by default

**If still failing:**
```bash
# View recent logs
vercel logs https://newzelland-ceramicas.vercel.app --tail

# Look for: "Error: connect ECONNREFUSED"
# This means database URL is wrong or database is down
```

---

## Problem: "JWT_SECRET not found" / "CORS error"

**Symptoms:**
- Login fails with 500 error
- Frontend console: "CORS policy: blocked by CORS"
- Backend logs: "Cannot read property 'JWT_SECRET'"

**Solution:**
1. Verify JWT_SECRET in Vercel:
   ```bash
   vercel env ls | grep JWT_SECRET
   ```

2. If missing, add it:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy output and add to Vercel as JWT_SECRET
   ```

3. Verify FRONTEND_URL matches actual frontend:
   ```bash
   vercel env ls | grep FRONTEND_URL
   # Should be: https://newzelland-ceramicas.vercel.app
   ```

4. Redeploy backend after updating:
   ```bash
   vercel --prod
   ```

---

## Problem: "API request returns 404" / "Cannot POST /api/checkout"

**Symptoms:**
- Frontend works, but API calls fail
- Error: "POST /api/auth/login 404"
- Network tab shows request goes to frontend (not backend)

**Solution:**
1. Verify `vercel.json` routes are correct:
   ```json
   {
     "routes": [
       { "src": "^/api/(.*)", "dest": "api/index.js" }
     ]
   }
   ```

2. Check backend TypeScript compiled:
   ```bash
   ls -la backend/dist/app.js
   # If missing, run: npm --prefix backend run build
   ```

3. Verify `api/index.js` exports Express app:
   ```bash
   cat api/index.js
   # Should have: export default app;
   # Or: module.exports = app;
   ```

4. If still failing, rebuild and redeploy:
   ```bash
   cd backend && npm run build
   cd .. && vercel --prod
   ```

---

## Problem: "Frontend blank page" / "Infinite loop loading"

**Symptoms:**
- https://newzelland-ceramicas.vercel.app shows blank page
- Console errors: "Cannot read property 'map'"
- Network tab shows React bundle loading but not executing

**Solution:**
1. Check frontend build completed:
   ```bash
   vercel logs # View build logs
   # Should show: "✓ built in X.XXs"
   ```

2. Verify `frontend/dist/index.html` exists:
   ```bash
   curl -I https://newzelland-ceramicas.vercel.app/
   # Should return HTTP 200
   ```

3. Check React Router routes:
   - App.tsx might be missing routes
   - Ensure all pages are imported

4. Check for runtime errors:
   ```bash
   # Open in browser, DevTools console
   # Should NOT show red errors
   # May show yellow warnings (OK)
   ```

5. Rebuild frontend:
   ```bash
   cd frontend && npm run build
   cd .. && vercel --prod
   ```

---

## Problem: "Slow API responses" / "Cold starts"

**Symptoms:**
- First request to API takes 5-10 seconds
- Subsequent requests fast (<500ms)
- User sees "loading..." spinner

**Causes & Solutions:**

### Cold Start (expected, first time)
- Vercel spins up serverless function
- First request slower (5-10s)
- Subsequent requests fast
- **Normal behavior**, no action needed
- Users see loading spinner (add one!)

### Slow Database Query
- After cold start, still slow
- Might be N+1 query in code
- **Solution:** Check backend logs
  ```bash
  vercel logs --tail | grep "Query time"
  ```
- Optimize database queries

### Connection Pool Exhausted
- Multiple concurrent requests failing
- **Solution:** Add connection pooling in backend
  ```typescript
  const pool = new Pool({
    max: 10,  // Max connections
    idleTimeoutMillis: 30000
  })
  ```

---

## Problem: "Stripe payment fails" / "Email not sending"

**Symptoms:**
- Checkout returns error
- No confirmation email received
- Backend logs: "Stripe API error" or "SMTP error"

**Solutions:**

### Stripe
1. Verify STRIPE_SECRET_KEY in Vercel (starts with `sk_live_`)
2. Check Stripe dashboard for failed charges
3. Ensure payment method is valid
4. Test with Stripe test card: `4242 4242 4242 4242`

### Email (SMTP)
1. Verify SMTP credentials:
   ```bash
   vercel env ls | grep SMTP
   # Should show SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
   ```

2. Test Gmail app password:
   - Go to https://myaccount.google.com/apppasswords
   - Verify app password is correct (16 characters)
   - Not your Gmail password!

3. View email logs:
   ```bash
   # Gmail: Check "Sent" folder
   # Or in backend logs:
   vercel logs --tail | grep -i "email\|smtp"
   ```

---

## Problem: "Deployment failed" / "Build timeout"

**Symptoms:**
- `git push` → Vercel fails to build
- Error: "Build failed: npm run build exited with 1"
- Timeout after 45 seconds

**Solution:**
1. Check build logs:
   ```bash
   vercel logs --all
   # Look for: "ERROR" or "timeout"
   ```

2. Common causes:
   - TypeScript compilation error
   - Missing dependency in package.json
   - Large file blocking build (PDF, image)

3. Test build locally:
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   npm --prefix backend run build
   npm --prefix frontend run build
   ```

4. Fix any errors, then:
   ```bash
   git add .
   git commit -m "fix: build errors"
   git push origin main
   ```

---

## Problem: "Need to rollback deployment"

**Symptoms:**
- Latest deployment broke something
- Need to go back to previous version

**Solution:**
1. Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Confirmed! Site rolled back in seconds

No `git revert` needed, just one click.

---

## Getting More Help

### Check Logs
```bash
# Real-time logs
vercel logs --follow

# All logs (past 24h)
vercel logs --all

# Filter by path
vercel logs /api/checkout
```

### Check Build Details
```bash
# List recent deployments
vercel list

# View specific deployment
vercel inspect <deployment-url>
```

### Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| ECONNREFUSED | Can't connect to database | Check DATABASE_URL, Render status |
| ENOTFOUND | DNS error | Check domain nameservers, DNS propagation |
| ETIMEDOUT | Request took too long | Check database query performance |
| 401 Unauthorized | Missing/invalid JWT | Check JWT_SECRET, token expiration |
| 403 Forbidden | Permission denied | Check user role, admin flag |
| CORS error | Frontend can't reach API | Check FRONTEND_URL, cors() config |

### Ask for Help
- GitHub Issues: Create issue with error logs
- Vercel Support: https://vercel.com/support
- Stack Overflow: Tag with `vercel`, `express`, `postgres`
```

- [ ] **Step 3: Update main README**

Modify `README.md` - add deployment section at end:
```markdown
## Deployment

The application is deployed on Vercel with the following setup:

- **Frontend:** React SPA (static hosted)
- **Backend:** Express.js serverless functions
- **Database:** PostgreSQL (managed)

### Live URL
https://newzelland-ceramicas.vercel.app

### To Deploy Changes
```bash
git push origin main
# Vercel automatically builds and deploys
```

See [DEPLOYMENT-COMPLETE.md](./DEPLOYMENT-COMPLETE.md) for verification checklist.
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

### Environment Variables
All required variables are in Vercel dashboard. See [VERCEL-ENV-SETUP.md](./VERCEL-ENV-SETUP.md).
```

- [ ] **Step 4: Create final verification script**

Create `verify-deployment.sh`:
```bash
#!/bin/bash

# Deployment Verification Script
# Run after deploying to Vercel

URL="https://newzelland-ceramicas.vercel.app"

echo "🚀 Verifying Newzeland Deployment"
echo "=================================="

# Test 1: Frontend loads
echo -n "✓ Frontend loads... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$URL/")
if [ "$status" = "200" ]; then
  echo "OK ($status)"
else
  echo "FAILED ($status)"
fi

# Test 2: Backend health
echo -n "✓ Backend health... "
health=$(curl -s "$URL/api/health" | grep -c "ok")
if [ "$health" = "1" ]; then
  echo "OK"
else
  echo "FAILED"
fi

# Test 3: React Router works
echo -n "✓ React Router /login... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$URL/login")
if [ "$status" = "200" ]; then
  echo "OK"
else
  echo "FAILED"
fi

# Test 4: API CORS
echo -n "✓ CORS configured... "
cors=$(curl -s -I -H "Origin: $URL" "$URL/api/health" | grep -c "Access-Control")
if [ "$cors" -gt "0" ]; then
  echo "OK"
else
  echo "WARNING - CORS not found"
fi

echo ""
echo "✅ Deployment verification complete!"
echo "📊 View logs: vercel logs --follow"
echo "🔧 View dashboard: https://vercel.com/dashboard"
```

Make executable:
```bash
chmod +x verify-deployment.sh
```

Then run:
```bash
./verify-deployment.sh
```

- [ ] **Step 5: Commit Phase 10**

```bash
git add DEPLOYMENT-COMPLETE.md TROUBLESHOOTING.md README.md verify-deployment.sh
git commit -m "docs: add comprehensive deployment documentation

- Create deployment verification checklist
- Add troubleshooting guide for common issues
- Update README with deployment section
- Add verification script for post-deploy testing
- Document environment variables, logs, and monitoring"
```

---

## Final Sign-Off

- [ ] **All Phase 1-5 tasks completed**
- [ ] **Frontend deployed to Vercel**
- [ ] **Backend deployed as serverless functions**
- [ ] **Database connected via PostgreSQL**
- [ ] **Environment variables configured**
- [ ] **All documentation complete**
- [ ] **Deployment verified working**
- [ ] **Troubleshooting guide in place**

---

## Quick Reference

### URLs After Deployment
```
Frontend:    https://newzelland-ceramicas.vercel.app
Backend API: https://newzelland-ceramicas.vercel.app/api
Health Check: https://newzelland-ceramicas.vercel.app/api/health
```

### Key Commands
```bash
# Deploy
vercel --prod

# View logs
vercel logs --follow

# View environment variables
vercel env ls

# Rollback to previous deployment
# Via dashboard: Vercel → Deployments → Previous → Promote

# Test locally
npm --prefix frontend run build
npm --prefix backend run build
```

### Files Modified/Created
- `api/index.js` - Vercel serverless entry
- `vercel.json` - Routing configuration
- `DEPLOYMENT-DB-SETUP.md` - Database instructions
- `VERCEL-ENV-SETUP.md` - Environment variables
- `DEPLOYMENT-COMPLETE.md` - Verification checklist
- `TROUBLESHOOTING.md` - Common issues
- `.env.local`, `.env.vercel.example` - Env templates
