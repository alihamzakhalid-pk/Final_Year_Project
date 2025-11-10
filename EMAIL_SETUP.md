# Email Setup for 2FA Verification

BotMe now uses 2-factor authentication (2FA) with email verification codes. To enable email sending, you need to configure your email settings.

## Setup Instructions

### 1. Install Dependencies

Make sure you have installed Flask-Mail:
```bash
pip install -r requirements.txt
```

### 2. Configure Email Settings

Create a `.env` file in the project root (or update your existing one) with the following variables:

```env
# Email Configuration (Gmail example)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

### 3. Gmail Setup (Recommended)

If using Gmail, you need to:

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password (not your regular Gmail password) in `MAIL_PASSWORD`

### 4. Other Email Providers

For other email providers, update the settings accordingly:

**Outlook/Hotmail:**
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=true
```

**Yahoo:**
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USE_TLS=true
```

**Custom SMTP:**
```env
MAIL_SERVER=your-smtp-server.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

### 5. Initialize Database

The database will automatically create the `VerificationCode` table when you first run the app. If you need to manually initialize:

```python
from app import app, db
from models import User, ChatData, VerificationCode

with app.app_context():
    db.create_all()
    print("Database initialized successfully!")
```

### 6. Test Email Sending

After configuration, restart your Flask server and try signing up or logging in. You should receive a verification code via email.

## Troubleshooting

- **"Failed to send verification email"**: Check your email credentials and SMTP settings
- **"Connection timeout"**: Verify your firewall isn't blocking port 587
- **Gmail "Less secure app" error**: Use App Passwords instead of your regular password
- **Code not received**: Check spam folder, verify email address is correct

## Security Notes

- Verification codes expire after 10 minutes
- Each code can only be used once
- Codes are automatically deleted after use or expiration
- Never commit your `.env` file with real credentials to version control

