from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    ProfileViewSet, WeddingProjectViewSet, EventViewSet, 
    TaskViewSet, EventChecklistViewSet, FileSubmissionViewSet, 
    TeamMemberContactViewSet, UserPreferenceViewSet, RegisterView, CustomLoginView, DashboardStatsView
)

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'projects', WeddingProjectViewSet, basename='project')
router.register(r'events', EventViewSet, basename='event')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'checklists', EventChecklistViewSet, basename='checklist')
router.register(r'submissions', FileSubmissionViewSet, basename='submission')
router.register(r'contacts', TeamMemberContactViewSet, basename='contact')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
]
