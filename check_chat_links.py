import sqlite3
import os

db_path = 'instance/botme.db'

def check_chat_links():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("--- Chat Data Links ---")
        cursor.execute("SELECT id, selected_person, voice_sample_id, is_temp FROM chat_data")
        rows = cursor.fetchall()
        for row in rows:
            print(f"Chat ID: {row[0]}, Persona: {row[1]}, VoiceSampleID: {row[2]}, Temp: {row[3]}")
            
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {e}")

if __name__ == "__main__":
    check_chat_links()
