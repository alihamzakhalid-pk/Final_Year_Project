from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    chat_data = db.relationship('ChatData', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
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
