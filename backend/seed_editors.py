import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import Profile, TeamMemberContact

def seed_editors():
    # 1. Find the main admin user (Owner)
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.first()
    
    if not admin_user:
        print("No admin user found. Please create a user first.")
        return

    print(f"Seeding editors for Admin: {admin_user.username} ({admin_user.email})")

    # 2. Define Editors to create
    editors = [
        {"role": "Photo Editor", "username": "photoeditor1", "email": "photoeditor1@example.com"},
        {"role": "Video Editor", "username": "videoeditor1", "email": "videoeditor1@example.com"},
    ]

    for editor in editors:
        role = editor["role"]
        username = editor["username"]
        email = editor["email"]
        password = "password123"
        full_name = f"{role} Sample"

        # A. Create User Account
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        if created:
            user.set_password(password)
            user.save()
            print(f"Created User: {username}")
            
            # Create Profile
            if not hasattr(user, 'profile'):
                Profile.objects.create(user=user, full_name=full_name, role='editor')
            else:
                user.profile.full_name = full_name
                user.profile.role = 'editor'
                user.profile.save()

        # B. Add to Admin's Team (TeamMemberContact)
        contact, created = TeamMemberContact.objects.get_or_create(
            owner=admin_user,
            email=email,
            defaults={
                'name': full_name,
                'role': role,
                'status': 'joined', # Auto-join
                'category': ['post_production'] # Explicitly set category
            }
        )
        if created:
            print(f"Added to Team: {full_name} (Category: {contact.category})")
        else:
            # Update category if exists
            if 'post_production' not in contact.category:
                contact.category.append('post_production')
                contact.save()
                print(f"Updated Team Member: {full_name} added to post_production")
            else:
                print(f"Already in Team: {full_name}")

    print("\nSeed Editors Complete!")
    print("Test Accounts:")
    print("- photoeditor1 / password123")
    print("- videoeditor1 / password123")

if __name__ == "__main__":
    seed_editors()
