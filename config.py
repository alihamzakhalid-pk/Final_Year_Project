import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///botme.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    # GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB for uploads
    # Cookie/session settings for dev via Vite proxy (same-origin requests)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'   # safe default for same-origin via proxy
    SESSION_COOKIE_SECURE = False     # set True behind HTTPS in prod
    
    # Flask-Mail configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or MAIL_USERNAME