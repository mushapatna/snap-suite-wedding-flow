import sys
# Force UTF-8 for stdout
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from api.models import TeamMemberContact, User

print("\n--- USERS ---")
for u in User.objects.all():
    print(f"User: {u.username} ({u.email})")

print("\n--- TEAM MEMBERS ---")
for m in TeamMemberContact.objects.all():
    print(f"Member: {m.name} ({m.email}) - {m.role} [{m.status}]")
