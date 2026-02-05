import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Event, Profile

def run():
    print("--- START DEBUG ---")
    profiles = Profile.objects.all()
    for p in profiles:
        print(f"PROFILE: User='{p.user.username}', FullName='{p.full_name}'")
        sys.stdout.flush()

    events = Event.objects.all()
    for e in events:
        print(f"EVENT: Name='{e.event_name}', Date='{e.event_date}', Photographer='{e.photographer}'")
        sys.stdout.flush()

    # Mimic the logic
    target_name = "Photographer 1" # Based on the screenshot
    print(f"--- MATCHING for '{target_name}' ---")
    for e in events:
        photog = e.photographer
        if photog and target_name.lower() in photog.lower():
             print(f"MATCH FOUND: Event '{e.event_name}' matches '{target_name}'")
        else:
             print(f"NO MATCH: Event '{e.event_name}' photog '{photog}' vs '{target_name}'")
        sys.stdout.flush()
    
    print("--- END DEBUG ---")

if __name__ == '__main__':
    run()
