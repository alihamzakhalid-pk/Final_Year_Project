from app import app, db
from models import User

with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID:{u.id} | email:{u.email} | username:{u.username} | is_admin:{u.is_admin} | oauth:{u.oauth_provider}")
