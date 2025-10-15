from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from config import Config
from models import db, User, ChatData
import os
import json
from parse_chat import parse_chat_file
from chatbot import get_chatbot_response
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

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

"""@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        flash('No file selected.')
        return redirect(url_for('dashboard'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected.')
        return redirect(url_for('dashboard'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        content = file.read().decode('utf-8')
        
        parsed = parse_chat_file(content)
        if len(parsed['participants']) < 2:
            flash('Chat must have at least 2 participants.')
            return redirect(url_for('dashboard'))
        
        # Create temporary ChatData entry with full parsed data (no session!)
        temp_chat = ChatData(
            user_id=current_user.id,
            selected_person=None,  # Temp
            all_messages=json.dumps(parsed['messages_by_person']),  # Store full dict
            messages='[]',  # Placeholder for now
            conversation_history='[]',  # Initialize empty history (new field)
            is_temp=True
        )
        db.session.add(temp_chat)
        db.session.commit()
        
        # Redirect to selection with chat_id (small URL param)
        return redirect(url_for('select_person', chat_id=temp_chat.id))
    
    flash('Invalid file. Only .txt allowed.')
    return redirect(url_for('dashboard'))"""

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
    
    if file and allowed_file(file.filename):
        try:
            content = file.read().decode('utf-8')
            parsed = parse_chat_file(content)
            
            # This check is now inside the try block
            if len(parsed['participants']) < 2:
                flash('Parsing failed: The chat must have at least two participants.')
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

        except (ValueError, IndexError) as e:
            # Catch parsing errors and give a user-friendly message
            flash(f"Error parsing chat file: {e}. Please ensure it's a valid WhatsApp chat export.")
            return redirect(url_for('dashboard'))
        
        except Exception as e:
            # Catch any other unexpected errors
            flash(f"An unexpected error occurred: {e}")
            return redirect(url_for('dashboard'))
    
    flash('Invalid file type. Only .txt files are allowed.')
    return redirect(url_for('dashboard'))

@app.route('/select_person', methods=['GET', 'POST'])
@login_required
def select_person():
    if request.method == 'POST':
        person_name = request.form['person']
        chat_id = request.form.get('chat_id', type=int)  # From hidden form field or args
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
            flash('No messages for selected person.')
            return redirect(url_for('dashboard'))
        
        # Use more of the chat: first 300 messages (adjust based on your avg chat size; ~300 is safe for GPT-4o)
        selected_msgs = selected_msgs[:300]
        
        # Store as simple list of strings (no roles needed, since we'll use them only as style examples)
        # Also initialize conversation_history as empty list if not already
        temp_chat.selected_person = person_name
        temp_chat.messages = json.dumps(selected_msgs)  # Now a list of str, not dicts
        if not hasattr(temp_chat, 'conversation_history') or temp_chat.conversation_history is None:
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
    sorted_participants = sorted(participants, key=lambda x: x['count'], reverse=True)[:2]
    
    return render_template('select_person.html', participants=sorted_participants, chat_id=chat_id)

@app.route('/chat/<int:chat_id>')
@login_required
def chat(chat_id):
    chat_data = ChatData.query.filter_by(user_id=current_user.id, id=chat_id, is_temp=False).first()
    if not chat_data:
        flash('Chat not found or not ready.')
        return redirect(url_for('dashboard'))
    
    return render_template('chat.html', chat_id=chat_id, person=chat_data.selected_person)

@app.route('/api/chat/<int:chat_id>', methods=['POST'])
@login_required
def api_chat(chat_id):
    data = request.json
    user_input = data.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    response = get_chatbot_response(chat_id, user_input)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
