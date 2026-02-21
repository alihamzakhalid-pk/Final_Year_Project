import sqlite3
import os

db_path = 'instance/botme.db'

def check_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("--- Voice Samples ---")
        cursor.execute("SELECT id, persona_name, elevenlabs_voice_id, is_active FROM voice_sample")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Persona: {row[1]}, VoiceID: {row[2]}, Active: {row[3]}")
            
        print("\n--- Recent Generated Audio ---")
        cursor.execute("SELECT id, audio_file_path, created_at FROM generated_audio ORDER BY created_at DESC LIMIT 5")
        rows = cursor.fetchall()
        for row in rows:
            exists = os.path.exists(row[1])
            size = os.path.getsize(row[1]) if exists else 0
            print(f"ID: {row[0]}, Path: {row[1]}, Exists: {exists}, Size: {size} bytes")
            
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {e}")

if __name__ == "__main__":
    check_db()
