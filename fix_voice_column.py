import sqlite3
import os

def fix_voice_column():
    db_path = 'instance/botme.db'
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check existing columns in chat_data
        cursor.execute("PRAGMA table_info(chat_data)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'voice_sample_id' not in columns:
            print("Adding 'voice_sample_id' column to chat_data...")
            cursor.execute("ALTER TABLE chat_data ADD COLUMN voice_sample_id INTEGER")
            print("Successfully added voice_sample_id column.")
        else:
            print("'voice_sample_id' column already exists.")

        # Also ensure voice_sample and generated_audio tables exist as they are referenced
        # This is safer than relying on db.create_all() which failed
        print("Ensuring voice_sample and generated_audio tables exist...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS voice_sample (
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            chat_id INTEGER,
            persona_name VARCHAR(100) NOT NULL,
            elevenlabs_voice_id VARCHAR(255) NOT NULL,
            voice_name VARCHAR(200) NOT NULL,
            audio_file_path VARCHAR(500) NOT NULL,
            duration_seconds FLOAT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES user (id),
            FOREIGN KEY(chat_id) REFERENCES chat_data (id)
        )
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS generated_audio (
            id INTEGER PRIMARY KEY,
            message_hash VARCHAR(64) NOT NULL UNIQUE,
            voice_sample_id INTEGER NOT NULL,
            audio_file_path VARCHAR(500) NOT NULL,
            created_at DATETIME,
            last_accessed DATETIME,
            FOREIGN KEY(voice_sample_id) REFERENCES voice_sample (id)
        )
        """)
        
        conn.commit()
        print("Database migration complete.")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_voice_column()
