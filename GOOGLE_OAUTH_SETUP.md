# Google OAuth Configuration for StudyBuddy

## Current Google OAuth Credentials
- **Client ID**: `your_google_client_id_here`
- **Client Secret**: `your_google_client_secret_here`

## Steps to Update Google OAuth for Render Deployment

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Navigate to Credentials
1. Select your project
2. Go to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID and click the edit button (pencil icon)

### 3. Update Authorized JavaScript Origins
Add this URL:
```
https://studybuddy-lyni.onrender.com
```

### 4. Update Authorized Redirect URIs
Add this URL:
```
https://studybuddy-lyni.onrender.com/api/auth/google/callback
```

### 5. Save Changes
Click "Save" to apply the changes.

## Your Configuration
Your Render app URL is `https://studybuddy-lyni.onrender.com`, so add:

**Authorized JavaScript Origins:**
- `https://studybuddy-lyni.onrender.com`

**Authorized Redirect URIs:**
- `https://studybuddy-lyni.onrender.com/api/auth/google/callback`

## Testing Google OAuth
After updating:
1. Deploy your app to Render
2. Visit your app URL
3. Try logging in with Google
4. Check browser console and Render logs for any errors

## Troubleshooting
- Make sure URLs match exactly (no trailing slashes)
- Wait a few minutes after saving changes for them to take effect
- Check that your domain is spelled correctly
- Ensure HTTPS is used (HTTP won't work for OAuth)
