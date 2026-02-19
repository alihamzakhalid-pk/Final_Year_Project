#!/usr/bin/env python3
"""
Fix database schema - Add missing columns to existing database
This script adds the full_name column to the user table without losing data
"""
import sqlite3
import os

def fix_database_schema():
    """Add missing columns to existing database"""
    
    db_path = 'instance/botme.db'
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Database not found at {db_path}")
        print("Run: python init_db.py to create a new database")
        return False
    
    print("=" * 60)
    print("BotMe Database Schema Fix")
    print("=" * 60 + "\n")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if full_name column exists
        cursor.execute("PRAGMA table_info(user)")
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"[1] Current user table columns: {', '.join(columns)}\n")
        
        # Add missing columns
        changes_made = False
        
        if 'full_name' not in columns:
            print("[2] Adding full_name column...")
            cursor.execute("ALTER TABLE user ADD COLUMN full_name VARCHAR(200)")
            changes_made = True
            print("    [OK] full_name column added\n")
        
        if 'oauth_provider' not in columns:
            print("[3] Adding oauth_provider column...")
            cursor.execute("ALTER TABLE user ADD COLUMN oauth_provider VARCHAR(50)")
            changes_made = True
            print("    [OK] oauth_provider column added\n")
        
        if 'oauth_id' not in columns:
            print("[4] Adding oauth_id column...")
            cursor.execute("ALTER TABLE user ADD COLUMN oauth_id VARCHAR(255)")
            changes_made = True
            print("    [OK] oauth_id column added\n")
        
        if 'is_admin' not in columns:
            print("[5] Adding is_admin column...")
            cursor.execute("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0")
            changes_made = True
            print("    [OK] is_admin column added\n")
        
        if 'is_active' not in columns:
            print("[6] Adding is_active column...")
            cursor.execute("ALTER TABLE user ADD COLUMN is_active BOOLEAN DEFAULT 1")
            changes_made = True
            print("    [OK] is_active column added\n")
        
        if 'last_login' not in columns:
            print("[7] Adding last_login column...")
            cursor.execute("ALTER TABLE user ADD COLUMN last_login DATETIME")
            changes_made = True
            print("    [OK] last_login column added\n")
        
        # Commit changes
        conn.commit()
        
        # Verify
        cursor.execute("PRAGMA table_info(user)")
        new_columns = [col[1] for col in cursor.fetchall()]
        print(f"[8] Updated user table columns: {', '.join(new_columns)}\n")
        
        if changes_made:
            print("=" * 60)
            print("SUCCESS: Database schema updated!")
            print("=" * 60)
            print("\nYou can now:")
            print("1. Log in to your account")
            print("2. Continue using the application")
        else:
            print("=" * 60)
            print("INFO: Database schema is already up to date!")
            print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Failed to update database: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False
    finally:
        conn.close()


if __name__ == '__main__':
    success = fix_database_schema()
    exit(0 if success else 1)
