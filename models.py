from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    full_name = db.Column(db.String(200), nullable=True)  # User's full name
    password_hash = db.Column(db.String(128), nullable=True)  # Nullable for OAuth users
    oauth_provider = db.Column(db.String(50), nullable=True)  # 'google', 'facebook', 'microsoft', 'apple', 'github'
    oauth_id = db.Column(db.String(255), nullable=True)  # Provider's user ID
    is_admin = db.Column(db.Boolean, default=False, nullable=False)  # Admin flag
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # Account status
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)  # Last login timestamp
    chat_data = db.relationship('ChatData', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username} (ID: {self.id})>'

class ChatData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    selected_person = db.Column(db.String(100), nullable=True)  # Can be None for temp
    all_messages = db.Column(db.Text, default='[]', nullable=False)  # JSON of full messages_by_person for temp stage
    messages = db.Column(db.Text, default='[]', nullable=False)  # JSON of final selected messages (list of dicts or strings)
    conversation_history = db.Column(db.Text, default='[]', nullable=False)  # NEW: JSON list of {"role": "user/assistant", "content": str}
    is_temp = db.Column(db.Boolean, default=False, nullable=False)  # Flag for temporary entries
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
 
    def __repr__(self):
        return f'<ChatData {self.id} for User {self.user_id}, Temp: {self.is_temp}>'

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(20), nullable=False)  # 'signup' or 'login'
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # For signup, store user data temporarily
    temp_data = db.Column(db.Text, nullable=True)  # JSON string with fullName, password, etc.
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    def __repr__(self):
        return f'<VerificationCode {self.code} for {self.email} ({self.purpose})>'