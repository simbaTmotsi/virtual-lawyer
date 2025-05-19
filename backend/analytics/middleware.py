from time import time
import json
from django.utils import timezone
from analytics.models import APIUsage

class RequestBodyCaptureMiddleware:
    """Middleware to capture the request body before it gets consumed."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Only store a copy for certain request methods and API endpoints
        if request.method in ['POST', 'PUT', 'PATCH'] and request.path.startswith('/api/'):
            try:
                request._body = request.body
            except Exception as e:
                print(f"Failed to store request body: {str(e)}")
                request._body = None
                
        return self.get_response(request)

class APIUsageMiddleware:
    """Middleware to track API usage metrics."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Record the start time
        start_time = time()
        
        # Process the request
        response = self.get_response(request)
        
        # Only track API endpoints
        if request.path.startswith('/api/'):
            # Calculate response time
            response_time_ms = int((time() - start_time) * 1000)
            
            # Sanitize request data - remove sensitive information
            request_data = None
            # We need to use a custom attribute that stores a copy of the body
            if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, '_body'):
                try:
                    # Try to parse JSON body from our stored copy
                    if request._body:
                        data = json.loads(request._body)
                        # Remove sensitive fields
                        sensitive_fields = ['password', 'token', 'secret', 'auth', 'key', 'credential']
                        if isinstance(data, dict):
                            request_data = {k: '****' if any(s in k.lower() for s in sensitive_fields) else v 
                                           for k, v in data.items()}
                except Exception as e:
                    print(f"Error parsing request body: {str(e)}")
                    request_data = None
            
            # Store the API usage data
            APIUsage.objects.create(
                user=request.user if request.user.is_authenticated else None,
                endpoint=request.path,
                method=request.method,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                request_data=request_data,
                timestamp=timezone.now()
            )
        
        return response
