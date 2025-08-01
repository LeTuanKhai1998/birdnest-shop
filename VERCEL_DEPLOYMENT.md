# Vercel Deployment Guide for Birdnest Shop

## Overview
This guide explains how to deploy the Birdnest Shop frontend to Vercel. The project is a monorepo with the frontend in the `frontend/` directory.

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

## Configuration Files

### vercel.json
The `frontend/vercel.json` file configures Vercel to:
- Use Next.js framework
- Set up API routes with Node.js 18.x runtime
- Map environment variables

### .vercelignore
Excludes unnecessary files from deployment:
- Backend directory
- Development files
- Test files
- Documentation

## Environment Variables Setup

### Required Environment Variables
Set these in your Vercel project settings:

#### Core Configuration
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Authentication
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-string
```

#### OAuth Providers (Optional)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Payment Integration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### File Upload
```
UPLOADTHING_SECRET=sk_live_your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

#### Email Service
```
RESEND_API_KEY=re_your-resend-api-key
```

#### Feature Flags
```
NEXT_PUBLIC_ENABLE_OAUTH=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_ENABLE_EMAIL=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

## Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `LeTuanKhai1998/birdnest-shop`

### 2. Configure Project Settings
1. **Framework Preset**: Next.js
2. **Root Directory**: `frontend` (set this in Vercel project settings)
3. **Build Command**: `npm run build` (automatic for Next.js)
4. **Output Directory**: `.next` (automatic for Next.js)
5. **Install Command**: `npm install` (automatic for Next.js)

### 3. Set Environment Variables
1. In project settings, go to "Environment Variables"
2. Add all required variables listed above
3. Set them for "Production", "Preview", and "Development" environments

### 4. Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. Monitor the build logs for any issues

## Troubleshooting

### Common Issues

#### 1. "No Next.js version detected"
- **Solution**: Ensure Root Directory is set to `frontend` in Vercel project settings
- **Check**: Verify `next` is in `frontend/package.json` dependencies

#### 2. Build failures
- **Check**: Environment variables are properly set
- **Check**: All dependencies are installed
- **Check**: No TypeScript errors

#### 3. API routes not working
- **Check**: `NEXT_PUBLIC_API_URL` points to your backend
- **Check**: Backend is deployed and accessible
- **Check**: CORS is configured on backend

#### 4. Authentication issues
- **Check**: `NEXTAUTH_URL` matches your Vercel domain
- **Check**: OAuth provider URLs are updated for production
- **Check**: `NEXTAUTH_SECRET` is set

### Build Logs
Monitor build logs in Vercel dashboard:
- Green checkmark = successful deployment
- Red X = build failure (check logs for details)

## Post-Deployment

### 1. Verify Deployment
- Check all pages load correctly
- Test authentication flow
- Verify API integrations work
- Test payment flow (if enabled)

### 2. Set Up Custom Domain (Optional)
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 3. Monitor Performance
- Use Vercel Analytics
- Monitor Core Web Vitals
- Check error logs

## Backend Deployment
The backend should be deployed separately (e.g., Railway, Render, or VPS) and the `NEXT_PUBLIC_API_URL` should point to it.

## Support
If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally with production environment
4. Check Next.js and Vercel documentation 