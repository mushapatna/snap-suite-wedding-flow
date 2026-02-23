from api.models import TeamMemberContact, User

print("\n" + "=" * 50)
print("USER ACCOUNTS")
print("=" * 50)
for u in User.objects.all():
    print(f"Username: {u.username:<30} | Email: {u.email}")

print("\n" + "=" * 50)
print("TEAM MEMBERS")
print("=" * 50)
for m in TeamMemberContact.objects.all():
    print(f"Name: {m.name:<20} | Email: {m.email:<30} | Role: {m.role:<15} | Status: {m.status}")
print("=" * 50 + "\n")
