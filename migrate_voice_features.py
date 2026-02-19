
import sqlite3
import os
from app import app, db

def migrate_database():
    """
    Migrate database for Voice/TTS features:
    1. Create new tables (VoiceSample, GeneratedAudio) via db.create_all()
    2. Add missing column 'voice_sample_id' to chat_data table
    """
    
    db_path = 'instance/botme.db'
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}. Running init_db instead.")
        with app.app_context():
            db.create_all()
        return

    print(f"Migrating database at {db_path}...")

    # 1. Create new tables
    print("Step 1: Creating new tables (VoiceSample, GeneratedAudio)...")
    with app.app_context():
        db.create_all()
        print("Done.")

    # 2. Add column to existing table
    print("Step 2: Checking for missing columns in chat_data...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("PRAGMA table_info(chat_data)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'voice_sample_id' not in columns:
            print("Adding 'voice_sample_id' column to chat_data...")
            cursor.execute("ALTER TABLE chat_data ADD COLUMN voice_sample_id INTEGER REFERENCES voice_sample(id)")
            conn.commit()
            print("Column added successfully.")
        else:
            print("'voice_sample_id' column already exists.")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

    print("\nMigration complete! Your data is safe.")

if __name__ == '__main__':
    migrate_database()
