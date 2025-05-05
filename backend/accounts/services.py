import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError, AuthenticationFailed

class AuthService:
    """Service to connect Django backend with FastAPI auth endpoints"""
    
    def __init__(self):
        self.api_base_url = getattr(settings, 'FASTAPI_URL', 'http://localhost:8000')
    
    def register_user(self, user_data):
        """Register a user via FastAPI"""
        try:
            response = requests.post(
                f"{self.api_base_url}/auth/register",
                json=user_data
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                # Convert FastAPI errors to DRF validation errors
                error_data = response.json()
                raise ValidationError(error_data.get('detail', error_data))
                
        except requests.RequestException as e:
            raise ValidationError(f"API connection error: {str(e)}")
    
    def authenticate_user(self, email, password):
        """Authenticate a user via FastAPI"""
        try:
            # FastAPI uses OAuth2 password flow which expects username/password
            response = requests.post(
                f"{self.api_base_url}/auth/login",
                data={
                    'username': email,
                    'password': password
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                # Convert FastAPI errors to DRF auth errors
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', 'Invalid credentials')
                except ValueError:
                    error_msg = 'Authentication failed'
                
                raise AuthenticationFailed(error_msg)
                
        except requests.RequestException as e:
            raise AuthenticationFailed(f"API connection error: {str(e)}")
