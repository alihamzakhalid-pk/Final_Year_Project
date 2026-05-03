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
    password_hash = db.Column(db.String(500), nullable=True)  # Nullable for OAuth users
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
    voice_sample_id = db.Column(db.Integer, db.ForeignKey('voice_sample.id'), nullable=True)  # Link to voice sample for TTS
    is_temp = db.Column(db.Boolean, default=False, nullable=False)  # Flag for temporary entries
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Mood-dependent features
    current_mood = db.Column(db.String(20), default='natural', nullable=False)  # 'natural', 'happy', 'sad'
    mood_selected_at = db.Column(db.DateTime, default=datetime.utcnow)
    mood_history = db.Column(db.Text, default='[]', nullable=False)  # JSON list of mood changes with timestamps
 
    def __repr__(self):
        return f'<ChatData {self.id} - Person: {self.selected_person}>'

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

class VoiceSample(db.Model):
    """Store voice samples for TTS cloning"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat_data.id'), nullable=True)
    persona_name = db.Column(db.String(100), nullable=False)
    
    # ElevenLabs voice data
    elevenlabs_voice_id = db.Column(db.String(255), nullable=False)  # Voice ID from ElevenLabs API
    voice_name = db.Column(db.String(200), nullable=False)
    
    # File storage (local backup)
    audio_file_path = db.Column(db.String(500), nullable=False)
    duration_seconds = db.Column(db.Float, nullable=True)
    
    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='voice_samples')
    
    def __repr__(self):
        return f'<VoiceSample {self.id} - {self.voice_name} (User {self.user_id})>'

class GeneratedAudio(db.Model):
    """Cache generated TTS audio to avoid regeneration"""
    id = db.Column(db.Integer, primary_key=True)
    message_hash = db.Column(db.String(64), unique=True, nullable=False, index=True)  # SHA256 of text
    voice_sample_id = db.Column(db.Integer, db.ForeignKey('voice_sample.id'), nullable=False)
    audio_file_path = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    voice_sample = db.relationship('VoiceSample', backref='generated_audios')
    
    def __repr__(self):
        return f'<GeneratedAudio {self.id} - Hash: {self.message_hash[:8]}...>'
