"""
Migration script to add mood-related columns to ChatData table
Run this once to update the database schema
"""

import os
import sqlite3
from datetime import datetime

def migrate_mood_fields():
    """Add mood fields to existing ChatData table"""
    try:
        # Get database path from environment or default
        db_path = os.environ.get('DATABASE_URL', 'instance/botme.db')

        # If it's a SQLite URL, extract the path
        if db_path.startswith('sqlite:///'):
            db_path = db_path.replace('sqlite:///', '')

        print(f"Connecting to database: {db_path}")

        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(chat_data)")
        columns = [row[1] for row in cursor.fetchall()]

        # Add mood columns if they don't exist
        if 'current_mood' not in columns:
            print("Adding current_mood column...")
            cursor.execute("ALTER TABLE chat_data ADD COLUMN current_mood VARCHAR(20) DEFAULT 'natural'")
            print("✅ Added current_mood column")

        if 'mood_selected_at' not in columns:
            print("Adding mood_selected_at column...")
            cursor.execute("ALTER TABLE chat_data ADD COLUMN mood_selected_at DATETIME")
            print("✅ Added mood_selected_at column")

        if 'mood_history' not in columns:
            print("Adding mood_history column...")
            cursor.execute("ALTER TABLE chat_data ADD COLUMN mood_history TEXT DEFAULT '[]'")
            print("✅ Added mood_history column")

        # Update existing records to have default mood
        print("Setting default mood for existing chats...")
        cursor.execute("UPDATE chat_data SET current_mood = 'natural' WHERE current_mood IS NULL")

        # Commit changes
        conn.commit()
        conn.close()

        print("✅ Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    migrate_mood_fields()