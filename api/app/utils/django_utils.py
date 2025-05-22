# django_utils.py - Utility functions for accessing Django models safely

import logging
import sys
import os
import django
from pathlib import Path

logger = logging.getLogger(__name__)

# Ensure Django is set up
def ensure_django_setup():
    """Ensure Django is set up before accessing Django models"""
    if not hasattr(django, "setup") or not hasattr(django.apps, "apps"):
        # Django not set up yet
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.django_settings")
        django.setup()
        logger.info("Django setup performed in django_utils")
    
def get_api_key_storage_model():
    """Get the APIKeyStorage model while ensuring Django is set up"""
    ensure_django_setup()
    
    # Try to import from Django first
    try:
        from backend.admin_portal.models import APIKeyStorage
        return APIKeyStorage
    except (ImportError, RuntimeError):
        # If Django import fails, use our direct database approach
        try:
            from .api_key_helper import APIKeyHelper
            return APIKeyHelper
        except ImportError:
            logger.error("Failed to import either Django model or API key helper.")
            return None

def get_system_setting_model():
    """Get the SystemSetting model while ensuring Django is set up"""
    ensure_django_setup()
    
    # Try to import from Django first
    try:
        from backend.admin_portal.models import SystemSetting
        return SystemSetting
    except (ImportError, RuntimeError):
        # If Django import fails, create a minimal implementation
        logger.warning("Could not import SystemSetting model. Using minimal implementation.")
        class MinimalSystemSetting:
            @classmethod
            def load(cls):
                return {"preferred_llm": "gemini"}
        return MinimalSystemSetting
