# StudyBuddy Deployment Guide for Render

## Prerequisites
- MongoDB Atlas account with database set up
- Google OAuth credentials configured
- Cloudinary account for image uploads
- Render account

## Step 1: Update Environment Variables

### In Render Dashboard:
Go to your Render service settings and add these environment variables:

```
MONGODB_URI=mongodb+srv://studybuddy_user:studybuddy_pass123@cluster0.qqfov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=10000
JWT_SECRET=super_secret_key_you_set_in_render_12345
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=dzmoqbtcc
CLOUDINARY_API_KEY=741374862448134
CLOUDINARY_API_SECRET=7S6Sqk-RpSi8rRwMiVGsuTPJWw0
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://studybuddy-lyni.onrender.com/api/auth/google/callback
FRONTEND_URL=https://studybuddy-lyni.onrender.com
```

**IMPORTANT**: Your Render app URL is `studybuddy-lyni.onrender.com`

## Step 2: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add these to Authorized redirect URIs:
   - `https://studybuddy-lyni.onrender.com/api/auth/google/callback`
5. Add these to Authorized JavaScript origins:
   - `https://studybuddy-lyni.onrender.com`

## Step 3: Render Configuration

### Build Command:
```
npm run build
```

### Start Command:
```
npm start
```

### Root Directory:
Leave empty (use repository root)

## Step 4: Deploy

1. Push all changes to your GitHub repository
2. In Render, trigger a new deployment
3. Monitor the build logs for any errors

## Step 5: Test Deployment

After deployment, test these features:
- [ ] Website loads correctly
- [ ] Regular login/signup works
- [ ] Google OAuth login works
- [ ] API endpoints respond correctly
- [ ] Real-time features work (if any)

## Troubleshooting

### Common Issues:

1. **Google OAuth not working**: Check that callback URLs match exactly
2. **API calls failing**: Verify CORS settings and frontend URL configuration
3. **Database connection issues**: Check MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for Render)
4. **Build failures**: Check that all dependencies are in package.json

### Logs:
Check Render logs for detailed error messages:
- Build logs for build-time issues
- Runtime logs for server errors
