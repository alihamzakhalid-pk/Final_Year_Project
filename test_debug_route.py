from app import app

print("Testing debug email route...")
try:
    with app.test_client() as client:
        resp = client.get('/api/debug/test-email/test@example.com')
        print(f"Status Code: {resp.status_code}")
        print(f"Response Body: {resp.data.decode()}")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Test Failed: {e}")
