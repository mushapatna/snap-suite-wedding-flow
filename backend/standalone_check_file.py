import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import TeamMemberContact, User

try:
    with open('db_result_final.txt', 'w', encoding='utf-8') as f:
        f.write("=== USERS ===\n")
        for u in User.objects.all():
            f.write(f"User: {u.username} | Email: {u.email}\n")
        
        f.write("\n=== TEAM MEMBERS ===\n")
        for m in TeamMemberContact.objects.all():
            f.write(f"Member: {m.name} | Email: {m.email} | Role: {m.role} | Status: {m.status}\n")
    print("DONE WRITING")
except Exception as e:
    print(f"ERROR: {e}")
