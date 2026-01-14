import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Event, Profile

print("-" * 20)
print("PROFILES:")
for p in Profile.objects.all():
    try:
        print(f"User: {p.user.username}, Name: '{p.full_name}', Role: {p.role}")
    except Exception as e:
        print(f"Error printing profile: {e}")

print("-" * 20)
print("EVENTS:")
for e in Event.objects.all():
    try:
        print(f"Event: '{e.event_name}', Photog: '{e.photographer}'")
    except Exception as e:
        print(f"Error printing event: {e}")
print("-" * 20)
