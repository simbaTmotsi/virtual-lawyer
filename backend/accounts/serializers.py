from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User object"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'phone')
        read_only_fields = ('id', 'date_joined', 'is_active') # is_active might be managed by admin

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the UserProfile object"""
    user = UserSerializer(read_only=True) # Display user details, but don't allow updating user via profile endpoint

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'profile_picture', 'address', 'bio', 'date_of_birth', 'updated_at')
        read_only_fields = ('id', 'user', 'updated_at')

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'role', 'phone')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # Add role validation if needed (e.g., prevent self-registration as admin)
        allowed_roles = ['attorney', 'paralegal', 'client'] # Example: Allow these roles for self-registration
        if attrs.get('role') not in allowed_roles:
             raise serializers.ValidationError({"role": f"Invalid role selected. Allowed roles: {', '.join(allowed_roles)}."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # You might want to create a UserProfile here too, or handle it via signals
        # UserProfile.objects.create(user=user)
        return user
