from app import app, db
from sqlalchemy import text
import sys

def migrate():
    with app.app_context():
        print("\n" + "="*50)
        print("DATABASE MIGRATION SCRIPT (SAFE/AGNOSTIC)")
        print("="*50)
        
        # 1. Create all missing tables first (VoiceSample, GeneratedAudio, etc.)
        print("\nStep 1: Creating missing tables...")
        try:
            db.create_all()
            print("[OK] Tables initialized")
        except Exception as e:
            print(f"[ERROR] Table initialization failed: {e}")

        # 2. Add missing columns to 'chat_data'
        print("\nStep 2: Checking 'chat_data' columns...")
        
        # Column definitions: (name, type_sql, default_val)
        columns_to_add = [
            ("conversation_history", "TEXT", "'[]'"),
            ("is_temp", "BOOLEAN", "FALSE"),
            ("voice_sample_id", "INTEGER", "NULL")
        ]
        
        for col_name, col_type, default_val in columns_to_add:
            try:
                # Test if column exists
                db.session.execute(text(f"SELECT {col_name} FROM chat_data LIMIT 1"))
                print(f"[INFO] Column '{col_name}' already exists")
            except Exception:
                # If error, column is likely missing
                db.session.rollback()
                print(f"[ADD] Adding column '{col_name}'...")
                try:
                    # Generic ALTER TABLE syntax
                    if default_val != "NULL":
                        alter_cmd = f"ALTER TABLE chat_data ADD COLUMN {col_name} {col_type} DEFAULT {default_val}"
                    else:
                        alter_cmd = f"ALTER TABLE chat_data ADD COLUMN {col_name} {col_type}"
                    
                    db.session.execute(text(alter_cmd))
                    db.session.commit()
                    print(f"[OK] Successfully added '{col_name}'")
                except Exception as e:
                    db.session.rollback()
                    print(f"[ERROR] Failed to add '{col_name}': {e}")

        # 3. Handle potential NULLs for NOT NULL constraints
        print("\nStep 3: Ensuring data integrity...")
        try:
            db.session.execute(text("UPDATE chat_data SET conversation_history = '[]' WHERE conversation_history IS NULL"))
            db.session.execute(text("UPDATE chat_data SET is_temp = FALSE WHERE is_temp IS NULL"))
            db.session.commit()
            print("[OK] Integrity checks passed")
        except Exception as e:
            db.session.rollback()
            print(f"[WARN] Integrity update failed: {e}")

        print("\n" + "="*50)
        print("MIGRATION COMPLETED")
        print("="*50 + "\n")

if __name__ == "__main__":
    migrate()
