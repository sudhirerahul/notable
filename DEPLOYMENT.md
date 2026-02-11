# Notable - Deployment Guide

## ✅ Application Status

Your Notable application is **fully built and ready to deploy**!

- ✅ Full-stack Next.js application
- ✅ LLM extraction pipeline with GPT-4
- ✅ Smart scheduling algorithm
- ✅ Google Calendar integration
- ✅ Slack webhooks
- ✅ Dark-themed UI with confidence badges
- ✅ All code committed to Git

## 🚀 Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with your GitHub account

2. **Click "Add New Project"**

3. **Import this Git repository**
   - If it's not on GitHub yet, push it first:
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/notable.git
     git push -u origin main
     ```

4. **Configure Environment Variables** in Vercel:
   ```
   DATABASE_URL=your-postgres-connection-string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENAI_API_KEY=your-openai-api-key
   ```

5. **Click "Deploy"**

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Easiest)

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Copy the `DATABASE_URL` and add it to your environment variables
4. Run migrations:
   ```bash
   npx prisma db push
   ```

### Option 2: External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Add it as `DATABASE_URL` environment variable
4. Run:
   ```bash
   npx prisma db push
   ```

## 🔑 Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** (or select existing)

3. **Enable APIs**:
   - Google Calendar API
   - Google+ API (for OAuth)

4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-app.vercel.app/api/auth/callback/google
     ```

5. **Copy Client ID and Client Secret** to your environment variables

## 🤖 OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Create a new API key
4. Add it as `OPENAI_API_KEY` environment variable

## ⚙️ Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET`.

## 🧪 Test Locally Before Deploying

1. **Create `.env.local`** file with all environment variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   OPENAI_API_KEY="sk-..."
   ```

2. **Push database schema**:
   ```bash
   npx prisma db push
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 📋 Post-Deployment Checklist

After deploying:

- [ ] Test sign in with Google
- [ ] Upload a sample meeting transcript
- [ ] Verify tasks are extracted
- [ ] Test task scheduling (requires Google Calendar connected)
- [ ] Check Slack notifications (optional)
- [ ] Verify all pages load correctly
- [ ] Test on mobile

## 🔧 Common Issues

### Build Fails

- Make sure all environment variables are set
- Verify `DATABASE_URL` is accessible from Vercel
- Check build logs for specific errors

### OAuth Not Working

- Verify redirect URIs match exactly
- Make sure both HTTP (localhost) and HTTPS (production) URIs are added
- Check Google Cloud Console for any errors

### Database Connection Issues

- Ensure DATABASE_URL includes `?schema=public` for Vercel Postgres
- Verify database is accessible from Vercel's region
- Run `npx prisma db push` to create tables

## 🎉 You're Done!

Your Notable application is now live! Share the URL and start extracting tasks from meeting transcripts.

**Live URL**: `https://your-app.vercel.app`

---

Built with [Claude Code](https://claude.com/claude-code)
