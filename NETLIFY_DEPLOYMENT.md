# Netlify Deployment Guide for Rivalis Hub

## Prerequisites
- Netlify account (free at netlify.com)
- GitHub repository with this code
- Firebase credentials

## Deployment Steps

### 1. Connect to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize
4. Choose your repository
5. Build settings will auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 2. Set Environment Variables
In Netlify Site Settings → Environment:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Custom Domain (Optional)
1. Go to Site Settings → Domain management
2. Add custom domain or use Netlify subdomain

### 4. HTTPS
✅ Automatically enabled with Let's Encrypt

## What's Included in netlify.toml

- ✅ Build configuration
- ✅ SPA redirects (all routes → index.html)
- ✅ Security headers (X-Frame-Options, etc.)
- ✅ Cache control for assets
- ✅ Environment variable configuration
- ✅ Deploy preview settings

## Key Features for Rivalis Hub

### Live Pose Tracking
- Requires camera access: Permissions-Policy allows camera
- Works on HTTPS only (Netlify provides this)

### Real-time Rep Counting
- Handles large TensorFlow & MediaPipe models
- Build includes all dependencies

### Firebase Integration
- Requires valid Firebase credentials in env vars
- Database reads/writes configured in code

## Testing Before Deployment

```bash
# Build locally
npm run build

# Preview production build
npm run serve
```

Then visit http://localhost:4173 to verify.

## Troubleshooting

**Blank page on deploy?**
- Check browser console for errors
- Verify Firebase env vars are set

**Camera not working?**
- Must be HTTPS (Netlify provides this)
- User must grant camera permissions

**Large images slow?**
- Netlify has image optimization
- Consider Cloudinary integration for future

## Monitoring

Use Netlify Analytics to track:
- Build time
- Deploy status
- Traffic
- Performance

---
Happy deploying! 🚀
