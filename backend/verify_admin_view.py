import os
import sys
import django
import requests

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User

def verify_admin():
    # 1. Reset Admin Password
    username = "musharafiqubal" # Adjust if necessary based on previous list
    try:
        user = User.objects.get(username__istartswith="musharaf") # Fuzzy match to be safe
        print(f"Found Admin: {user.username} ({user.email})")
        user.set_password("password123")
        user.save()
        print("Password reset to 'password123'")
    except User.DoesNotExist:
        print("Admin user not found!")
        return

    # 2. Login
    login_url = "http://localhost:8000/api/login/"
    creds = {"username": user.username, "password": "password123"}
    
    print(f"Logging in as {user.username}...")
    res = requests.post(login_url, json=creds)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return

    token = res.json().get('token')
    print(f"Got token: {token[:10]}...")

    # 3. Fetch Team
    contacts_url = "http://localhost:8000/api/contacts/"
    headers = {"Authorization": f"Token {token}", "Accept": "application/json"}
    
    print(f"Fetching Team from {contacts_url}...")
    res = requests.get(contacts_url, headers=headers)
    
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        results = data if isinstance(data, list) else data.get('results', [])
        print(f"Found {len(results)} team members:")
        for member in results:
            print(f"- {member.get('name')} ({member.get('role')})")
    else:
        print(f"Error: {res.text}")

if __name__ == "__main__":
    verify_admin()
