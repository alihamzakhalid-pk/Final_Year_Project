#!/usr/bin/env python3
"""
Script to make a user an admin
Usage: python make_admin.py email@example.com
"""

import sys
from app import app, db
from models import User

def make_admin(email):
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ User with email '{email}' not found")
            return False
        
        user.is_admin = True
        db.session.commit()
        
        print(f"✅ User '{user.username}' ({email}) is now ADMIN")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Is Admin: {user.is_admin}")
        print(f"   - Created: {user.created_at}")
        return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py email@example.com")
        sys.exit(1)
    
    email = sys.argv[1].lower().strip()
    make_admin(email)
