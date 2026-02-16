"""
FIREBASE SETUP INSTRUCTIONS FOR OTP AUTHENTICATION

⚠️ IMPORTANT: Follow these steps BEFORE running the app

=== STEP 1: Create Firebase Project ===
1. Go to: https://console.firebase.google.com/
2. Click "Create a project"
3. Name: "BotMe"
4. Enable Google Analytics (optional)
5. Click "Create"

=== STEP 2: Get Service Account Credentials ===
1. In Firebase Console, go to: Settings (gear icon) → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save the JSON file as "firebase-credentials.json" in project root:
   c:\Users\HK\Desktop\BOtmeAI\Final_Year_Project\firebase-credentials.json

⚠️ IMPORTANT: Never commit this file to git! Add to .gitignore

=== STEP 3: Enable Email Provider ===
1. In Firebase Console, go to: Authentication
2. Click "Sign-in method"
3. Click "Email/Password" → Enable it
4. Scroll down to "Email enumeration protection" 
5. Choose: "Do not enable email enumeration protection" (for development)
6. Click "Save"

=== STEP 4: Get Firebase Config ===
1. In Firebase Console, go to: Project Settings
2. Copy your Web API credentials:
   - apiKey
   - authDomain
   - projectId
   - etc.
3. You'll need these for React frontend

=== STEP 5: Update .env File ===
Add these to your .env:

# Firebase (Flask Backend)
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Firebase (React Frontend) - Get from Firebase Console
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

=== STEP 6: Install Dependencies ===
Backend: pip install -r requirements.txt
Frontend: cd botme-ui-react && npm install

=== STEP 7: Test OTP ===
python test_firebase_otp.py

=== DONE! ===
Now run: python app.py
Your OTP verification should work 100% reliably!
"""

# This file is for reference - no code to execute
