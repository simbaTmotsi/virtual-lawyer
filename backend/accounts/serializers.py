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
            'phone': {'required': False},  # Make phone optional
        }

    def validate(self, attrs):
        # Password matching validation
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Role validation - prevent self-registration as admin
        allowed_roles = ['attorney', 'paralegal', 'client']  # Roles allowed for self-registration
        if attrs.get('role') not in allowed_roles:
            raise serializers.ValidationError({
                "role": f"Invalid role selected. Allowed roles: {', '.join(allowed_roles)}."
            })
        
        # Email format validation
        email = attrs.get('email', '').strip().lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})
            
        return attrs

    def create(self, validated_data):
        # Remove password confirmation field
        validated_data.pop('password2')
        
        # Create the user
        user = User.objects.create_user(**validated_data)
        
        # Create user profile automatically
        UserProfile.objects.create(user=user)
        
        return user

class UserRegistrationSerializer(serializers.ModelSerializer):
    # Explicitly define password2 field
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        # Validate that password and password2 match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        # Remove password2 before creating the user
        validated_data.pop('password2', None)
        user = User.objects.create_user(**validated_data)
        return user
