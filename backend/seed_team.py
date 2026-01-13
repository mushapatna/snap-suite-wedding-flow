import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import Profile, TeamMemberContact

def seed_team():
    # 1. Find the main admin user (Owner)
    # We'll use the first superuser, or the first user if no superuser exists.
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.first()
    
    if not admin_user:
        print("No admin user found. Please create a user first.")
        return

    print(f"Seeding team for Admin: {admin_user.username} ({admin_user.email})")

    # 2. Define Team Members to create
    team_members = [
        {"role": "Photographer", "count": 2},
        {"role": "Videographer", "count": 2},
        {"role": "Drone Operator", "count": 1},
    ]

    for group in team_members:
        role = group["role"]
        count = group["count"]
        
        for i in range(1, count + 1):
            username = f"{role.lower().replace(' ', '')}{i}"
            email = f"{username}@example.com"
            password = "password123"
            full_name = f"{role} {i}"

            # A. Create User Account
            user, created = User.objects.get_or_create(username=username, defaults={'email': email})
            if created:
                user.set_password(password)
                user.save()
                print(f"Created User: {username}")
                
                # Create Profile
                if not hasattr(user, 'profile'):
                    Profile.objects.create(user=user, full_name=full_name, role=role.lower().split(' ')[0]) # Simplify role
                else:
                    user.profile.full_name = full_name
                    user.profile.role = role.lower().split(' ')[0]
                    user.profile.save()

            # B. Add to Admin's Team (TeamMemberContact)
            contact, created = TeamMemberContact.objects.get_or_create(
                owner=admin_user,
                email=email,
                defaults={
                    'name': full_name,
                    'role': role,
                    'status': 'joined' # Auto-join for testing
                }
            )
            if created:
                print(f"Added to Team: {full_name}")
            else:
                print(f"Already in Team: {full_name}")

    print("\nSeed Complete!")
    print("Test Accounts Created:")
    print("- photographer1 / password123")
    print("- photographer2 / password123")
    print("- videographer1 / password123")
    print("- videographer2 / password123")
    print("- droneoperator1 / password123")

if __name__ == "__main__":
    seed_team()
