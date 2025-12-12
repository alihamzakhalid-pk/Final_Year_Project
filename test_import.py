"""Test if oauth_handler imports correctly"""
try:
    from oauth_handler import get_oauth_auth_url, exchange_oauth_code, get_or_create_oauth_user
    print('✓ oauth_handler imports successfully')
    print('✓ All functions imported: get_oauth_auth_url, exchange_oauth_code, get_or_create_oauth_user')
except Exception as e:
    print(f'✗ Import error: {e}')
    import traceback
    traceback.print_exc()

