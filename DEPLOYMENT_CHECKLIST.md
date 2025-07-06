# StudyBuddy Deployment Checklist

## Pre-Deployment Steps

### 1. Update Environment Variables in Render
- [ ] Set `MONGODB_URI` with your Atlas connection string
- [ ] Set `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Set `GOOGLE_CALLBACK_URL=https://YOUR_RENDER_URL.onrender.com/api/auth/google/callback`
- [ ] Set `FRONTEND_URL=https://YOUR_RENDER_URL.onrender.com`

### 2. Update Google OAuth Settings
- [ ] Add your Render URL to Authorized JavaScript Origins
- [ ] Add callback URL to Authorized Redirect URIs
- [ ] Save changes in Google Cloud Console

### 3. MongoDB Atlas Configuration
- [ ] Ensure IP whitelist includes `0.0.0.0/0` (or Render's IP ranges)
- [ ] Verify database user has read/write permissions
- [ ] Test connection string

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

### 2. Deploy on Render
- [ ] Trigger new deployment
- [ ] Monitor build logs
- [ ] Check for any build errors

### 3. Post-Deployment Testing
- [ ] Website loads without errors
- [ ] Login page displays correctly
- [ ] Regular signup/login works
- [ ] Google OAuth login works
- [ ] Dashboard loads after login
- [ ] API endpoints respond correctly
- [ ] Real-time features work (if applicable)

## Common Issues and Solutions

### Build Fails
- Check that all dependencies are in package.json
- Verify build command is correct: `npm run build`
- Check for syntax errors in code

### Google OAuth Not Working
- Verify callback URLs match exactly
- Check that HTTPS is used
- Ensure environment variables are set correctly

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions

### API Calls Failing
- Verify CORS configuration
- Check that frontend is making requests to correct endpoints
- Monitor network tab in browser dev tools

## Environment Variables Template
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-app.onrender.com
```

## Final Steps
1. Test all functionality thoroughly
2. Monitor Render logs for any runtime errors
3. Set up monitoring/alerts if needed
4. Document any additional configuration for team members
