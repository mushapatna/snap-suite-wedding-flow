import os
import django
import requests
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import TeamMemberContact

try:
    user = User.objects.get(username='iqubalmusharaf')
    token, _ = Token.objects.get_or_create(user=user)
    contact = TeamMemberContact.objects.last()
    
    if not contact:
        print("No contacts found")
        sys.exit(1)

    print(f"Triggering invite for {contact.email} ({contact.id})...")
    
    headers = {'Authorization': f'Token {token.key}'}
    response = requests.post(
        f'http://localhost:8000/api/contacts/{contact.id}/resend_invitation/',
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        link = data.get('debug_link')
        print(f"LINK: {link}")
        with open('invite_link.txt', 'w') as f:
            f.write(link)
    except:
        print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
