from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import re
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from config import Config
from models import db, User, ChatData, VerificationCode
import os
import json
import random
import string
import requests
import urllib.parse
from parse_chat import parse_chat_file
from chatbot import get_chatbot_response
from personality_analysis import analyze_personality
from datetime import datetime, timedelta
from oauth_handler import get_oauth_auth_url, exchange_oauth_code, get_or_create_oauth_user

from rag_chatbot import (
    get_chatbot_response_rag,  # NEW RAG SYSTEM
    create_vector_store,
    delete_vector_store
)

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
 # Enable CORS for SPA (adjust origin as needed for production)
# Allow localhost, 127.0.0.1, and LAN IPs on port 5173 during dev
CORS(
    app,
    resources={r"/api/*": {
        "origins": [
            r"http://localhost:5173",
            r"http://127.0.0.1:5173",
            r"http://192\.168\.[0-9]{1,3}\.[0-9]{1,3}:5173",
        ]
    }},
    supports_credentials=True,
)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize Flask-Mail
mail = Mail(app)


def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(email, code, purpose='signup'):
    """Send verification or reset code email"""
    try:
        # Check if mail is configured
        if not app.config.get('MAIL_USERNAME') or not app.config.get('MAIL_PASSWORD'):
            print("[EMAIL ERROR] MAIL_USERNAME or MAIL_PASSWORD not configured in .env file")
            return False

        if purpose == 'signup':
            subject = f"Your BotMe Verification Code - {code}"
            body = f"""
Hello!

Thank you for signing up for BotMe. Please use the following verification code to complete your registration:

Verification Code: {code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
BotMe Team
"""
        elif purpose == 'login':
            subject = f"Your BotMe Login Code - {code}"
            body = f"""
Hello!

Please use the following verification code to complete your login:

Verification Code: {code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
BotMe Team
"""
        else:  # password reset
            subject = "Reset your BotMe password"
            body = f"""
Hello!

We received a request to reset the password for your BotMe account.

Use this verification code to reset your password: {code}

This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.

Best regards,
BotMe Team
"""

        print(f"[EMAIL] Attempting to send email to {email} via {app.config.get('MAIL_SERVER')}:{app.config.get('MAIL_PORT')}")
        msg = Message(subject=subject, recipients=[email], body=body)
        mail.send(msg)
        print(f"[EMAIL] Successfully sent verification code to {email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'fullName': user.username,
        'created_at': user.created_at.isoformat() if user.created_at else None,
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

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create DB tables and clean up old temp entries on startup
with app.app_context():
    db.create_all()
    # Optional: Clean up old temp entries (older than 1 hour)
    cutoff = datetime.utcnow() - timedelta(hours=1)
    temp_entries = ChatData.query.filter_by(is_temp=True).filter(ChatData.created_at < cutoff).all()
    for entry in temp_entries:
        db.session.delete(entry)
    db.session.commit()

ALLOWED_EXTENSIONS = {'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
            flash('Username or email already exists.')
            return redirect(url_for('signup'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('Signup successful! Please log in.')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid username or password.')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        flash('No file selected.')
        return redirect(url_for('dashboard'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected.')
        return redirect(url_for('dashboard'))
    
    if not file or not allowed_file(file.filename):
        flash('Invalid file type. Only .txt files are allowed.')
        return redirect(url_for('dashboard'))
    
    try:
        # Read and decode file content
        content = file.read().decode('utf-8', errors='ignore')
        
        # Check if file is empty
        if not content or len(content.strip()) < 50:
            flash('The file appears to be empty or too short. Please upload a valid WhatsApp chat export.')
            return redirect(url_for('dashboard'))
        
        # Parse the chat file
        parsed = parse_chat_file(content)
        
        # Validate participants
        if not parsed.get('participants') or len(parsed['participants']) < 2:
            flash('Could not find at least 2 participants in the chat. Please ensure the file is a valid WhatsApp export with messages from multiple people.')
            return redirect(url_for('dashboard'))
        
        # Validate messages
        total_messages = sum(len(msgs) for msgs in parsed['messages_by_person'].values())
        if total_messages < 10:
            flash('Not enough messages found in the chat. Please upload a chat with more conversation history.')
            return redirect(url_for('dashboard'))
        
        # Create temporary ChatData entry
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
        
        return redirect(url_for('select_person', chat_id=temp_chat.id))
    
    except UnicodeDecodeError as e:
        flash('Error reading file: The file encoding is not supported. Please ensure it\'s a text file exported from WhatsApp.')
        return redirect(url_for('dashboard'))
    
    except ValueError as e:
        # Specific parsing errors from parse_chat_file
        error_msg = str(e)
        if 'participants' in error_msg.lower():
            flash('The chat file must contain messages from at least 2 different people. Please check your WhatsApp export.')
        elif 'valid' in error_msg.lower():
            flash(f'{error_msg} Make sure you exported the chat correctly from WhatsApp.')
        else:
            flash(f'Error parsing chat: {error_msg}')
        return redirect(url_for('dashboard'))
    
    except json.JSONDecodeError as e:
        flash('Error processing chat data. Please try uploading the file again.')
        return redirect(url_for('dashboard'))
    
    except Exception as e:
        # Log the error for debugging
        print(f"Unexpected error in upload_file: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        
        flash('An unexpected error occurred while processing your file. Please ensure it\'s a valid WhatsApp chat export (.txt file).')
        return redirect(url_for('dashboard'))

@app.route('/select_person', methods=['GET', 'POST'])
@login_required
def select_person():
    if request.method == 'POST':
        person_name = request.form['person']
        chat_id = request.form.get('chat_id', type=int)
        
        if not chat_id:
            flash('Invalid chat ID.')
            return redirect(url_for('dashboard'))
        
        # Load temp ChatData
        temp_chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=True).first()
        if not temp_chat:
            flash('Chat data not found or expired.')
            return redirect(url_for('dashboard'))
        
        # Extract messages for selected person
        all_messages_dict = json.loads(temp_chat.all_messages)
        selected_msgs = all_messages_dict.get(person_name, [])
        
        if not selected_msgs:
            flash('No messages found for the selected person.')
            return redirect(url_for('dashboard'))
        
        # Use more of the chat: first 300 messages
        selected_msgs = selected_msgs[:300]
        
        # Update the temp chat to permanent
        temp_chat.selected_person = person_name
        temp_chat.messages = json.dumps(selected_msgs)
        temp_chat.conversation_history = '[]'
        temp_chat.is_temp = False
        temp_chat.all_messages = ''  # Clear temp data to save space
        db.session.commit()
        
        return redirect(url_for('chat', chat_id=chat_id))
    
    # GET: Show selection page
    chat_id = request.args.get('chat_id', type=int)
    if not chat_id:
        flash('No chat ID provided.')
        return redirect(url_for('dashboard'))
    
    temp_chat = ChatData.query.filter_by(id=chat_id, user_id=current_user.id, is_temp=True).first()
    if not temp_chat:
        flash('Chat data not found or expired.')
        return redirect(url_for('dashboard'))
    
    all_messages_dict = json.loads(temp_chat.all_messages)
    participants = [{'name': name, 'count': len(msgs)} for name, msgs in all_messages_dict.items()]
    sorted_participants = sorted(participants, key=lambda x: x['count'], reverse=True)
    
    return render_template('select_person.html', participants=sorted_participants, chat_id=chat_id)

@app.route('/chat/<int:chat_id>')
@login_required
def chat(chat_id):
    chat_data = ChatData.query.filter_by(user_id=current_user.id, id=chat_id, is_temp=False).first()
    if not chat_data:
        flash('Chat not found or not ready.')
        return redirect(url_for('dashboard'))
    
    return render_template('chat.html', chat_id=chat_id, person=chat_data.selected_person)

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
        return jsonify({
            'authenticated': True,
            'user': serialize_user(current_user)
        })
    return jsonify({'authenticated': False}), 200

@app.route('/api/signup', methods=['POST'])
def api_signup():
    """Send verification code for signup"""
    data = request.json or {}
    full_name = (data.get('fullName') or data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    # Delete any existing verification codes for this email
    VerificationCode.query.filter_by(email=email, purpose='signup').delete()
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store temporary user data
    temp_data = json.dumps({
        'fullName': full_name,
        'email': email,
        'password': password
    })
    
    # Save verification code
    verification = VerificationCode(
        email=email,
        code=code,
        purpose='signup',
        expires_at=expires_at,
        temp_data=temp_data
    )
    db.session.add(verification)
    db.session.commit()
    
    # Send email
    if send_verification_email(email, code, 'signup'):
        return jsonify({
            'message': 'Verification code sent to your email',
            'email': email
        }), 200
    else:
        return jsonify({'error': 'Failed to send verification email. Please check your email configuration.'}), 500


@app.route('/api/verify-signup', methods=['POST'])
def api_verify_signup():
    """Verify code and create account"""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({'error': 'Missing email or verification code'}), 400
    
    # Find verification code
    verification = VerificationCode.query.filter_by(
        email=email, 
        code=code, 
        purpose='signup'
    ).first()
    
    if not verification:
        return jsonify({'error': 'Invalid verification code'}), 400
    
    if verification.is_expired():
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'Verification code has expired. Please request a new one.'}), 400
    
    # Load temporary data
    temp_data = json.loads(verification.temp_data or '{}')
    full_name = temp_data.get('fullName', '')
    password = temp_data.get('password', '')
    
    # Generate username
    username = generate_username(full_name or email.split('@')[0])
    
    # Create user
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    
    # Delete verification code
    db.session.delete(verification)
    db.session.commit()
    
    # Login user
    login_user(user)
    
    return jsonify({
        'message': 'Account created successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    """Send verification code for login"""
    data = request.json or {}
    identifier = data.get('identifier') or data.get('username') or data.get('email')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    
    # Allow login by username or email
    if '@' in identifier:
        user = User.query.filter_by(email=identifier.lower()).first()
        email = identifier.lower()
    else:
        user = User.query.filter_by(username=identifier).first()
        if not user:
            return jsonify({'error': 'Invalid username/email or password'}), 401
        email = user.email
    
    # Verify password
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username/email or password'}), 401
    
    # Delete any existing verification codes for this email
    VerificationCode.query.filter_by(email=email, purpose='login').delete()
    
    # Generate verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Save verification code
    verification = VerificationCode(
        email=email,
        code=code,
        purpose='login',
        expires_at=expires_at
    )
    db.session.add(verification)
    db.session.commit()
    
    # Send email
    if send_verification_email(email, code, 'login'):
        return jsonify({
            'message': 'Verification code sent to your email',
            'email': email
        }), 200
    else:
        return jsonify({'error': 'Failed to send verification email. Please check your email configuration.'}), 500


@app.route('/api/verify-login', methods=['POST'])
def api_verify_login():
    """Verify code and login"""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({'error': 'Missing email or verification code'}), 400
    
    # Find verification code
    verification = VerificationCode.query.filter_by(
        email=email, 
        code=code, 
        purpose='login'
    ).first()
    
    if not verification:
        return jsonify({'error': 'Invalid verification code'}), 400
    
    if verification.is_expired():
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'Verification code has expired. Please request a new one.'}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    if not user:
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'User not found'}), 404
    
    # Delete verification code
    db.session.delete(verification)
    db.session.commit()
    
    # Login user
    login_user(user)
    
    return jsonify({
        'message': 'Logged in successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 200


@app.route('/api/request-password-reset', methods=['POST'])
def api_request_password_reset():
    """Send a reset code to the user's email."""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Avoid leaking which emails exist
        return jsonify({'message': 'If an account exists, a reset code has been sent'}), 200

    if user.oauth_provider and not user.password_hash:
        return jsonify({'error': f"This account uses {user.oauth_provider.capitalize()} sign-in. Use that provider to sign in."}), 400

    # Remove existing reset codes for this email
    VerificationCode.query.filter_by(email=email, purpose='reset').delete()

    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    verification = VerificationCode(
        email=email,
        code=code,
        purpose='reset',
        expires_at=expires_at,
        temp_data=None,
    )
    db.session.add(verification)
    db.session.commit()

    if send_verification_email(email, code, 'reset'):
        return jsonify({'message': 'Reset code sent to your email', 'email': email}), 200

    return jsonify({'error': 'Failed to send reset email. Please check your email configuration.'}), 500


@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    """Reset password after verifying the code."""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    new_password = data.get('new_password') or data.get('password')

    if not email or not code or not new_password:
        return jsonify({'error': 'Email, code, and new password are required'}), 400

    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    verification = VerificationCode.query.filter_by(
        email=email,
        code=code,
        purpose='reset'
    ).first()

    if not verification:
        return jsonify({'error': 'Invalid reset code'}), 400

    if verification.is_expired():
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'Reset code has expired. Please request a new one.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        db.session.delete(verification)
        db.session.commit()
        return jsonify({'error': 'User not found'}), 404

    # Update password
    user.set_password(new_password)

    db.session.delete(verification)
    db.session.commit()

    login_user(user)

    return jsonify({
        'message': 'Password updated successfully',
        'user': serialize_user(user),
        'token': 'session'
    }), 200

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
        print(f"[SELECT_PERSON] Creating RAG vector store for chat {chat_id}...")
        create_vector_store(temp_chat)
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
        print(f"\n[API] RAG SYSTEM endpoint called for chat {chat_id}")
        response = get_chatbot_response_rag(chat_id, user_input)
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

# OAuth Endpoints
@app.route('/api/oauth/<provider>', methods=['GET', 'OPTIONS'])
def oauth_login(provider):
    """Initiate OAuth flow for a provider"""
    try:
        provider = provider.lower()
        if provider not in ['google', 'facebook', 'microsoft', 'github']:
            return jsonify({'error': f'Provider {provider} not supported'}), 400
        
        auth_url = get_oauth_auth_url(provider)
        if not auth_url:
            return jsonify({
                'error': f'{provider.capitalize()} OAuth is not configured. Please set {provider.upper()}_CLIENT_ID and {provider.upper()}_CLIENT_SECRET in environment variables.'
            }), 500
        
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        print(f"Error in oauth_login for {provider}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/oauth/<provider>/callback', methods=['GET'])
def oauth_callback(provider):
    """Handle OAuth callback from provider"""
    provider = provider.lower()
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    # Get frontend URL from config or request
    frontend_url = app.config.get('FRONTEND_URL', 'http://localhost:5173')
    
    if error:
        return redirect(f"{frontend_url}?oauth_error={error}&provider={provider}")
    
    # Verify state
    session_state = session.get(f'oauth_state_{provider}')
    if not session_state or session_state != state:
        return redirect(f"{frontend_url}?oauth_error=invalid_state&provider={provider}")
    
    session.pop(f'oauth_state_{provider}', None)
    
    if not code:
        return redirect(f"{frontend_url}?oauth_error=no_code&provider={provider}")
    
    # Exchange code for token
    redirect_uri = f"{request.host_url.rstrip('/')}/api/oauth/{provider}/callback"
    
    try:
        user_info = exchange_oauth_code(provider, code, redirect_uri)
        if not user_info:
            return redirect(f"{frontend_url}?oauth_error=token_exchange_failed&provider={provider}")
        
        # Create or get user
        user = get_or_create_oauth_user(provider, user_info)
        if user:
            login_user(user)
            # Return JSON for frontend to handle
            token = 'session'  # Using session-based auth
            return redirect(f"{frontend_url}/login?oauth_success=true&provider={provider}&token={token}")
        else:
            return redirect(f"{frontend_url}?oauth_error=user_creation_failed&provider={provider}")
    except Exception as e:
        print(f"OAuth error for {provider}: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(f"{frontend_url}?oauth_error={urllib.parse.quote(str(e))}&provider={provider}")

# Apple Sign In (special handling - requires frontend SDK)
@app.route('/api/oauth/apple', methods=['POST'])
def apple_oauth():
    """Handle Apple Sign In (uses different flow with JWT)"""
    data = request.json or {}
    # Apple Sign In requires JWT verification
    # For now, return a message that it needs proper JWT verification
    # In production, you should verify the JWT token from Apple using their public keys
    return jsonify({
        'error': 'Apple Sign In requires JWT token verification. Please use Apple Sign In SDK on the frontend and send the verified identity token to this endpoint.'
    }), 501

if __name__ == '__main__':
    # Bind explicitly to 127.0.0.1:5000 to match Vite proxy default
    app.run(host='127.0.0.1', port=5000, debug=True)