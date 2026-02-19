from flask import Flask, request, redirect, url_for, flash, jsonify, session
from sqlalchemy import func, text
import re
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from config import Config
from models import db, User, ChatData, VerificationCode, VoiceSample, GeneratedAudio
from elevenlabs_client import ElevenLabsClient
import os
import json
import random
import string
import requests
import urllib.parse
import hashlib
from parse_chat import parse_chat_file
from personality_analysis import analyze_personality
from datetime import datetime, timedelta
from oauth_handler import get_oauth_auth_url, exchange_oauth_code, get_or_create_oauth_user
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Global request object to cache Google certificates for much faster login
GOOGLE_REQUEST = google_requests.Request()

from rag_chatbot import (
    get_chatbot_response_rag,  # NEW RAG SYSTEM
    create_vector_store,
    delete_vector_store
)

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# Check OpenAI Key status
if app.config.get('OPENAI_API_KEY'):
    print(f"[STARTUP] OpenAI API Key is configured: {app.config['OPENAI_API_KEY'][:8]}...")
else:
    print("[STARTUP] WARNING: OpenAI API Key is NOT configured in .env")


# Session configuration for secure API key storage
# In production, SESSION_COOKIE_SECURE should be True (HTTPS only)
# In development, it must be False to work with HTTP
is_production = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('RENDER') is not None
app.config['SESSION_COOKIE_SECURE'] = is_production  # HTTPS only in production
app.config['SESSION_COOKIE_HTTPONLY'] = True  # No JavaScript access
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if is_production else 'Lax'  # None allows cross-site cookies in prod
app.config['REMEMBER_COOKIE_SECURE'] = is_production
app.config['REMEMBER_COOKIE_SAMESITE'] = 'None' if is_production else 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)  # Extend session life
app.config['SESSION_REFRESH_EACH_REQUEST'] = True  # Reset timer on each request

# Enable CORS for SPA
# IMPORTANT: When supports_credentials=True, origins cannot be "*"
# Must use explicit origins
CORS(app, 
     origins=[
         "https://botme-ai-frontend.onrender.com",
         "http://localhost:5173",
         "http://127.0.0.1:5173"
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize Flask-Mail
mail = Mail(app)


def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


from threading import Thread

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"[EMAIL] [OK] Background thread successfully sent email")
        except Exception as e:
            print(f"[EMAIL ERROR] Background thread failed to send email: {str(e)}")

def send_verification_email(email, code, purpose='signup'):
    """Send verification or reset code email (ASYNCHRONOUS)"""
    # OTP AUTH DISABLED TEMPORARILY - But keeping for future or logs
    try:
        # [DEBUG] ALWAYS PRINT CODE TO CONSOLE
        print(f"\n[APP DEBUG] [KEY] Sending Code to {email}: {code}\n")

        # Check if mail is configured
        if not app.config.get('MAIL_USERNAME') or not app.config.get('MAIL_PASSWORD'):
            print("[EMAIL ERROR] MAIL_USERNAME or MAIL_PASSWORD not configured in .env file")
            return False

        if purpose == 'signup':
            subject = f"Your BotMe Verification Code - {code}"
            body = f"Verification Code: {code}"
        else:  # password reset
            subject = "Reset your BotMe password"
            body = f"Reset Code: {code}"

        print(f"[EMAIL] Triggering background thread to send email to {email}")
        msg = Message(subject=subject, recipients=[email], body=body)
        
        # Start a background thread to send the email
        thread = Thread(target=send_async_email, args=(app, msg))
        thread.start()
        
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {str(e)}")
        return False




def serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'fullName': getattr(user, 'full_name', None) or user.username,
        'is_admin': getattr(user, 'is_admin', False),
        'is_active': getattr(user, 'is_active', True),
        'oauth_provider': user.oauth_provider,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login': user.last_login.isoformat() if getattr(user, 'last_login', None) else None,
    }


def generate_username(candidate: str) -> str:
    base = candidate.strip() or 'user'
    base = re.sub(r'[^a-zA-Z0-9]+', '-', base).strip('-').lower() or 'user'
    username = base
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base}{counter}"
        counter += 1
    return username


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Unauthorized'}), 401
    return redirect(url_for('login'))

from functools import wraps

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Create DB tables and clean up old temp entries on startup
with app.app_context():
    db.create_all()
    
    # [MIGRATION] Handle PostgreSQL column length issues on Render
    if os.environ.get('RENDER'):
        try:
            # PostgreSQL needs a manual ALTER to expand the column if it was already created
            db.session.execute(text("ALTER TABLE \"user\" ALTER COLUMN password_hash TYPE VARCHAR(500)"))
            db.session.commit()
            print("[MIGRATION] Successfully expanded user.password_hash column")
        except Exception as e:
            # Ignore if column is already long or doesn't exist yet
            db.session.rollback()
            print(f"[MIGRATION] Note: Column expansion check skipped or failed (likely already updated): {e}")

    # Optional: Clean up old temp entries (older than 1 hour)
    cutoff = datetime.utcnow() - timedelta(hours=1)
    temp_entries = ChatData.query.filter_by(is_temp=True).filter(ChatData.created_at < cutoff).all()
    for entry in temp_entries:
        db.session.delete(entry)
    db.session.commit()

ALLOWED_EXTENSIONS = {'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============================================================
# LEGACY HTML ROUTES - Removed (Using React Frontend Now)
# These routes now return JSON for API-only backend
# ============================================================

@app.route('/')
def index():
    """Root endpoint - returns API info for backend-only deployment"""
    return jsonify({
        'name': 'BotMe API',
        'version': '1.0.0',
        'status': 'running',
        'message': 'This is the API backend. Please access the frontend at your frontend URL.',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/login, /api/signup, /api/logout',
            'chat': '/api/chat/<chat_id>/rag'
        }
    })

# Legacy routes - redirect to frontend or return JSON
@app.route('/signup')
@app.route('/login')
@app.route('/dashboard')
@app.route('/select_person')
@app.route('/chat/<int:chat_id>')
def legacy_routes(**kwargs):
    """Legacy HTML routes - now handled by React frontend"""
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    return jsonify({
        'error': 'This route is handled by the frontend',
        'redirect': frontend_url,
        'message': 'Please access the frontend application directly'
    }), 302

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})


'''@app.route('/api/chat/<int:chat_id>', methods=['POST'])
@app.route('/api/chat/<int:chat_id>/message', methods=['POST'])  # Alias for backward compatibility
@login_required
def api_chat(chat_id):
    data = request.json or {}
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    # Verify chat exists and belongs to user
    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=False).first()
    if not chat:
        exists_for_other = ChatData.query.filter_by(id=chat_id).first()
        if exists_for_other:
            return jsonify({'error': 'You do not have permission to send messages to this chat'}), 403
        return jsonify({'error': f'Chat with ID {chat_id} not found or not ready. Please select a persona first.'}), 404
    
    if not chat.selected_person:
        return jsonify({'error': 'No persona selected for this chat. Please go back and select a persona.'}), 400
    
    try:
        response = get_chatbot_response(chat_id, user_input)
        return jsonify({'response': response})
    except Exception as e:
        import traceback
        print(f"Chatbot error: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500
'''

# Simple health check endpoint
@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({'status': 'ok'}), 200

# ---------------------
# JSON API for SPA
# ---------------------

@app.route('/api/me', methods=['GET'])
def api_me():
    if current_user.is_authenticated:
        # Refresh user data from database to ensure we have latest is_admin status
        db.session.refresh(current_user)
        print(f"[API-ME] User {current_user.username} - is_admin: {current_user.is_admin}")
        return jsonify({
            'authenticated': True,
            'user': serialize_user(current_user)
        })
    return jsonify({'authenticated': False}), 200

@app.route('/api/signup', methods=['POST'])
def api_signup():
    """Create account directly (No OTP)"""
    data = request.json or {}
    full_name = (data.get('fullName') or data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    # [OTP BYPASS] Create user directly
    username = generate_username(full_name or email.split('@')[0])
    user = User(username=username, email=email, full_name=full_name)
    user.set_password(password)

    if email == app.config.get('ADMIN_EMAIL'):
        user.is_admin = True

    db.session.add(user)
    db.session.commit()
    
    login_user(user)
    
    return jsonify({
        'message': 'Account created successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 201



@app.route('/api/verify-signup', methods=['POST'])
def api_verify_signup():
    """Verify code and create account (Kept for compatibility, but deprecated)"""
    return jsonify({'error': 'This endpoint is deprecated. Please use /api/signup directly.'}), 410


@app.route('/api/login', methods=['POST'])
def api_login():
    """Direct login with password"""
    data = request.json or {}
    identifier = data.get('identifier') or data.get('username') or data.get('email')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    
    if '@' in identifier:
        user = User.query.filter_by(email=identifier.lower()).first()
    else:
        user = User.query.filter_by(username=identifier).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username/email or password'}), 401
    
    if user.email == app.config.get('ADMIN_EMAIL') and not user.is_admin:
        user.is_admin = True
        db.session.commit()

    login_user(user)
    return jsonify({
        'message': 'Logged in successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 200



# ==========================================
# OAUTH ROUTES (Google, Facebook, etc.)
# ==========================================

@app.route('/api/oauth/<provider>/login')
def oauth_login(provider):
    """Initiate OAuth login flow"""
    auth_url = get_oauth_auth_url(provider)
    if not auth_url:
        return jsonify({'error': f'Unsupported provider {provider} or missing configuration'}), 400
    return redirect(auth_url)


@app.route('/api/oauth/<provider>/callback')
def oauth_callback(provider):
    """Handle OAuth callback"""
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        return jsonify({'error': f'Provider error: {error}'}), 400
        
    if not code:
        return jsonify({'error': 'Missing authorization code'}), 400
    
    # Construct the same redirect URI used to start the flow
    # Logic matches oauth_handler.py default
    # Must match the one generated in get_oauth_auth_url
    redirect_uri = url_for('oauth_callback', provider=provider, _external=True)
    
    # Ensure 'http' vs 'https' matches what Render usage expects if behind proxy
    if request.headers.get('X-Forwarded-Proto') == 'https':
        redirect_uri = redirect_uri.replace('http:', 'https:')

    user_info = exchange_oauth_code(provider, code, redirect_uri)
    if not user_info:
        return jsonify({'error': 'Failed to authenticate with provider. Token exchange failed.'}), 401
    
    # Get or create local user account
    user = get_or_create_oauth_user(provider, user_info)
    if not user:
         return jsonify({'error': 'Failed to create or retrieve user'}), 500
         
    # Login the user
    login_user(user)
    
    # Redirect to Frontend Dashboard
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    return redirect(f"{frontend_url}/dashboard")


# ==========================================
# GOOGLE OAUTH - ID TOKEN FLOW (for @react-oauth/google)
# ==========================================

@app.route('/api/oauth/google/id-token', methods=['POST'])
def api_google_id_token():
    """Verify Google ID token from @react-oauth/google popup.
    
    - If user exists: log them in and return { new_user: false, user: {...} }
    - If new user: send verification code, return { new_user: true, email, name }
    """
    data = request.json or {}
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Missing Google ID token'}), 400
    
    # Verify the Google ID token
    try:
        client_id = app.config.get('GOOGLE_CLIENT_ID')
        if not client_id:
            return jsonify({'error': 'Google OAuth not configured on server'}), 500
        
        idinfo = id_token.verify_oauth2_token(
            token,
            GOOGLE_REQUEST,  # Use cached certificates
            client_id
        )
        
        google_email = idinfo.get('email', '').strip().lower()
        google_name = idinfo.get('name', '')
        google_id = idinfo.get('sub', '')  # Google's unique user ID
        
        if not google_email:
            return jsonify({'error': 'No email found in Google account'}), 400
        
    except ValueError as e:
        print(f"[GOOGLE-ID-TOKEN] Token verification failed: {e}")
        return jsonify({'error': 'Invalid Google token. Please try again.'}), 401
    except Exception as e:
        print(f"[GOOGLE-ID-TOKEN] Unexpected error verifying token: {e}")
        return jsonify({'error': 'Failed to verify Google token'}), 500
    
    # Check if user already exists (by oauth_id OR by email case-insensitively)
    user = User.query.filter_by(oauth_provider='google', oauth_id=str(google_id)).first()
    if not user:
        # Use func.lower for robust email matching across different providers/cases
        user = User.query.filter(func.lower(User.email) == google_email.lower()).first()
    
    if user:
        # ---- EXISTING USER: log in directly ----
        needs_commit = False
        if not user.oauth_provider:
            # Link Google to existing email account
            user.oauth_provider = 'google'
            user.oauth_id = str(google_id)
            needs_commit = True
        
        # Auto-promote Admin on Google Login if needed
        if user.email == app.config.get('ADMIN_EMAIL') and not user.is_admin:
            user.is_admin = True
            needs_commit = True
            print(f"[GOOGLE-ID-TOKEN] Auto-promoting existing user {user.email} to Admin")

        login_user(user)
        user.last_login = datetime.utcnow()
        
        if needs_commit or True: # Always commit last_login
            db.session.commit()
        
        print(f"[GOOGLE-ID-TOKEN] Existing user logged in: {user.email}")
        return jsonify({
            'new_user': False,
            'message': 'Logged in successfully',
            'user': serialize_user(user),
            'token': 'session'
        }), 200
    
    # ---- NEW USER: send verification code ----
    # Delete any existing verification codes for this email
    VerificationCode.query.filter_by(email=google_email, purpose='signup').delete()
    
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store Google info in temp_data so we can create the user later
    temp_data = json.dumps({
        'fullName': google_name,
        'email': google_email,
        'google_id': google_id,
        'oauth_provider': 'google'
    })
    
    verification = VerificationCode(
        email=google_email,
        code=code,
        purpose='signup',
        expires_at=expires_at,
        temp_data=temp_data
    )
    db.session.add(verification)
    db.session.commit()
    
    # [OTP BYPASS] Skip sending email for Google signup
    print(f"[GOOGLE-ID-TOKEN] New user, bypassing OTP email for {google_email}")
    return jsonify({
        'new_user': True,
        'email': google_email,
        'name': google_name,
        'google_id': google_id,
        'code': 'BYPASS_OTP',  # [OTP BYPASS]
        'message': 'Google account verified. Please set your password.'
    }), 200



@app.route('/api/oauth/google/complete-signup', methods=['POST'])
def api_google_complete_signup():
    """Complete signup for a new Google OAuth user (OTP Bypassed)"""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    password = data.get('password')
    full_name = data.get('name', '')
    google_id = data.get('google_id', '')
    
    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # [OTP BYPASS] We don't check the code anymore
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409
    
    username = generate_username(full_name or email.split('@')[0])
    user = User(
        username=username,
        email=email,
        full_name=full_name,
        oauth_provider='google',
        oauth_id=str(google_id) if google_id else None
    )

    if email == app.config.get('ADMIN_EMAIL'):
        user.is_admin = True

    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    login_user(user)
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Account created successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 201




# OTP AUTH DISABLED TEMPORARILY
# @app.route('/api/request-password-reset', methods=['POST'])
# def api_request_password_reset():
#     """Send a reset code to the user's email."""
#     data = request.json or {}
#     email = (data.get('email') or '').strip().lower()
# 
#     if not email:
#         return jsonify({'error': 'Email is required'}), 400
# 
#     user = User.query.filter_by(email=email).first()
#     if not user:
#         # Avoid leaking which emails exist
#         return jsonify({'message': 'If an account exists, a reset code has been sent'}), 200
# 
#     if user.oauth_provider and not user.password_hash:
#         return jsonify({'error': f"This account uses {user.oauth_provider.capitalize()} sign-in. Use that provider to sign in."}), 400
# 
#     # Remove existing reset codes for this email
#     VerificationCode.query.filter_by(email=email, purpose='reset').delete()
# 
#     code = generate_verification_code()
#     expires_at = datetime.utcnow() + timedelta(minutes=10)
# 
#     verification = VerificationCode(
#         email=email,
#         code=code,
#         purpose='reset',
#         expires_at=expires_at,
#         temp_data=None,
#     )
#     db.session.add(verification)
#     db.session.commit()
# 
#     if send_verification_email(email, code, 'reset'):
#         return jsonify({'message': 'Reset code sent to your email', 'email': email}), 200
#     
#     return jsonify({'error': 'Failed to send reset email. Please check your email configuration.'}), 500


    return jsonify({'error': 'Failed to send reset email. Please check your email configuration.'}), 500


# OTP AUTH DISABLED TEMPORARILY
# @app.route('/api/reset-password', methods=['POST'])
# def api_reset_password():
#     """Reset password after verifying the code."""
#     data = request.json or {}
#     email = (data.get('email') or '').strip().lower()
#     code = (data.get('code') or '').strip()
#     new_password = data.get('new_password') or data.get('password')
# 
#     if not email or not code or not new_password:
#         return jsonify({'error': 'Email, code, and new password are required'}), 400
# 
#     if len(new_password) < 8:
#         return jsonify({'error': 'Password must be at least 8 characters long'}), 400
# 
#     verification = VerificationCode.query.filter_by(
#         email=email,
#         code=code,
#         purpose='reset'
#     ).first()
# 
#     if not verification:
#         return jsonify({'error': 'Invalid reset code'}), 400
# 
#     if verification.is_expired():
#         db.session.delete(verification)
#         db.session.commit()
#         return jsonify({'error': 'Reset code has expired. Please request a new one.'}), 400
# 
#     user = User.query.filter_by(email=email).first()
#     if not user:
#         db.session.delete(verification)
#         db.session.commit()
#         return jsonify({'error': 'User not found'}), 404
# 
#     # Update password
#     user.set_password(new_password)
# 
#     db.session.delete(verification)
#     db.session.commit()
# 
#     login_user(user)
# 
#     return jsonify({
#         'message': 'Password updated successfully',
#         'user': serialize_user(user),
#         'token': 'session'
#     }), 200


@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'message': 'Logged out'})

@app.route('/api/upload', methods=['POST'])
@login_required
def api_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only .txt files are allowed.'}), 400
    try:
        content = file.read().decode('utf-8', errors='ignore')
        if not content or len(content.strip()) < 50:
            return jsonify({'error': 'File appears empty or too short. Please ensure it contains valid chat messages.'}), 400
        parsed = parse_chat_file(content)
        if not parsed.get('participants') or len(parsed['participants']) < 2:
            return jsonify({'error': 'Could not find at least 2 participants. Please ensure your WhatsApp export contains messages from multiple people.'}), 400
        total_messages = sum(len(msgs) for msgs in parsed['messages_by_person'].values())
        if total_messages < 10:
            return jsonify({'error': 'Not enough messages found. Please upload a chat with at least 10 messages.'}), 400
        temp_chat = ChatData(
            user_id=current_user.id,
            selected_person=None,
            all_messages=json.dumps(parsed['messages_by_person']),
            messages='[]',
            conversation_history='[]',
            is_temp=True
        )
        db.session.add(temp_chat)
        db.session.commit()
        # Refresh to ensure we have the ID
        db.session.refresh(temp_chat)
        
        participants = [
            {'name': name, 'count': len(msgs)}
            for name, msgs in parsed['messages_by_person'].items()
        ]
        participants = sorted(participants, key=lambda x: x['count'], reverse=True)
        
        print(f"[UPLOAD] Created chat {temp_chat.id} for user {current_user.id} with {len(participants)} participants")
        return jsonify({'chat_id': temp_chat.id, 'participants': participants, 'status': 'uploaded'})
    except ValueError as ve:
        # Parse errors from parse_chat_file
        return jsonify({'error': f'Chat parsing error: {str(ve)}'}), 400
    except json.JSONDecodeError as je:
        return jsonify({'error': 'Error processing chat data. Please ensure the file is a valid WhatsApp export.'}), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Upload error: {error_trace}")
        return jsonify({'error': f'Upload failed: {str(e)}. Please check the file format and try again.'}), 500

@app.route('/api/select_person', methods=['POST'])
@login_required
def api_select_person():
    data = request.json or {}
    person_name = data.get('person')
    chat_id = data.get('chat_id', None)
    try:
        chat_id = int(chat_id)
    except Exception:
        return jsonify({'error': 'Invalid chat ID'}), 400
    
    print(f"[SELECT_PERSON] User {current_user.id} selecting person '{person_name}' for chat {chat_id}")
    temp_chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=True).first()
    if not temp_chat:
        # Check if chat exists but is not temp (already configured)
        existing_chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id).first()
        if existing_chat:
            print(f"[SELECT_PERSON] Chat {chat_id} already configured with person '{existing_chat.selected_person}'")
            return jsonify({'chat_id': chat_id, 'person': existing_chat.selected_person, 'status': 'ready'})
        return jsonify({'error': 'Chat not found or expired'}), 404
    
    all_messages_dict = json.loads(temp_chat.all_messages)
    selected_msgs = all_messages_dict.get(person_name, [])
    if not selected_msgs:
        return jsonify({'error': 'No messages found for selected person'}), 400
    # NEW: Store ALL messages for RAG, but mark we're using full dataset
    all_msgs_for_rag = selected_msgs  # Keep all messages
    first_300_for_old = selected_msgs[:300]  # First 300 for OLD system
    
    # Store ALL messages for RAG to search through
    temp_chat.messages = json.dumps(all_msgs_for_rag)
    # ================================
    
    temp_chat.selected_person = person_name
    temp_chat.conversation_history = '[]'
    temp_chat.is_temp = False
    temp_chat.all_messages = ''
    db.session.commit()
    db.session.refresh(temp_chat)
    
    print(f"[SELECT_PERSON] Chat {chat_id} configured with person '{person_name}', is_temp={temp_chat.is_temp}")
    print(f"[SELECT_PERSON] Stored {len(all_msgs_for_rag)} messages for RAG")
    
    # ===== RAG: CREATE VECTOR STORE =====
    try:
        # Get user's OpenAI API key from session (if they provided one)
        user_openai_key = session.get('openai_api_key')
        if not user_openai_key:
             print(f"[SELECT_PERSON] No user API key found in session, using .env key")
        else:
             print(f"[SELECT_PERSON] Using user-provided OpenAI API key")
             
        print(f"[SELECT_PERSON] Creating RAG vector store for chat {chat_id}...")
        create_vector_store(temp_chat, user_openai_key)
        print(f"[SELECT_PERSON] ✅ RAG vector store created successfully")
    except Exception as e:
        print(f"[SELECT_PERSON] ⚠️ Warning: Failed to create RAG vector store: {e}")
        print(f"[SELECT_PERSON] Chat will still work with old system")
    # =====================================

    return jsonify({'chat_id': chat_id, 'person': person_name, 'status': 'ready'})


@app.route('/api/analyze', methods=['POST'])
@login_required
def api_analyze():
    data = request.json or {}
    chat_id = data.get('uploadId') or data.get('chatId') or data.get('chat_id')
    try:
        chat_id = int(chat_id)
    except Exception:
        return jsonify({'error': 'Invalid chat ID'}), 400

    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id).first()
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    participants = []
    if chat.all_messages:
        try:
            all_messages = json.loads(chat.all_messages)
        except (TypeError, json.JSONDecodeError):
            all_messages = {}
        participants = [
            {'name': name, 'count': len(msgs)}
            for name, msgs in all_messages.items()
        ]
        participants = sorted(participants, key=lambda x: x['count'], reverse=True)

    status = 'ready' if chat.is_temp else 'configured'
    return jsonify({'chat_id': chat_id, 'status': status, 'participants': participants, 'selected_person': chat.selected_person})


@app.route('/api/chat/<int:chat_id>/participants', methods=['GET'])
@login_required
def api_chat_participants(chat_id):
    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id).first()
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    participants = []
    if chat.all_messages:
        try:
            all_messages = json.loads(chat.all_messages)
        except (TypeError, json.JSONDecodeError):
            all_messages = {}
        participants = [
            {'name': name, 'count': len(msgs)}
            for name, msgs in all_messages.items()
        ]
        participants = sorted(participants, key=lambda x: x['count'], reverse=True)

    return jsonify({'chat_id': chat_id, 'participants': participants, 'is_temp': chat.is_temp})


@app.route('/api/chat/<int:chat_id>/context', methods=['GET'])
@login_required
def api_chat_context(chat_id):
    print(f"[CONTEXT] Request for chat {chat_id} by user {current_user.id}")
    # Use fresh query to avoid caching issues
    db.session.expire_all()
    chat = db.session.query(ChatData).filter_by(id=chat_id, user_id=current_user.id).first()
    if not chat:
        # Check if chat exists but belongs to another user
        exists_for_other = db.session.query(ChatData).filter_by(id=chat_id).first()
        if exists_for_other:
            print(f"[CONTEXT] Chat {chat_id} exists but belongs to user {exists_for_other.user_id}, not {current_user.id}")
            return jsonify({'error': 'You do not have permission to access this chat'}), 403
        print(f"[CONTEXT] Chat {chat_id} not found in database")
        # Check all chats for this user for debugging
        user_chats = db.session.query(ChatData).filter_by(user_id=current_user.id).all()
        print(f"[CONTEXT] User {current_user.id} has {len(user_chats)} chats total: {[c.id for c in user_chats]}")
        return jsonify({'error': f'Chat with ID {chat_id} not found. It may have been deleted or expired.'}), 404
    
    print(f"[CONTEXT] Found chat {chat_id}, is_temp={chat.is_temp}, selected_person={chat.selected_person}")

    try:
        history = json.loads(chat.conversation_history or '[]')
    except (TypeError, json.JSONDecodeError):
        history = []

    participants = []
    if chat.all_messages:
        try:
            all_messages = json.loads(chat.all_messages)
        except (TypeError, json.JSONDecodeError):
            all_messages = {}
        participants = [
            {'name': name, 'count': len(msgs)}
            for name, msgs in all_messages.items()
        ]
        participants = sorted(participants, key=lambda x: x['count'], reverse=True)

    return jsonify({
        'chat_id': chat_id,
        'selected_person': chat.selected_person,
        'history': history,
        'ready': not chat.is_temp,
        'is_temp': chat.is_temp,
        'participants': participants
    })

@app.route('/api/chat/<int:chat_id>', methods=['POST'])
@app.route('/api/chat/<int:chat_id>/message', methods=['POST'])  # Alias for backward compatibility
@login_required
def api_chat(chat_id):
    """
    OLD SYSTEM: Original chatbot endpoint (uses first 300 messages in prompt)
    Kept for backward compatibility and comparison with RAG system
    """
    data = request.json or {}
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    # Verify chat exists and belongs to user
    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=False).first()
    if not chat:
        exists_for_other = ChatData.query.filter_by(id=chat_id).first()
        if exists_for_other:
            return jsonify({'error': 'You do not have permission to send messages to this chat'}), 403
        return jsonify({'error': f'Chat with ID {chat_id} not found or not ready. Please select a persona first.'}), 404
    
    if not chat.selected_person:
        return jsonify({'error': 'No persona selected for this chat. Please go back and select a persona.'}), 400
    
    try:
        print(f"\n[API] OLD SYSTEM endpoint called for chat {chat_id}")
        response = get_chatbot_response(chat_id, user_input)
        return jsonify({'response': response, 'source': 'standard'})
    except Exception as e:
        import traceback
        print(f"[API] Chatbot error: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500


@app.route('/api/chat/<int:chat_id>/rag', methods=['POST'])
@login_required
def api_chat_rag(chat_id):
    """
    NEW RAG SYSTEM: RAG-powered chatbot endpoint (retrieves relevant messages)
    Use this endpoint to test RAG vs standard system
    """
    data = request.json or {}
    user_input = data.get('message')
    
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    # Verify chat exists and belongs to user
    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=False).first()
    if not chat:
        exists_for_other = ChatData.query.filter_by(id=chat_id).first()
        if exists_for_other:
            return jsonify({'error': 'You do not have permission to send messages to this chat'}), 403
        return jsonify({'error': f'Chat with ID {chat_id} not found or not ready. Please select a persona first.'}), 404
    
    if not chat.selected_person:
        return jsonify({'error': 'No persona selected for this chat. Please go back and select a persona.'}), 400
    
    try:
        # Get user's OpenAI API key from session (if they provided one)
        user_openai_key = session.get('openai_api_key')
        
        if not user_openai_key:
            # Fallback to environment variable
            print(f"[API] No user API key found in session for user {current_user.id}, using .env key")
        else:
            print(f"[API] Using user-provided OpenAI API key for user {current_user.id}")
        
        print(f"\n[API] RAG SYSTEM endpoint called for chat {chat_id}")
        response = get_chatbot_response_rag(chat_id, user_input, user_openai_key)
        return jsonify({'response': response, 'source': 'rag'})
    except Exception as e:
        import traceback
        print(f"[API] RAG chatbot error: {traceback.format_exc()}")
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500

# =========================================


@app.route('/api/personas', methods=['GET'])
@login_required
def api_personas():
    """Get all saved personas (non-temp chats) for the current user"""
    chats = ChatData.query.filter_by(user_id=current_user.id, is_temp=False).order_by(ChatData.created_at.desc()).all()
    personas = []
    for chat in chats:
        try:
            history = json.loads(chat.conversation_history or '[]')
            message_count = len(history)
            last_chat_date = chat.created_at
            if history:
                last_message = history[-1]
                if last_message.get('timestamp'):
                    try:
                        last_chat_date = datetime.fromtimestamp(last_message['timestamp'] / 1000)
                    except:
                        pass
        except:
            message_count = 0
            last_chat_date = chat.created_at
        
        personas.append({
            'chat_id': chat.id,
            'name': chat.selected_person or 'Unknown',
            'message_count': message_count,
            'last_chat_date': last_chat_date.isoformat() if isinstance(last_chat_date, datetime) else None,
        })
    return jsonify({'personas': personas})

@app.route('/api/chat/<int:chat_id>', methods=['DELETE'])
@login_required
def api_delete_chat(chat_id):
    """Delete a chat/persona"""
    chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id).first()
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    # ===== RAG: DELETE VECTOR STORE =====
    try:
        print(f"[DELETE] Deleting RAG vector store for chat {chat_id}...")
        delete_vector_store(chat_id)
        print(f"[DELETE] ✅ Vector store deleted")
    except Exception as e:
        print(f"[DELETE] ⚠️ Warning: Failed to delete vector store: {e}")
    # ====================================

    db.session.delete(chat)
    db.session.commit()
    return jsonify({'message': 'Chat deleted successfully'})

@app.route('/api/account/delete', methods=['DELETE'])
@login_required
def api_delete_account():
    """Delete user account and all associated data"""
    try:
        user = current_user

        # ===== RAG: DELETE ALL VECTOR STORES FOR USER =====
        user_chats = ChatData.query.filter_by(user_id=user.id).all()
        for chat in user_chats:
            try:
                print(f"[DELETE ACCOUNT] Deleting vector store for chat {chat.id}...")
                delete_vector_store(chat.id)
            except Exception as e:
                print(f"[DELETE ACCOUNT] Warning: Failed to delete vector store {chat.id}: {e}")
        # ==================================================
        
        # Delete all chat data associated with the user
        ChatData.query.filter_by(user_id=user.id).delete()
        
        # Delete any verification codes for this user's email
        VerificationCode.query.filter_by(email=user.email).delete()
        
        # Delete the user account
        db.session.delete(user)
        db.session.commit()
        
        # Logout the user (session will be invalid)
        logout_user()
        
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete account: {str(e)}'}), 500

@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.json or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    if not name or not email or not message:
        return jsonify({'error': 'All fields are required'}), 400
    # For now just log the inquiry; integrate with email/provider later
    print(f"[CONTACT] {name} <{email}>: {message}")
    return jsonify({'message': 'Thanks for reaching out!'}), 200

# Test endpoint to verify route registration
@app.route('/api/personality/test', methods=['GET'])
def api_personality_test():
    """Test endpoint to verify personality route is accessible"""
    return jsonify({'message': 'Personality API route is working', 'status': 'ok'}), 200

# Debug endpoint to list all routes
@app.route('/api/debug/routes', methods=['GET'])
def api_debug_routes():
    """List all registered routes for debugging"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify({'routes': routes}), 200

@app.route('/api/personality/<int:chat_id>', methods=['GET'])
@login_required
def api_personality_analysis(chat_id):
    """Get personality analysis for a specific chat/persona"""
    try:
        print(f"[PERSONALITY] ====== START REQUEST ======")
        print(f"[PERSONALITY] Request for chat {chat_id} by user {current_user.id}")
        print(f"[PERSONALITY] Current user: {current_user.username if current_user else 'None'}")
        
        # Refresh session to avoid stale data
        db.session.expire_all()
        
        # First check if chat exists for this user (allow both temp and non-temp)
        # Try multiple query approaches to handle edge cases
        chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id).first()
        
        # If not found, try without user_id filter (to see if chat exists at all)
        if not chat:
            chat_any_user = ChatData.query.filter_by(id=chat_id).first()
            if chat_any_user:
                print(f"[PERSONALITY] Chat {chat_id} exists but belongs to user {chat_any_user.user_id}, not {current_user.id}")
                return jsonify({'error': 'You do not have permission to access this chat'}), 403
            
            # Debug: List all chats for this user (both temp and non-temp)
            all_user_chats = ChatData.query.filter_by(user_id=current_user.id).all()
            all_user_chats_info = [
                {'id': c.id, 'is_temp': c.is_temp, 'selected_person': c.selected_person} 
                for c in all_user_chats
            ]
            print(f"[PERSONALITY] Chat {chat_id} not found. User {current_user.id} has {len(all_user_chats)} chats:")
            print(f"[PERSONALITY] Chat details: {all_user_chats_info}")
            
            # Provide more helpful error message with available chats
            non_temp_chats = [c for c in all_user_chats if not c.is_temp and c.selected_person]
            if len(all_user_chats) == 0:
                return jsonify({'error': f'No chats found for your account. Please upload a chat file first.'}), 404
            elif len(non_temp_chats) == 0:
                return jsonify({
                    'error': f'Chat with ID {chat_id} not found or not ready. Please select a persona for your chat first.',
                    'available_chats': all_user_chats_info,
                    'hint': 'All your chats are still in temporary state. Please go to the chat and select a persona.'
                }), 404
            else:
                ready_chat_ids = [c.id for c in non_temp_chats]
                return jsonify({
                    'error': f'Chat with ID {chat_id} not found. Available ready chat IDs: {ready_chat_ids}',
                    'available_chats': all_user_chats_info,
                    'ready_chat_ids': ready_chat_ids
                }), 404
        
        print(f"[PERSONALITY] Found chat {chat_id}, is_temp={chat.is_temp}, selected_person={chat.selected_person}")
        
        # Check if chat is still temp (not ready)
        if chat.is_temp:
            print(f"[PERSONALITY] Chat {chat_id} is still temp, returning 400")
            return jsonify({'error': 'Chat is not ready yet. Please select a persona first.'}), 400
        
        # Check if persona is selected
        if not chat.selected_person:
            print(f"[PERSONALITY] Chat {chat_id} has no selected_person, returning 400")
            return jsonify({'error': 'No persona selected for this chat. Please select a persona first.'}), 400
        
        # Check if there are messages to analyze
        try:
            messages_data = json.loads(chat.messages or '[]')
            print(f"[PERSONALITY] Chat {chat_id} has {len(messages_data)} messages")
            if not messages_data or len(messages_data) == 0:
                print(f"[PERSONALITY] Chat {chat_id} has no messages, returning 400")
                return jsonify({'error': 'No messages found for analysis. Please ensure the chat has messages.'}), 400
        except (json.JSONDecodeError, TypeError) as e:
            print(f"[PERSONALITY] Error parsing messages for chat {chat_id}: {e}")
            return jsonify({'error': 'Invalid message data in chat. Please re-upload the chat file.'}), 400
        
        print(f"[PERSONALITY] Analyzing chat {chat_id} for person {chat.selected_person}")
        
        # Perform personality analysis
        analysis = analyze_personality(chat)
        
        print(f"[PERSONALITY] Analysis complete for chat {chat_id}")
        print(f"[PERSONALITY] ====== END REQUEST ======")
        return jsonify(analysis), 200
        
    except Exception as e:
        print(f"[PERSONALITY] ====== ERROR ======")
        print(f"[PERSONALITY] Error analyzing chat {chat_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"[PERSONALITY] ====== END ERROR ======")
        return jsonify({'error': f'Failed to analyze personality: {str(e)}'}), 500


# ==================== JWT-BASED GOOGLE OAUTH ENDPOINT ====================

@app.route('/api/oauth/google/callback', methods=['POST'])
def google_callback():
    """Handle Google OAuth with JWT token verification - sends verification code"""
    try:
        # If user is already logged in, just redirect to dashboard
        print(f"[OAUTH-JWT] current_user.is_authenticated: {current_user.is_authenticated}")
        if current_user.is_authenticated:
            print(f"[OAUTH-JWT] User {current_user.username} already authenticated. Returning new_user=false")
            return jsonify({
                'message': 'Already logged in',
                'user': serialize_user(current_user),
                'new_user': False
            }), 200
        
        data = request.get_json() or {}
        token = data.get('token')
        
        if not token:
            print("[OAUTH-JWT] Error: Missing token")
            return jsonify({'error': 'Missing token'}), 400
        
        print(f"[OAUTH-JWT] Verifying Google token...")
        
        # Get Google Client ID from environment
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        if not google_client_id:
            print("[OAUTH-JWT] ERROR: GOOGLE_CLIENT_ID not configured")
            return jsonify({'error': 'Google OAuth not configured on server'}), 500
        
        try:
            # Verify the JWT token
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                google_client_id
            )
            
            print(f"[OAUTH-JWT] Token verified for {idinfo.get('email')}")
            
            # Extract user info
            email = idinfo.get('email')
            name = idinfo.get('name')
            google_id = idinfo.get('sub')
            
            if not email:
                return jsonify({'error': 'No email in token'}), 400
            
            # Check if user exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Existing user - update OAuth info if not set
                if not user.oauth_provider:
                    user.oauth_provider = 'google'
                    user.oauth_id = google_id
                    db.session.commit()
                print(f"[OAUTH-JWT] Existing user found: {email}")
            else:
                # New user - store temp data and send verification code
                print(f"[OAUTH-JWT] New user signup via Google: {email}")
                
                # Delete any existing verification codes for this email
                VerificationCode.query.filter_by(email=email, purpose='oauth_signup').delete()
                
                # Generate verification code
                code = generate_verification_code()
                expires_at = datetime.utcnow() + timedelta(minutes=10)
                
                # Store temporary user data (will be used after verification)
                temp_data = json.dumps({
                    'email': email,
                    'fullName': name,
                    'oauth_provider': 'google',
                    'oauth_id': google_id
                })
                
                # Save verification code
                verification = VerificationCode(
                    email=email,
                    code=code,
                    purpose='oauth_signup',
                    expires_at=expires_at,
                    temp_data=temp_data
                )
                db.session.add(verification)
                db.session.commit()
                
                # Send verification email
                email_sent = send_verification_email(email, code, 'signup')
                
                if email_sent:
                    print(f"[OAUTH-JWT] Verification code sent to {email}")
                    return jsonify({
                        'message': 'Verification code sent to your email',
                        'email': email,
                        'name': name,
                        'new_user': True
                    }), 200
                else:
                    return jsonify({
                        'error': 'Failed to send verification email. Please try again.'
                    }), 500
            
            # Existing user - login immediately
            login_user(user)
            print(f"[OAUTH-JWT] Existing user logged in: {email}")
            
            return jsonify({
                'message': 'Login successful',
                'user': serialize_user(user),
                'token': 'session',
                'new_user': False
            }), 200
            
        except ValueError as e:
            print(f"[OAUTH-JWT] Token verification failed: {str(e)}")
            return jsonify({'error': f'Invalid token: {str(e)}'}), 400
            
    except Exception as e:
        print(f"[OAUTH-JWT] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 500


@app.route('/api/oauth/verify-signup', methods=['POST'])
def oauth_verify_signup():
    """Verify Google OAuth signup code and create account"""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({'error': 'Missing email or verification code'}), 400
    
    print(f"[OAUTH-JWT] Verifying signup code for {email}")
    
    # Find verification code
    verification = VerificationCode.query.filter_by(
        email=email, 
        code=code, 
        purpose='oauth_signup'
    ).first()
    
    if not verification:
        return jsonify({'error': 'Invalid verification code'}), 400
    
    if verification.is_expired():
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'Verification code has expired. Please sign up again.'}), 400
    
    # Load temporary data
    temp_data = json.loads(verification.temp_data or '{}')
    name = temp_data.get('fullName', '')
    oauth_provider = temp_data.get('oauth_provider', 'google')
    oauth_id = temp_data.get('oauth_id')
    
    # Get optional password from request
    password = request.json.get('password') if request.json else None
    
    # Generate username
    username = generate_username(name or email.split('@')[0])
    
    # Create user
    user = User(
        username=username,
        email=email,
        full_name=name,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        is_active=True
    )
    
    # Set password if provided (optional for OAuth users)
    if password:
        user.set_password(password)
        print(f"[OAUTH-JWT] Password set for new OAuth user: {email}")
    else:
        print(f"[OAUTH-JWT] No password set - OAuth-only account: {email}")
    
    db.session.add(user)
    
    # Delete verification code
    db.session.delete(verification)
    db.session.commit()
    
    # Login user
    login_user(user)
    print(f"[OAUTH-JWT] User created and logged in: {email}")
    
    return jsonify({
        'message': 'Account created successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 201


# ==================== USER API KEY ENDPOINTS ====================

@app.route('/api/user/openai-key', methods=['POST'])
@login_required
def set_openai_key():
    """Store and VERIFY user's OpenAI API key in session"""
    data = request.json or {}
    api_key = data.get('api_key', '').strip()
    
    if not api_key:
        return jsonify({'error': 'API key required'}), 400
    
    # --- VERIFICATION STEP ---
    print(f"[API_KEY] Verifying key for user {current_user.username}...")
    try:
        # We'll use a simple models list request to verify the key
        # We use requests directly to avoid initializing a full OpenAI client just for this
        response = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )
        
        if response.status_code != 200:
            error_msg = "Invalid OpenAI API key. Please check the key and try again."
            if response.status_code == 401:
                error_msg = "The OpenAI API key provided is invalid or inactive."
            elif response.status_code == 429:
                 print("[API_KEY] Warning: Rate limited or quota exceeded during check")
                 # We allow 429 because the key might be valid but out of funds
            else:
                return jsonify({'error': error_msg, 'details': response.text}), response.status_code
            
            if response.status_code == 401:
                return jsonify({'error': error_msg}), 401

    except Exception as e:
        print(f"[API_KEY] Verification request failed: {e}")
        # If the network request fails, we might still want to save it and let 
        # actual chat attempts fail later, but for now we warn:
        return jsonify({'error': f"Could not verify key: {str(e)}"}), 500

    # Store in server session
    session['openai_api_key'] = api_key
    session.permanent = True
    session.modified = True
    print(f"[API_KEY] Verified key saved to session for user {current_user.username}")
    
    return jsonify({'message': 'API key verified and stored securely in session'}), 200


@app.route('/api/user/openai-key', methods=['GET'])
@login_required
def check_openai_key():
    """Check if user has API key in session"""
    has_key = 'openai_api_key' in session
    return jsonify({'has_key': has_key}), 200


@app.route('/api/user/openai-key', methods=['DELETE'])
@login_required
def delete_openai_key():
    """Clear API key from session"""
    session.pop('openai_api_key', None)
    return jsonify({'message': 'API key removed from session'}), 200

# ============================================================


# ==================== ADMIN API ENDPOINTS ====================




@app.route('/api/admin/stats', methods=['GET'])
@login_required
@admin_required
def admin_stats():
    """Get admin dashboard statistics"""
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_chats = ChatData.query.filter_by(is_temp=False).count()
    total_messages = 0
    
    # Count messages across all chats
    chats = ChatData.query.filter_by(is_temp=False).all()
    for chat in chats:
        try:
            messages = json.loads(chat.messages or '[]')
            total_messages += len(messages)
        except:
            pass
    
    # Recent signups (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_signups = User.query.filter(User.created_at >= week_ago).count()
    
    # Admin count
    admin_count = User.query.filter_by(is_admin=True).count()
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_chats': total_chats,
        'total_messages': total_messages,
        'recent_signups': recent_signups,
        'admin_count': admin_count
    })


@app.route('/api/admin/users', methods=['GET'])
@login_required
@admin_required
def admin_get_users():
    """Get all users for admin panel"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%')) |
            (User.full_name.ilike(f'%{search}%'))
        )
    
    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    users = []
    for user in pagination.items:
        chat_count = ChatData.query.filter_by(user_id=user.id, is_temp=False).count()
        users.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': getattr(user, 'full_name', None),
            'is_admin': getattr(user, 'is_admin', False),
            'is_active': getattr(user, 'is_active', True),
            'oauth_provider': user.oauth_provider,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if getattr(user, 'last_login', None) else None,
            'chat_count': chat_count
        })
    
    return jsonify({
        'users': users,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def admin_get_user(user_id):
    """Get single user details"""
    user = User.query.get_or_404(user_id)
    chats = ChatData.query.filter_by(user_id=user.id, is_temp=False).all()
    
    chat_list = []
    for chat in chats:
        try:
            messages = json.loads(chat.messages or '[]')
            message_count = len(messages)
        except:
            message_count = 0
        
        chat_list.append({
            'id': chat.id,
            'persona': chat.selected_person,
            'message_count': message_count,
            'created_at': chat.created_at.isoformat() if chat.created_at else None
        })
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': getattr(user, 'full_name', None),
        'is_admin': getattr(user, 'is_admin', False),
        'is_active': getattr(user, 'is_active', True),
        'oauth_provider': user.oauth_provider,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login': user.last_login.isoformat() if getattr(user, 'last_login', None) else None,
        'chats': chat_list
    })


@app.route('/api/admin/users/<int:user_id>/toggle-admin', methods=['POST'])
@login_required
@admin_required
def admin_toggle_admin(user_id):
    """Toggle admin status for a user"""
    if user_id == current_user.id:
        return jsonify({'error': 'Cannot change your own admin status'}), 400
    
    user = User.query.get_or_404(user_id)
    user.is_admin = not getattr(user, 'is_admin', False)
    db.session.commit()
    
    return jsonify({
        'message': f"Admin status {'granted' if user.is_admin else 'revoked'} for {user.username}",
        'is_admin': user.is_admin
    })


@app.route('/api/admin/users/<int:user_id>/toggle-active', methods=['POST'])
@login_required
@admin_required
def admin_toggle_active(user_id):
    """Toggle active status for a user (ban/unban)"""
    if user_id == current_user.id:
        return jsonify({'error': 'Cannot deactivate your own account'}), 400
    
    user = User.query.get_or_404(user_id)
    user.is_active = not getattr(user, 'is_active', True)
    db.session.commit()
    
    return jsonify({
        'message': f"User {user.username} {'activated' if user.is_active else 'deactivated'}",
        'is_active': user.is_active
    })


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def admin_delete_user(user_id):
    """Delete a user and all their data"""
    if user_id == current_user.id:
        return jsonify({'error': 'Cannot delete your own account from admin panel'}), 400
    
    user = User.query.get_or_404(user_id)
    
    # Delete all user's chats first
    ChatData.query.filter_by(user_id=user.id).delete()
    
    # Delete user
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': f'User {user.username} and all their data deleted'})


@app.route('/api/admin/check', methods=['GET'])
@login_required
def admin_check():
    """Check if current user is admin"""
    # Re-query user from database to get latest is_admin status
    user = User.query.get(current_user.id)
    if not user:
        print(f"[ADMIN-CHECK] User {current_user.id} not found in database")
        return jsonify({'is_admin': False}), 401
    
    is_admin = getattr(user, 'is_admin', False)
    print(f"[ADMIN-CHECK] User {user.username} (ID: {user.id}) - is_admin: {is_admin}")
    return jsonify({
        'is_admin': is_admin,
        'user': serialize_user(user)
    })

@app.route('/api/debug/test-email/<email>', methods=['GET'])
def debug_test_email(email):
    """Debug endpoint to test email configuration"""
    try:
        # Check config variables explicitly
        config_check = {
            'MAIL_SERVER': app.config.get('MAIL_SERVER'),
            'MAIL_PORT': app.config.get('MAIL_PORT'),
            'MAIL_USERNAME': app.config.get('MAIL_USERNAME'),
            'MAIL_PASSWORD': 'SET' if app.config.get('MAIL_PASSWORD') else 'NOT SET',
            'MAIL_USE_TLS': app.config.get('MAIL_USE_TLS'),
            'MAIL_USE_SSL': app.config.get('MAIL_USE_SSL')
        }
        
        if not app.config.get('MAIL_USERNAME') or not app.config.get('MAIL_PASSWORD'):
            return jsonify({
                'error': 'Mail credentials not configured',
                'config': config_check
            }), 200  # Return 200 so browser shows the JSON

        msg = Message(
            subject="BotMe Debug Email",
            recipients=[email],
            body=f"This is a test email from your BotMe deployment.\n\nConfiguration:\n{json.dumps(config_check, indent=2)}"
        )
        
        # Send SYNCHRONOUSLY to catch errors
        print(f"[DEBUG EMAIL] Attempting to send to {email}...")
        mail.send(msg)
        print(f"[DEBUG EMAIL] Sent successfully to {email}")
        
        return jsonify({
            'message': 'Email sent successfully',
            'config': config_check
        }), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[DEBUG EMAIL] Failed: {str(e)}")
        return jsonify({
            'error': str(e),
            'traceback': error_trace,
            'config': config_check
        }), 200  # Return 200 so browser shows the JSON

# ==================== VOICE & TTS ENDPOINTS ====================

@app.route('/api/voice/upload', methods=['POST'])
@login_required
def api_voice_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    persona_name = request.form.get('persona_name', 'Unknown')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        # Check Allowed extensions from Config
        # secure_filename returns just the name, we need extension
        original_filename = file.filename
        if '.' not in original_filename:
             return jsonify({'error': 'No file extension'}), 400
             
        ext = original_filename.rsplit('.', 1)[1].lower()
        if ext not in Config.ALLOWED_AUDIO_EXTENSIONS:
             return jsonify({'error': 'Invalid file type'}), 400

        filename = secure_filename(f"voice_{current_user.id}_{int(datetime.utcnow().timestamp())}.{ext}")
        
        # Determine paths
        voice_uploads_dir = os.path.join(Config.UPLOAD_FOLDER, 'voice_samples')
        os.makedirs(voice_uploads_dir, exist_ok=True)
        
        file_path = os.path.join(voice_uploads_dir, filename)
        
        try:
            # 1. Save file locally
            file_path = os.path.abspath(file_path)
            file.save(file_path)
            
            file_size = os.path.getsize(file_path)
            print(f"[VOICE-CLONE] Saved file to absolute path: {file_path} ({file_size} bytes)")
            
            # 2. Clone voice via ElevenLabs
            client = ElevenLabsClient()
            try:
                print(f"[VOICE-CLONE] Starting ElevenLabs cloning for persona: {persona_name}")
                voice_data = client.clone_voice(
                    name=f"{persona_name} (User {current_user.id})",
                    description=f"Cloned voice for persona {persona_name}",
                    audio_files=[file_path]
                )
                print(f"[VOICE-CLONE] Successfully cloned voice: {voice_data.get('voice_id')}")
            except Exception as e:
                # If cloning fails, clean up the file
                print(f"[VOICE-CLONE ERROR] ElevenLabs cloning failed: {str(e)}")
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise e
            
            # 3. Save to Database
            voice_sample = VoiceSample(
                user_id=current_user.id,
                persona_name=persona_name,
                elevenlabs_voice_id=voice_data['voice_id'],
                voice_name=voice_data['name'],
                audio_file_path=file_path
            )
            db.session.add(voice_sample)
            db.session.commit()
            
            return jsonify({
                'message': 'Voice cloned successfully',
                'voice_sample': {
                    'id': voice_sample.id,
                    'name': voice_sample.voice_name,
                    'persona': voice_sample.persona_name
                }
            }), 201
            
        except Exception as e:
            print(f"Voice upload failed: {e}")
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'File not allowed'}), 400

@app.route('/api/voice/samples', methods=['GET'])
@login_required
def api_get_voice_samples():
    samples = VoiceSample.query.filter_by(user_id=current_user.id, is_active=True).all()
    return jsonify({
        'samples': [
            {
                'id': s.id,
                'persona_name': s.persona_name,
                'voice_name': s.voice_name,
                'created_at': s.created_at.isoformat()
            }
            for s in samples
        ]
    })

@app.route('/api/voice/samples/<int:sample_id>', methods=['DELETE'])
@login_required
def api_delete_voice_sample(sample_id):
    sample = VoiceSample.query.filter_by(id=sample_id, user_id=current_user.id).first_or_404()
    
    try:
        # 1. Delete from ElevenLabs
        client = ElevenLabsClient()
        try:
            client.delete_voice(sample.elevenlabs_voice_id)
        except Exception as e:
            print(f"Warning: Failed to delete from ElevenLabs: {e}")
            
        # 2. Delete from DB (soft delete or hard delete)
        # Soft delete is safer
        sample.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Voice sample deleted'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/generate', methods=['POST'])
@login_required
def api_generate_tts():
    data = request.json
    text = data.get('text')
    voice_sample_id = data.get('voice_sample_id')
    
    if not text or not voice_sample_id:
        return jsonify({'error': 'Missing text or voice_sample_id'}), 400
        
    # 1. Check Cache
    # Create hash of (text + voice_id) to uniquely identify this audio
    message_hash = hashlib.sha256(f"{text}_{voice_sample_id}".encode()).hexdigest()
    
    cached_audio = GeneratedAudio.query.filter_by(message_hash=message_hash).first()
    if cached_audio:
        # Validate file exists
        if os.path.exists(cached_audio.audio_file_path):
            cached_audio.last_accessed = datetime.utcnow()
            db.session.commit()
            return jsonify({
                'audio_url': f"/api/audio/{cached_audio.id}",
                'cached': True
            })
        else:
            # Clean up dead record
            db.session.delete(cached_audio)
            db.session.commit()
            
    # 2. Get Voice ID
    voice_sample = VoiceSample.query.filter_by(id=voice_sample_id).first()
    if not voice_sample:
        return jsonify({'error': 'Voice sample not found'}), 404
    
    try:
        # 3. Generate Audio via ElevenLabs
        client = ElevenLabsClient()
        audio_bytes = client.generate_tts(
            text=text,
            voice_id=voice_sample.elevenlabs_voice_id
        )
        
        # 4. Save to Disk
        os.makedirs(Config.GENERATED_AUDIO_FOLDER, exist_ok=True)
        filename = f"tts_{message_hash[:16]}.mp3"
        file_path = os.path.join(Config.GENERATED_AUDIO_FOLDER, filename)
        
        with open(file_path, 'wb') as f:
            f.write(audio_bytes)
            
        # 5. Save to DB Cache
        new_cache = GeneratedAudio(
            message_hash=message_hash,
            voice_sample_id=voice_sample.id,
            audio_file_path=file_path
        )
        db.session.add(new_cache)
        db.session.commit()
        
        return jsonify({
            'audio_url': f"/api/audio/{new_cache.id}",
            'cached': False
        })
        
    except Exception as e:
        print(f"TTS Generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<int:audio_id>', methods=['GET'])
@login_required
def api_serve_audio(audio_id):
    """Serve generated audio file"""
    # Fix for NameError:
    from flask import send_file
    
    try:
        audio = GeneratedAudio.query.get_or_404(audio_id)
        
        # Ensure absolute path for safety
        abs_path = os.path.abspath(audio.audio_file_path)
        
        if not os.path.exists(abs_path):
            print(f"[SERVE_AUDIO] File missing at: {abs_path}")
            return jsonify({'error': f'Audio file missing at server path: {abs_path}'}), 404
            
        return send_file(abs_path, mimetype='audio/mpeg')
    except Exception as e:
        print(f"[SERVE_AUDIO] Error serving file: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Local development: bind to 127.0.0.1:5000
    # In production (Render), Gunicorn handles the binding via render.yaml
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)