import os
import django
import sys
from django.db.models import Q

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Event, Task

def run():
    name = "Photographer 1"
    print(f"Checking for Name: '{name}'")
    
    # Check Events
    events = Event.objects.filter(
        Q(photographer__iexact=name) |
        Q(cinematographer__iexact=name) |
        Q(drone_operator__iexact=name) |
        Q(site_manager__iexact=name) |
        Q(assistant__iexact=name)
    )
    print(f"Events found: {events.count()}")

    # Check Tasks
    tasks = Task.objects.filter(assigned_to__iexact=name)
    print(f"Tasks found: {tasks.count()}")

    # List all unique photographers in events to see what exists
    print("Existing Photographers in Events:")
    for e in Event.objects.values_list('photographer', flat=True).distinct():
        print(f" - '{e}'")

if __name__ == '__main__':
    run()
