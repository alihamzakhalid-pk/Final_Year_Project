#!/usr/bin/env python
"""Debug email sending directly with Flask app context"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, mail
from flask_mail import Message

with app.app_context():
    try:
        # Check config
        print(f"MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
        print(f"MAIL_PORT: {app.config.get('MAIL_PORT')}")
        print(f"MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
        print(f"MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
        print(f"MAIL_PASSWORD: {'*' * 10 if app.config.get('MAIL_PASSWORD') else 'NOT SET'}")
        
        # Try sending test email
        msg = Message(
            subject="Test Email from BotMe",
            recipients=["test@example.com"],
            body="This is a test email."
        )
        print("\nAttempting to send test email...")
        mail.send(msg)
        print("[OK] Email sent successfully!")
        
    except Exception as e:
        print(f"\n[ERROR] Email error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
