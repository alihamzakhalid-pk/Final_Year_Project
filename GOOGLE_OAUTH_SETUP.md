# How to Complete Google OAuth Setup

This guide will walk you through setting up Google OAuth authentication for your BotMe application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "BotMe")
5. Click **"Create"**

## Step 2: Enable Google+ API / OAuth 2.0

1. In your new project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

**Note:** Google+ API is deprecated, but the OAuth 2.0 endpoints still work. You can also enable **"People API"** which is the newer alternative.

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: BotMe (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid`
   - Click **"Update"** → **"Save and Continue"**
7. On the **Test users** page (for testing):
   - Add your email address as a test user
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select application type: **"Web application"**
4. Fill in the details:
   - **Name**: BotMe Web Client (or any name)
   - **Authorized JavaScript origins**: 
     - `http://localhost:5000` (for local backend)
     - `http://localhost:5173` (for local frontend if needed)
     - Add your production URLs when deploying
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/oauth/google/callback`
     - `http://127.0.0.1:5000/api/oauth/google/callback`
     - Add production URLs when deploying (e.g., `https://yourdomain.com/api/oauth/google/callback`)
5. Click **"Create"**
6. **IMPORTANT**: Copy your **Client ID** and **Client Secret** (you won't see the secret again!)

## Step 5: Add Credentials to Your .env File

1. Open or create a `.env` file in your project root directory
2. Add the following lines:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

3. Replace `your-client-id-here` and `your-client-secret-here` with the actual values from Step 4

## Step 6: Configure Frontend URL (Optional)

If your frontend runs on a different URL, add this to your `.env` file:

```env
FRONTEND_URL=http://localhost:5173
```

The default is `http://localhost:5173`, so you only need this if it's different.

## Step 7: Test the Setup

1. Make sure your backend server is running:
   ```bash
   python app.py
   ```

2. Make sure your frontend is running:
   ```bash
   cd botme-ui-react
   npm run dev
   ```

3. Go to your login page and click **"Continue with Google"**
4. You should be redirected to Google's login page
5. After logging in, you'll be redirected back to your app

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console **exactly matches** the callback URL
- It should be: `http://localhost:5000/api/oauth/google/callback`
- Check for trailing slashes, http vs https, and port numbers

### Error: "OAuth is not configured"
- Verify your `.env` file has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Make sure there are no extra spaces or quotes around the values
- Restart your Flask server after adding the credentials

### Error: "Access blocked: This app's request is invalid"
- Make sure you've added your email as a test user in the OAuth consent screen
- If in production, make sure your app is published

### Testing with Production
When deploying to production:
1. Update the **Authorized JavaScript origins** and **Authorized redirect URIs** in Google Cloud Console
2. Use HTTPS URLs (Google requires HTTPS for production)
3. Update `FRONTEND_URL` in your `.env` file to your production URL

## Security Notes

- **NEVER** commit your `.env` file to version control
- Keep your Client Secret secure
- Use environment variables in production, not hardcoded values
- Consider using a secrets management service for production

## Next Steps

Once Google OAuth is working:
- The user will be automatically created in your database on first login
- Users can log in with just their Google account
- No password is stored for OAuth users

Your OAuth flow is already implemented in the code - you just needed the credentials!

