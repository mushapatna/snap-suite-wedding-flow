from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.TextField(blank=True, null=True)
    company_name = models.TextField(blank=True, null=True)
    phone_number = models.TextField(blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    
    ROLE_CHOICES = [
        ('photographer', 'Photographer'),
        ('videographer', 'Videographer'),
        ('editor', 'Editor'),
        ('admin', 'Admin'),
    ]
    role = models.TextField(choices=ROLE_CHOICES, default='photographer')
    
    team_size = models.TextField(blank=True, null=True)
    
    PLAN_CHOICES = [
        ('basic', 'Basic'),
        ('advance', 'Advance'),
        ('premium', 'Premium'),
        ('unlimited', 'Unlimited'),
    ]
    plan_type = models.TextField(choices=PLAN_CHOICES, default='basic')
    
    years_in_business = models.TextField(blank=True, null=True)
    weddings_per_year = models.TextField(blank=True, null=True)
    services_offered = ArrayField(models.TextField(), blank=True, null=True)
    current_tools = ArrayField(models.TextField(), blank=True, null=True)
    referral_source = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, id=uuid.uuid4())

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class WeddingProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    couple_name = models.TextField()
    event_date = models.DateField()
    
    EVENT_TYPE_CHOICES = [
        ('Wedding', 'Wedding'),
        ('Engagement', 'Engagement'),
        ('Pre-wedding', 'Pre-wedding'),
        ('Reception', 'Reception'),
    ]
    event_type = models.TextField(choices=EVENT_TYPE_CHOICES)
    location = models.TextField()
    service_type = models.TextField()
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.TextField(choices=STATUS_CHOICES, default='active')
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.couple_name} - {self.event_type}"


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(WeddingProject, on_delete=models.CASCADE, related_name='events')
    event_name = models.TextField()
    event_date = models.DateField()
    time_from = models.TimeField(blank=True, null=True)
    time_to = models.TimeField(blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    google_map_link = models.TextField(blank=True, null=True)
    photographer = models.TextField(blank=True, null=True)
    cinematographer = models.TextField(blank=True, null=True)
    drone_operator = models.TextField(blank=True, null=True)
    site_manager = models.TextField(blank=True, null=True)
    assistant = models.TextField(blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    sample_image_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(WeddingProject, on_delete=models.CASCADE, related_name='tasks')
    title = models.TextField()
    category = models.TextField(blank=True, null=True)
    priority = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    assigned_to = models.TextField(blank=True, null=True)
    estimated_hours = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    expected_deliverables = models.TextField(blank=True, null=True)
    status = models.TextField(default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EventChecklist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='checklists')
    item_name = models.TextField()
    category = models.TextField()
    assigned_role = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class FileSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='submissions')
    team_member_name = models.TextField()
    team_member_role = models.TextField()
    file_name = models.TextField()
    file_url = models.TextField()
    file_type = models.TextField()
    submission_type = models.TextField()
    review_status = models.TextField(default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewer_notes = models.TextField(blank=True, null=True)


class TeamMemberContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(unique=True)
    role = models.TextField()
    phone_number = models.TextField(blank=True, null=True)
    whatsapp_number = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Invitation Sent'),
        ('joined', 'Joined'),
        ('failed', 'Invitation Failed'),
        ('left', 'Left Team'),
    ]
    status = models.TextField(choices=STATUS_CHOICES, default='pending')
    invitation_token = models.UUIDField(default=uuid.uuid4, editable=False)
    invitation_sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class UserPreference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='preferences')
    theme = models.TextField(default='system')
    language = models.TextField(default='en')
    timezone = models.TextField(default='UTC')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    whatsapp_notifications = models.BooleanField(default=False)
    project_reminders = models.BooleanField(default=True)
    task_reminders = models.BooleanField(default=True)
    event_reminders = models.BooleanField(default=True)
    weekly_summary = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
