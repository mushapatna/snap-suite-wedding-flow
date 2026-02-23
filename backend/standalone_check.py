import os
import django
import sys

# Set encoding
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import TeamMemberContact, User

print("\n" + "="*30)
print("USERS")
print("="*30)
for u in User.objects.all():
    print(f"User: {u.username} ({u.email})")

print("\n" + "="*30)
print("TEAM MEMBERS")
print("="*30)
for m in TeamMemberContact.objects.all():
    print(f"Member: {m.name} ({m.email}) - {m.role} [{m.status}]")
