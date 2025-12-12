"""Quick test to verify OAuth routes are accessible"""
import requests

base_url = "http://127.0.0.1:5000"

def test_oauth_routes():
    """Test OAuth routes"""
    providers = ['google', 'facebook', 'microsoft', 'github']
    
    print("Testing OAuth routes...")
    print(f"Base URL: {base_url}\n")
    
    for provider in providers:
        url = f"{base_url}/api/oauth/{provider}"
        try:
            response = requests.get(url, timeout=5)
            print(f"✓ {provider.upper()}: {response.status_code} - {response.json() if response.status_code == 200 else response.text[:100]}")
        except requests.exceptions.ConnectionError:
            print(f"✗ {provider.upper()}: Connection Error - Flask server is not running!")
            print("   Please start the Flask server: python app.py")
            return False
        except Exception as e:
            print(f"✗ {provider.upper()}: Error - {str(e)}")
    
    print("\n✓ All routes tested!")
    return True

if __name__ == '__main__':
    test_oauth_routes()

