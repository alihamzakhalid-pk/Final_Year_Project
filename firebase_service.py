"""Firebase OTP Authentication Service"""
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from firebase_admin import db as firebase_db
import os
import json
from datetime import datetime, timedelta

# Get project root directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FIREBASE_CREDS_PATH = os.path.join(PROJECT_ROOT, 'firebase-credentials.json')

# Initialize Firebase
# Initialize Firebase
def init_firebase():
    """Initialize Firebase with service account credentials"""
    try:
        # 1. Try environment variable first (Best for Render/Cloud)
        creds_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
        if creds_json:
            print("[FIREBASE] Initializing from environment variable")
            creds_dict = json.loads(creds_json)
            creds = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(creds)
            print("[FIREBASE] [OK] Initialized successfully from ENV")
            return True

        # 2. Fallback to local file
        if os.path.exists(FIREBASE_CREDS_PATH):
            print(f"[FIREBASE] Found credentials at: {FIREBASE_CREDS_PATH}")
            creds = credentials.Certificate(FIREBASE_CREDS_PATH)
            firebase_admin.initialize_app(creds)
            print("[FIREBASE] [OK] Initialized successfully from file")
            return True
        else:
            print(f"[FIREBASE] [WARNING] Credentials not found (Neither ENV nor {FIREBASE_CREDS_PATH})")
            return False
    except Exception as e:
        print(f"[FIREBASE] [ERROR] Initialization failed: {str(e)}")
        return False


def send_otp_via_firebase(phone_number: str, email: str) -> dict:
    """
    Send OTP via Email using the main App's email service
    """
    try:
        # Import here to avoid circular dependencies if any, 
        # though app.py doesn't seem to import firebase_service at top level.
        from app import app, db, VerificationCode, send_verification_email, generate_verification_code
        
        # Ensure we are in an app context
        with app.app_context():
            # Check if Firebase is initialized (optional check)
            if not firebase_admin._apps:
                print("[FIREBASE Warning] Firebase not initialized, but proceeding with Email OTP")

            # Delete old codes for this email and purpose
            VerificationCode.query.filter_by(email=email, purpose='firebase_login').delete()
            
            # Generate new code
            code = generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=10)
            
            # Create verification entry
            verification = VerificationCode(
                email=email,
                code=code,
                purpose='firebase_login',
                expires_at=expires_at
            )
            db.session.add(verification)
            db.session.commit()
            
            # Send email using app's mailer
            # Using 'signup' purpose for now as it gives a generic "Verification Code" email
            print(f"[FIREBASE] Sending OTP email to {email}")
            
            # ALWAYS PRINT CODE FOR DEBUGGING
            print(f"[FIREBASE DEBUG] [KEY] OTP CODE: {code}")
            
            success = send_verification_email(email, code, purpose='signup')
            
            if success:
                return {
                    'success': True,
                    'message': 'OTP sent to your email',
                    'code': None 
                }
            else:
                 # Email failure
                print(f"[FIREBASE] Email sending failed or not configured.")
                return {
                    'success': False,
                    'message': 'Email failed to send. Please check server logs.',
                    'code': None
                }
        
    except Exception as e:
        print(f"[FIREBASE ERROR] {str(e)}")
        return {
            'success': False,
            'message': f'Error sending OTP: {str(e)}',
            'code': None
        }


def verify_otp_via_firebase(otp_code: str, email: str) -> dict:
    """
    Verify OTP code from database
    """
    try:
        from app import app, db, VerificationCode
        
        with app.app_context():
            # Find verification code
            verification = VerificationCode.query.filter_by(
                email=email, 
                code=otp_code, 
                purpose='firebase_login'
            ).first()
            
            if not verification:
                return {
                    'success': False,
                    'message': 'Invalid verification code'
                }
            
            if verification.is_expired():
                db.session.delete(verification)
                db.session.commit()
                return {
                    'success': False,
                    'message': 'Verification code has expired'
                }
            
            # Code is valid!
            print(f"[FIREBASE] OTP Verified for {email}")
            
            # Generate Custom Token (if Firebase is initialized)
            custom_token = None
            if firebase_admin._apps:
                try:
                    custom_token = firebase_auth.create_custom_token(email)
                    if isinstance(custom_token, bytes):
                        custom_token = custom_token.decode('utf-8')
                except Exception as ft_e:
                    print(f"[FIREBASE] Could not create custom token: {ft_e}")
            
            # Cleanup used code
            db.session.delete(verification)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'OTP verified successfully',
                'user_id': email,
                'token': custom_token
            }
        
    except Exception as e:
        print(f"[FIREBASE ERROR] {str(e)}")
        return {
            'success': False,
            'message': f'Error verifying OTP: {str(e)}'
        }


# Initialize on import
_firebase_initialized = init_firebase()
