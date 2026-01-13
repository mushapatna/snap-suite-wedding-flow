from rest_framework import viewsets, permissions, generics
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.decorators import action
from django.core.mail import send_mail
from django.utils import timezone
import uuid
from rest_framework.views import APIView

from django.db.models import Q

class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 'username' field in request might contain email or username
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not identifier or not password:
            return Response({'error': 'Please provide both username/email and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        # Try finding user by username or email (case insensitive)
        try:
            user = User.objects.get(Q(username__iexact=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            pass
        except User.MultipleObjectsReturned:
            # Handle edge case if multiple users somehow match
            user = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).first()

        if user:
            # Check password
            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.pk,
                    'email': user.email
                })
            else:
                return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'User not found with this email'}, status=status.HTTP_400_BAD_REQUEST)
from .models import Profile, WeddingProject, Event, Task, EventChecklist, FileSubmission, TeamMemberContact, UserPreference
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer, WeddingProjectSerializer, EventSerializer, 
    TaskSerializer, EventChecklistSerializer, FileSubmissionSerializer, 
    TeamMemberContactSerializer, UserPreferenceSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile unless admin (logic to be refined)
        user = self.request.user
        if user.is_staff:
             return Profile.objects.all()
        return Profile.objects.filter(user=user)

class WeddingProjectViewSet(viewsets.ModelViewSet):
    serializer_class = WeddingProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = WeddingProject.objects.filter(user=self.request.user)
        ids = self.request.query_params.get('ids')
        if ids:
            id_list = ids.split(',')
            queryset = queryset.filter(id__in=id_list)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Event.objects.filter(project__user=self.request.user)
        project_id = self.request.query_params.get('project_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        assigned_to = self.request.query_params.get('assigned_to')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if start_date:
            queryset = queryset.filter(event_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(event_date__lte=end_date)
        if assigned_to:
            queryset = queryset.filter(
                Q(photographer__iexact=assigned_to) |
                Q(cinematographer__iexact=assigned_to) |
                Q(drone_operator__iexact=assigned_to) |
                Q(site_manager__iexact=assigned_to) |
                Q(assistant__iexact=assigned_to)
            )
            
        return queryset

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(project__user=self.request.user)
        project_id = self.request.query_params.get('project_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        assigned_to = self.request.query_params.get('assigned_to')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if start_date:
            queryset = queryset.filter(due_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(due_date__lte=end_date)
        if assigned_to:
            queryset = queryset.filter(assigned_to__iexact=assigned_to)
        
        return queryset


class EventChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = EventChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = EventChecklist.objects.filter(event__project__user=self.request.user)
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset

class FileSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = FileSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = FileSubmission.objects.filter(event__project__user=self.request.user)
        team_member_name = self.request.query_params.get('team_member_name')
        event_id = self.request.query_params.get('event_id')
        
        if team_member_name:
            queryset = queryset.filter(team_member_name__iexact=team_member_name)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
            
        return queryset

class TeamMemberContactViewSet(viewsets.ModelViewSet):
    queryset = TeamMemberContact.objects.all()
    serializer_class = TeamMemberContactSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        member = serializer.save()
        
        # Auto-send invitation on create
        member.invitation_token = uuid.uuid4()
        member.invitation_sent_at = timezone.now()
        member.status = 'sent'
        member.save()
        
        # Send Email (Console for now)
        # Assuming frontend runs on 8080 or 5173. 
        invite_link = f"http://localhost:5173/accept-invitation/{member.invitation_token}"

        send_mail(
            subject=f"Invitation to join {self.request.user.profile.company_name or 'Wedding Team'}",
            message=f"Hi {member.name},\n\nYou have been invited to join the team. Click the link below to accept:\n\n{invite_link}\n\nBest,\n{self.request.user.username}",
            from_email="system@weddingflow.com",
            recipient_list=[member.email],
            fail_silently=False,
        )

    @action(detail=True, methods=['post'])
    def resend_invitation(self, request, pk=None):
        member = self.get_object()
        
        # Generate new token
        member.invitation_token = uuid.uuid4()
        member.invitation_sent_at = timezone.now()
        member.status = 'sent'
        member.save()
        
        # Send Email (Console for now)
        invite_link = f"http://localhost:8080/accept-invitation/{member.invitation_token}"
        # Assuming frontend runs on 8080 or 5173. 
        # Using 5173 as per standard Vite.
        invite_link = f"http://localhost:5173/accept-invitation/{member.invitation_token}"

        send_mail(
            subject=f"Invitation to join {request.user.profile.company_name or 'Wedding Team'}",
            message=f"Hi {member.name},\n\nYou have been invited to join the team. Click the link below to accept:\n\n{invite_link}\n\nBest,\n{request.user.username}",
            from_email="system@weddingflow.com",
            recipient_list=[member.email],
            fail_silently=False,
        )
        
        return Response({
            'status': 'invitation sent', 
            'token': str(member.invitation_token),
            'debug_link': invite_link # Useful for development
        })

    @action(detail=False, methods=['get'])
    def check_invitation(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            member = TeamMemberContact.objects.get(invitation_token=token)
            # Return limited info
            return Response({
                'id': member.id,
                'email': member.email,
                'role': member.role,
                'inviter_name': 'Wedding Team', # Placeholder until we store inviter
                'valid': True
            })
        except TeamMemberContact.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            member = TeamMemberContact.objects.get(invitation_token=token)
            member.status = 'joined'
            member.save()
            return Response({'status': 'joined', 'member': TeamMemberContactSerializer(member).data})
        except TeamMemberContact.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework.views import APIView

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Counts
        active_projects_count = WeddingProject.objects.filter(user=user, status='active').count()
        team_members_count = TeamMemberContact.objects.count() # Global team for now, or filter if relationship exists
        
        # Recent Activity
        activities = []
        
        # 1. Recent Projects
        recent_projects = WeddingProject.objects.filter(user=user).order_by('-created_at')[:5]
        for project in recent_projects:
            activities.append({
                'action': 'New project created',
                'details': f"{project.couple_name} - {project.event_type}",
                'time': project.created_at,
                'status': 'success'
            })
            
        # 2. Recent Team Members (Assuming they are global or related to user somehow. 
        # For now getting all recent since TeamMemberContact model doesn't have user FK yet based on models.py view)
        # Actually checking models.py -> TeamMemberContact has no user FK. 
        # Assuming shared team list or I should filter if I added that field. 
        # Let's just show recent from the table.
        recent_members = TeamMemberContact.objects.all().order_by('-created_at')[:5]
        for member in recent_members:
            activities.append({
                'action': 'Team member invited',
                'details': f"{member.name} as {member.role}",
                'time': member.created_at,
                'status': 'pending'  # Can assume pending or check status if it existed. Model has no status field visible in snippet? 
                # Wait, models.py snippet showed TeamMemberContact has no status? 
                # Let me re-read models.py snippet.
                # Snippet: TeamMemberContact: id, name, role... created_at. No status. 
                # I will default to 'success' or 'info'.
            })

        # Sort combined activities by time desc
        activities.sort(key=lambda x: x['time'], reverse=True)
        activities = activities[:10] # Top 10

        return Response({
            'active_projects': active_projects_count,
            'team_members': team_members_count,
            'revenue': 0, # Placeholder
            'client_satisfaction': '100%', # Placeholder
            'recent_activity': activities
        })


class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

