#!/usr/bin/env python
"""Test Firebase OTP Email Sending"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from firebase_service import init_firebase, send_otp_via_firebase, verify_otp_via_firebase

def test_firebase_otp():
    print("=" * 60)
    print("FIREBASE OTP CONFIGURATION TEST")
    print("=" * 60)
    
    # Test 1: Firebase Initialization
    print("\n[1] TESTING FIREBASE INITIALIZATION:")
    
    project_root = os.path.dirname(os.path.abspath(__file__))
    firebase_creds = os.path.join(project_root, 'firebase-credentials.json')
    
    if not os.path.exists(firebase_creds):
        print(f"   [ERROR] firebase-credentials.json NOT FOUND")
        print(f"   [Expected] Location: {firebase_creds}")
        print("   [Action] Please download it from Firebase Console:")
        print("      Project Settings -> Service Accounts -> Generate New Private Key")
        print(f"   [Save as] firebase-credentials.json in: {project_root}")
        return False
    else:
        print(f"   [OK] firebase-credentials.json found at:")
        print(f"      {firebase_creds}")
    
    # Test 2: Send OTP
    print("\n[2] TESTING OTP SENDING:")
    
    if len(sys.argv) > 1:
        test_email = sys.argv[1]
        print(f"   [INPUT] Using email from args: {test_email}")
    else:
        test_email = input("   [INPUT] Enter test email: ").strip()
    
    if not test_email:
        print("   [WARNING] No email provided, skipping test")
        return False
    
    result = send_otp_via_firebase(None, test_email)
    
    if result['success']:
        print(f"   [OK] OTP sent to {test_email}")
        
        # Display code if in Dev Mode
        if result.get('code'):
            print(f"   [DEV KEY] OTP Code: {result['code']}")
            
        print(f"   [CHECK] Check inbox for verification email")
        
        # Test 3: Verify OTP
        print("\n[3] TESTING OTP VERIFICATION:")
        otp_code = input("   [INPUT] Enter OTP code from email: ").strip()
        
        if otp_code:
            verify_result = verify_otp_via_firebase(otp_code, test_email)
            if verify_result['success']:
                print(f"   [OK] OTP verified successfully!")
                return True
            else:
                print(f"   [ERROR] OTP verification failed: {verify_result['message']}")
                return False
        else:
            print("   [WARNING] Skipped verification test")
            return True
    else:
        print(f"   [ERROR] OTP send failed: {result['message']}")
        return False

if __name__ == '__main__':
    success = test_firebase_otp()
    
    print("\n" + "=" * 60)
    if success:
        print("[OK] FIREBASE OTP IS WORKING!")
    else:
        print("[ERROR] FIREBASE OTP HAS ISSUES")
        print("\nFollow setup instructions in FIREBASE_SETUP.md")
    print("=" * 60)
