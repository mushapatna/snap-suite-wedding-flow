from rest_framework import serializers
from .models import Profile, WeddingProject, Event, Task, EventChecklist, FileSubmission, TeamMemberContact, UserPreference
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    # Profile fields
    full_name = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, allow_blank=True)
    plan_type = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    years_in_business = serializers.CharField(required=False, allow_blank=True)
    weddings_per_year = serializers.CharField(required=False, allow_blank=True)
    services_offered = serializers.ListField(child=serializers.CharField(allow_blank=True), required=False, allow_empty=True)
    current_tools = serializers.ListField(child=serializers.CharField(allow_blank=True), required=False, allow_empty=True)
    referral_source = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        return data

    def create(self, validated_data):
        # Extract user data
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Update profile (created via signal)
        profile = user.profile
        for attr, value in validated_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return user



class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = '__all__'

class WeddingProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeddingProject
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class EventChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventChecklist
        fields = '__all__'

class FileSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileSubmission
        fields = '__all__'

class TeamMemberContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberContact
        fields = '__all__'

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
