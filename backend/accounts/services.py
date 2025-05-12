import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError, AuthenticationFailed
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """Service to connect Django backend with FastAPI auth endpoints"""
    
    def __init__(self):
        self.api_base_url = getattr(settings, 'FASTAPI_URL', 'http://localhost:8001')
        logger.info(f"AuthService initialized with API base URL: {self.api_base_url}")
    
    def register_user(self, user_data):
        """Register a user via FastAPI"""
        try:
            # Clean the data before sending - remove password2 which FastAPI might not expect
            data_to_send = {k: v for k, v in user_data.items() if k != 'password2'}
            
            logger.info(f"Sending registration request to {self.api_base_url}/auth/register")
            logger.debug(f"Registration payload: {data_to_send}")
            
            response = requests.post(
                f"{self.api_base_url}/auth/register",
                json=data_to_send,
                timeout=10  # Add timeout to prevent hanging requests
            )
            
            logger.info(f"Registration API response status: {response.status_code}")
            
            # Log response body for debugging (be careful not to log passwords in production)
            if response.status_code != 201:
                logger.warning(f"Registration failed with status {response.status_code}")
                try:
                    error_content = response.json()
                    logger.warning(f"Error response: {error_content}")
                except:
                    logger.warning(f"Non-JSON error response: {response.content}")
            
            if response.status_code == 201:
                return response.json()
            else:
                # Handle different error types more gracefully
                try:
                    error_data = response.json()
                    raise ValidationError(error_data.get('detail', error_data))
                except ValueError:
                    # If response isn't valid JSON, return the raw content
                    raise ValidationError(f"Invalid response from authentication service: {response.content}")
                
        except requests.RequestException as e:
            logger.error(f"Request exception during registration: {str(e)}")
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
