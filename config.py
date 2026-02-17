import os
from dotenv import load_dotenv

# Load existing .env and also support a file named `env` (some setups use this instead of `.env')
load_dotenv()

# Also support loading a file named `env` (some setups use this instead of `.env')
# This allows the repository's `env` file to be picked up in local dev.
if os.path.exists('env'):
    load_dotenv('env', override=True)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'alihamzakhalid.pk@gmail.com'
    # Prefer DATABASE_URL from Render (Postgres), fallback to SQLite
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = db_url or 'sqlite:///botme.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    # GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB for uploads
    # Cookie/session settings for dev via Vite proxy (same-origin requests)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'false').lower() in ['true', '1']
    
    # Flask-Mail configuration (Gmail SMTP)
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or MAIL_USERNAME
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    FACEBOOK_CLIENT_ID = os.environ.get('FACEBOOK_CLIENT_ID')
    FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET')
    MICROSOFT_CLIENT_ID = os.environ.get('MICROSOFT_CLIENT_ID')
    MICROSOFT_CLIENT_SECRET = os.environ.get('MICROSOFT_CLIENT_SECRET')
    APPLE_CLIENT_ID = os.environ.get('APPLE_CLIENT_ID')
    APPLE_CLIENT_SECRET = os.environ.get('APPLE_CLIENT_SECRET')
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')

    # OAuth redirect URI overrides (optional)
    # GOOGLE_REDIRECT_URI removed as per user request (legacy logic)
    
    # Frontend URL for OAuth redirects
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')