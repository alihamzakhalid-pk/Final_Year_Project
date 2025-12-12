"""Test if Flask app starts without errors and routes are registered"""
import sys

print("Testing Flask app startup...")
print("=" * 50)

try:
    print("1. Importing app...")
    from app import app
    print("   ✓ App imported successfully")
    
    print("\n2. Checking OAuth routes...")
    oauth_routes = [r for r in app.url_map.iter_rules() if 'oauth' in r.rule]
    if oauth_routes:
        print(f"   ✓ Found {len(oauth_routes)} OAuth routes:")
        for route in oauth_routes:
            print(f"      - {route.rule} [{', '.join(route.methods - {'HEAD', 'OPTIONS'})}]")
    else:
        print("   ✗ No OAuth routes found!")
        print("   All routes:")
        for route in app.url_map.iter_rules():
            print(f"      - {route.rule}")
    
    print("\n3. Testing route handlers...")
    with app.app_context():
        try:
            from oauth_handler import get_oauth_auth_url
            print("   ✓ oauth_handler functions accessible")
        except Exception as e:
            print(f"   ✗ Error accessing oauth_handler: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("✓ App startup test completed!")
    print("\nTo start the server, run: python app.py")
    
except Exception as e:
    print(f"\n✗ Error during app startup: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

