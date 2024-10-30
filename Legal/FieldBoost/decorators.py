from django.contrib.auth.decorators import user_passes_test
from Legal.FieldBoost.models import CustomUser

# Decorator for lawyer role
def lawyer_required(function=None):
    decorator = user_passes_test(lambda user: user.role == CustomUser.UserRole.LAWYER)
    if function:
        return decorator(function)
    return decorator

# Decorator for client role
def client_required(function=None):
    decorator = user_passes_test(lambda user: user.role == CustomUser.UserRole.CLIENT)
    if function:
        return decorator(function)
    return decorator

# Decorator for admin role
def admin_required(function=None):
    decorator = user_passes_test(lambda user: user.role == CustomUser.UserRole.ADMIN)
    if function:
        return decorator(function)
    return decorator
