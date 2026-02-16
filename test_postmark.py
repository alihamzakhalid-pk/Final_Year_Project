#!/usr/bin/env python
"""Test PostMark email configuration and delivery"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, mail
from flask_mail import Message
import smtplib

def test_postmark():
    print("=" * 60)
    print("POSTMARK EMAIL CONFIGURATION TEST")
    print("=" * 60)
    
    with app.app_context():
        # Check configuration
        print("\n1️⃣  CHECKING CONFIGURATION:")
        print(f"   MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
        print(f"   MAIL_PORT: {app.config.get('MAIL_PORT')}")
        print(f"   MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
        print(f"   MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
        print(f"   MAIL_PASSWORD: {'*' * 10 if app.config.get('MAIL_PASSWORD') else 'NOT SET'}")
        print(f"   MAIL_DEFAULT_SENDER: {app.config.get('MAIL_DEFAULT_SENDER')}")
        
        # Validate configuration
        print("\n2️⃣  VALIDATING CONFIGURATION:")
        
        if app.config.get('MAIL_SERVER') != 'smtp.postmarkapp.com':
            print("   ❌ MAIL_SERVER is NOT set to PostMark SMTP")
            return False
        else:
            print("   ✅ MAIL_SERVER is correct")
        
        if not app.config.get('MAIL_USERNAME'):
            print("   ❌ MAIL_USERNAME not set (should be PostMark API token)")
            return False
        else:
            print("   ✅ MAIL_USERNAME is set")
        
        if not app.config.get('MAIL_PASSWORD'):
            print("   ❌ MAIL_PASSWORD not set (should be PostMark API token)")
            return False
        else:
            print("   ✅ MAIL_PASSWORD is set")
        
        if not app.config.get('MAIL_DEFAULT_SENDER'):
            print("   ❌ MAIL_DEFAULT_SENDER not set (must be verified sender in PostMark)")
            return False
        else:
            print("   ✅ MAIL_DEFAULT_SENDER is set")
        
        # Test SMTP connection
        print("\n3️⃣  TESTING SMTP CONNECTION:")
        try:
            server = smtplib.SMTP(
                app.config.get('MAIL_SERVER'),
                app.config.get('MAIL_PORT'),
                timeout=10
            )
            print(f"   ✅ Connected to {app.config.get('MAIL_SERVER')}:{app.config.get('MAIL_PORT')}")
            
            # Start TLS
            if app.config.get('MAIL_USE_TLS'):
                server.starttls()
                print("   ✅ TLS connection established")
            
            # Login
            server.login(
                app.config.get('MAIL_USERNAME'),
                app.config.get('MAIL_PASSWORD')
            )
            print("   ✅ Authentication successful with PostMark API token")
            
            server.quit()
            print("   ✅ Connection closed properly")
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"   ❌ AUTHENTICATION FAILED: {str(e)}")
            print("   → Check if PostMark API token is correct")
            return False
        except smtplib.SMTPException as e:
            print(f"   ❌ SMTP ERROR: {str(e)}")
            return False
        except Exception as e:
            print(f"   ❌ CONNECTION ERROR: {str(e)}")
            return False
        
        # Test sending email
        print("\n4️⃣  TESTING EMAIL SENDING:")
        try:
            test_email = input("   📧 Enter email address to send test email to: ").strip()
            
            if not test_email:
                print("   ⚠️  No email provided, skipping send test")
                return True
            
            msg = Message(
                subject="[TEST] BotMe PostMark Configuration Test",
                recipients=[test_email],
                body="""
This is a test email from BotMe.

If you received this email, PostMark is working correctly!

Subject: Test Email
Time: Just now
Status: SUCCESS ✅

---
BotMe Team
"""
            )
            
            print(f"   📤 Sending test email to {test_email}...")
            mail.send(msg)
            print(f"   ✅ Email sent successfully to {test_email}!")
            print("   📧 Check your inbox (might be in spam folder)")
            
            return True
            
        except Exception as e:
            print(f"   ❌ EMAIL SEND ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_postmark()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ POSTMARK CONFIGURATION IS WORKING!")
        print("\nPostMark should be able to send verification codes.")
        print("If you still don't receive emails:")
        print("  • Check spam folder")
        print("  • Verify sender email is confirmed in PostMark dashboard")
        print("  • Check PostMark logs at postmarkapp.com")
    else:
        print("❌ POSTMARK CONFIGURATION HAS ISSUES")
        print("\nFix the errors above before trying to send emails.")
    print("=" * 60)
