import os
import django
import sys
from django.db.models import Q

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import TeamMemberContact, Event, Task

def run():
    member_id = "8b8e458b-52f2-4d6d-a7c5-5c3b1277e806"
    print(f"--- CHECKING DATA FOR MEMBER ID: {member_id} ---")
    
    try:
        member = TeamMemberContact.objects.get(id=member_id)
        name = member.name
        print(f"Member Name: '{name}'")
        
        # Check Events
        print("\n--- CHECKING EVENTS ---")
        events = Event.objects.filter(
            Q(photographer__iexact=name) |
            Q(cinematographer__iexact=name) |
            Q(drone_operator__iexact=name) |
            Q(site_manager__iexact=name) |
            Q(assistant__iexact=name)
        )
        print(f"Events found matching '{name}': {events.count()}")
        for e in events:
            print(f" - {e.event_name} (Photographer: '{e.photographer}')")

        # Check Tasks
        print("\n--- CHECKING TASKS ---")
        tasks = Task.objects.filter(assigned_to__iexact=name)
        print(f"Tasks found matching '{name}': {tasks.count()}")
        for t in tasks:
            print(f" - {t.title} (Assigned to: '{t.assigned_to}')")
            
        # Check if there are ANY tasks/events regardless of match, to see if data exists at all
        all_events_count = Event.objects.count()
        print(f"\nTotal Events in DB: {all_events_count}")
        if all_events_count > 0:
            e = Event.objects.first()
            print(f"Sample Event Photographer: '{e.photographer}'")

    except TeamMemberContact.DoesNotExist:
        print("Team Member not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    run()
