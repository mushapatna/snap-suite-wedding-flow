import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Event, TeamMemberContact

def run():
    print("--- INSPECTING STRINGS ---")
    
    # Get Team Member Name
    try:
        member = TeamMemberContact.objects.get(id="8b8e458b-52f2-4d6d-a7c5-5c3b1277e806")
        print(f"Team Member Name repr: {repr(member.name)}")
    except:
        print("Member not found")

    # Get Events
    for e in Event.objects.all():
        print(f"Event '{e.event_name}' Photographer repr: {repr(e.photographer)}")
        
if __name__ == '__main__':
    run()
