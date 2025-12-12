#!/usr/bin/env python3
"""
Database initialization and fix script
Recreates the database with the correct schema
"""
import os
import time
from app import app, db

def init_database():
    """Initialize or reinitialize the database"""
    
    db_path = 'instance/botme.db'
    
    print("=" * 60)
    print("BotMe Database Initialization")
    print("=" * 60 + "\n")
    
    # Warn if database exists
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        print(f"[WARNING] Existing database found ({size} bytes)")
        print(f"          Location: {db_path}\n")
    
    with app.app_context():
        try:
            # Drop all tables if they exist
            print("[1] Checking for existing tables...")
            db.drop_all()
            print("    [OK] All existing tables dropped\n")
            
            # Create all tables
            print("[2] Creating database tables...")
            db.create_all()
            print("    [OK] Database created successfully!\n")
            
            # Verify tables were created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            
            tables = inspector.get_table_names()
            print(f"[3] Tables created:")
            for table in tables:
                cols = [col['name'] for col in inspector.get_columns(table)]
                print(f"    - {table}: {', '.join(cols)}")
            
            print("\n" + "=" * 60)
            print("SUCCESS: Database initialized with correct schema!")
            print("=" * 60)
            print("\nYou can now:")
            print("1. Sign up a new account")
            print("2. Log in with your credentials")
            print("3. Upload WhatsApp chats")
            
            return True
            
        except Exception as e:
            print(f"\n[ERROR] Failed to initialize database:")
            print(f"        {type(e).__name__}: {e}")
            return False


if __name__ == '__main__':
    success = init_database()
    exit(0 if success else 1)
