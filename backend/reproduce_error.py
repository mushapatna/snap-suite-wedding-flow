import requests

def reproduce():
    # 1. Login to get token
    login_url = "http://localhost:8000/api/login/"
    # Using admin credentials if known, or photographer1 created in seed
    creds = {"username": "photographer1", "password": "password123"} 
    
    print(f"Logging in as {creds['username']}...")
    res = requests.post(login_url, json=creds)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return

    token = res.json().get('token')
    print(f"Got token: {token}")

    # 2. Call contacts endpoint
    contacts_url = "http://localhost:8000/api/contacts/"
    headers = {"Authorization": f"Token {token}", "Accept": "application/json"}
    
    print(f"Calling {contacts_url}...")
    res = requests.get(contacts_url, headers=headers)
    
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    reproduce()
