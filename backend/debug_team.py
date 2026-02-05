import os
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import User
from api.models import TeamMemberContact
from api.serializers import TeamMemberContactSerializer
from api.views import TeamMemberContactViewSet

def debug_team_view():
    print("Debugging TeamMemberContactViewSet...")
    
    # 1. Get a user
    user = User.objects.first()
    print(f"Using user: {user.username}")
    
    # 2. Test Queryset
    print("Testing Queryset...")
    try:
        queryset = TeamMemberContact.objects.filter(owner=user)
        print(f"Queryset count: {queryset.count()}")
        for member in queryset:
            print(f"- {member.name} (Owner: {member.owner})")
    except Exception as e:
        print(f"QUERYSET ERROR: {e}")
        import traceback
        traceback.print_exc()
        return

    # 3. Test Serializer on ALL
    print("Testing Serializer on ALL objects...")
    all_contacts = TeamMemberContact.objects.all()
    print(f"Total contacts: {all_contacts.count()}")
    
    for contact in all_contacts:
        try:
            data = TeamMemberContactSerializer(contact).data
            # print(f"OK: {contact.name}")
        except Exception as e:
            print(f"FAIL: {contact.name} ({contact.id}) - {e}")
            import traceback
            traceback.print_exc()


    print("Debug finished successfully.")

if __name__ == "__main__":
    debug_team_view()
