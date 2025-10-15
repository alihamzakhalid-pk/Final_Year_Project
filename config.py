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
