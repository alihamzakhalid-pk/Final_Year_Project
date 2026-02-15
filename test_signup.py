#!/usr/bin/env python
"""Test the signup endpoint with proper JSON"""
import json
import requests

url = "http://127.0.0.1:5000/api/signup"
payload = {
    "email": "test.dev@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User"
}

print(f"Testing {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload)
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
