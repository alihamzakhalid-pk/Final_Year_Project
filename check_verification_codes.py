#!/usr/bin/env python
"""Check stored verification codes in database"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, VerificationCode

with app.app_context():
    print("=" * 60)
    print("CHECKING VERIFICATION CODES IN DATABASE")
    print("=" * 60)
    
    # Get all verification codes
    codes = VerificationCode.query.all()
    
    if not codes:
        print("\n[FAIL] NO VERIFICATION CODES FOUND IN DATABASE")
        print("   This means verification codes are NOT being created.")
        print("   Issue is in signup flow, not email sending.")
    else:
        print(f"\n[OK] Found {len(codes)} verification code(s):\n")
        for code in codes:
            print(f"   Email: {code.email}")
            print(f"   Code: {code.code}")
            print(f"   Purpose: {code.purpose}")
            print(f"   Created: {code.created_at}")
            print(f"   Expires: {code.expires_at}")
            print()
    
    print("=" * 60)
