from django.db import models
from django.conf import settings
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

# Create your admin_portal models here

class SystemSetting(models.Model):
    """Stores global system settings, assuming a single row (id=1)."""
    app_name = models.CharField(max_length=100, default='EasyLaw')
    default_timezone = models.CharField(max_length=100, default='UTC')
    date_format = models.CharField(max_length=50, default='YYYY-MM-DD')
    maintenance_mode = models.BooleanField(default=False)
    allow_registrations = models.BooleanField(default=True)
    # Add other settings as needed
    # default_currency = models.CharField(max_length=3, default='USD')
    # branding_logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    
    # LLM preference (if stored in DB)
    preferred_llm = models.CharField(max_length=20, choices=[('openai', 'OpenAI'), ('gemini', 'Gemini')], default='openai')

    # Ensure only one instance can be created (singleton pattern)
    def save(self, *args, **kwargs):
        self.pk = 1
        super(SystemSetting, self).save(*args, **kwargs)
        
    class Meta:
        app_label = 'admin_portal'

    def delete(self, *args, **kwargs):
        # Prevent deletion of the singleton instance
        pass 

    @classmethod
    def load(cls):
        # Convenience method to get the settings object
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name_plural = "System Settings"
        app_label = 'admin_portal'  # Explicitly set the app label


class APIKeyStorage(models.Model):
    """
    Secure API key storage model with encryption capabilities.
    Keys are encrypted before storing in database.
    """
    key_name = models.CharField(max_length=100, unique=True)
    encrypted_key = models.TextField()
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
        app_label = 'admin_portal'  # Explicitly set the app label
    
    def __str__(self):
        return f"{self.key_name} - {'Active' if self.is_active else 'Inactive'}"
    
    @staticmethod
    def _get_encryption_key():
        """
        Generate encryption key based on Django's SECRET_KEY
        Using PBKDF2 for key derivation for added security
        """
        password = settings.SECRET_KEY.encode()
        salt = b'easylaw_salt_for_encryption'  # In production, this should be stored securely
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    @classmethod
    def store_api_key(cls, key_name, api_key):
        """
        Encrypt and store an API key
        """
        if not api_key:
            return None
            
        # Get or create key record
        key_obj, created = cls.objects.get_or_create(
            key_name=key_name,
            defaults={'encrypted_key': '', 'is_active': True}
        )
        
        # Encrypt the key
        fernet = Fernet(cls._get_encryption_key())
        encrypted_key = fernet.encrypt(api_key.encode())
        
        # Store the encrypted key
        key_obj.encrypted_key = encrypted_key.decode()
        key_obj.is_active = True
        key_obj.save()
        
        return key_obj
    
    @classmethod
    def get_api_key(cls, key_name):
        """
        Retrieve and decrypt an API key by name
        Returns None if key doesn't exist or is inactive
        """
        try:
            key_obj = cls.objects.get(key_name=key_name, is_active=True)
            fernet = Fernet(cls._get_encryption_key())
            decrypted_key = fernet.decrypt(key_obj.encrypted_key.encode()).decode()
            return decrypted_key
        except cls.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error decrypting key {key_name}: {e}")
            return None
    
    @classmethod
    def get_masked_api_key(cls, key_name):
        """
        Return a masked version of the API key for UI display
        """
        try:
            key_obj = cls.objects.get(key_name=key_name, is_active=True)
            fernet = Fernet(cls._get_encryption_key())
            decrypted_key = fernet.decrypt(key_obj.encrypted_key.encode()).decode()
            
            # Mask the key for display, showing only first 4 and last 4 characters
            if len(decrypted_key) > 8:
                masked_key = decrypted_key[:4] + '*' * (len(decrypted_key) - 8) + decrypted_key[-4:]
            else:
                masked_key = '********'  # For very short keys
                
            return masked_key
        except cls.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error retrieving masked key {key_name}: {e}")
            return None
    
    @classmethod
    def deactivate_api_key(cls, key_name):
        """
        Deactivate an API key
        """
        try:
            key_obj = cls.objects.get(key_name=key_name)
            key_obj.is_active = False
            key_obj.save()
            return True
        except cls.DoesNotExist:
            return False
