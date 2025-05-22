from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from asgiref.sync import sync_to_async

# Import depends on Django being set up, which happens in main.py startup
# We'll use a function to get models only when needed
from ..dependencies import get_current_active_admin_user # Assuming this dependency exists
from ..services.gemini_service import gemini_service, refresh_gemini_client # Import for refresh
from ..utils.django_utils import get_api_key_storage_model, get_system_setting_model
from ..utils.logger import get_logger # Import logger

logger = get_logger(__name__) # Initialize logger

router = APIRouter()

class LLMSettingsResponse(BaseModel):
    openai_key_set: bool
    gemini_key_set: bool
    preferred_model: Optional[str]
    openai_key_masked: Optional[str]
    gemini_key_masked: Optional[str]
    message: Optional[str] = None

class LLMSettingsUpdate(BaseModel):
    openai_key: Optional[str] = Field(None, description="OpenAI API Key. Provide an empty string to clear.")
    gemini_key: Optional[str] = Field(None, description="Gemini API Key. Provide an empty string to clear.")
    preferred_model: Optional[str] = Field(None, description="Preferred LLM ('openai' or 'gemini')")


@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_active_admin_user)): # Added admin dependency
    """Endpoint to list all users"""
    return {"users": [{"id": 1, "email": "admin@example.com", "role": "admin"}]}

@router.get("/settings")
async def get_system_settings(current_user: dict = Depends(get_current_active_admin_user)): # Added admin dependency
    """Endpoint to retrieve system settings"""
    return {"settings": {"maintenance_mode": False, "default_language": "en"}}

@router.get("/llm-settings/", response_model=LLMSettingsResponse)
async def get_llm_settings(current_user: dict = Depends(get_current_active_admin_user)):
    admin_email = current_user.get("email", "Unknown admin")
    logger.info(f"Admin user {admin_email} accessed LLM settings.")
    try:
        # Get Django models through utility functions
        APIKeyStorage = get_api_key_storage_model()
        SystemSetting = get_system_setting_model()
        
        openai_masked_key = await sync_to_async(APIKeyStorage.get_masked_api_key)('openai_api_key')
        gemini_masked_key = await sync_to_async(APIKeyStorage.get_masked_api_key)('gemini_api_key')
        
        system_settings = await sync_to_async(SystemSetting.load)()
        preferred_model = system_settings.preferred_llm

        return LLMSettingsResponse(
            openai_key_set=bool(openai_masked_key),
            gemini_key_set=bool(gemini_masked_key),
            preferred_model=preferred_model,
            openai_key_masked=openai_masked_key,
            gemini_key_masked=gemini_masked_key
        )
    except Exception as e:
        logger.error(f"Error retrieving LLM settings for admin {admin_email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving LLM settings: {str(e)}")

@router.put("/llm-settings/", response_model=LLMSettingsResponse)
async def update_llm_settings(
    settings_update: LLMSettingsUpdate,
    current_user: dict = Depends(get_current_active_admin_user)
):
    admin_email = current_user.get("email", "Unknown admin")
    logger.info(
        f"Admin user {admin_email} attempting to update LLM settings. "
        f"OpenAI key provided: {settings_update.openai_key is not None}, "
        f"Gemini key provided: {settings_update.gemini_key is not None}, "
        f"Preferred model: {settings_update.preferred_model}"
    )

    try:
        # Get Django models through utility functions
        APIKeyStorage = get_api_key_storage_model()
        SystemSetting = get_system_setting_model()
        
        message_parts = []

        # Update API keys
        if settings_update.openai_key is not None:
            # Get Django models through utility functions
            APIKeyStorage = get_api_key_storage_model()
            
            if settings_update.openai_key == "": # Explicitly clear key
                 await sync_to_async(APIKeyStorage.objects.filter(key_name='openai_api_key').delete)()
                 message_parts.append("OpenAI API key cleared.")
                 logger.info(f"Admin user {admin_email} successfully cleared OpenAI API key.")
            else:
                await sync_to_async(APIKeyStorage.store_api_key)('openai_api_key', settings_update.openai_key)
                message_parts.append("OpenAI API key updated.")
                logger.info(f"Admin user {admin_email} successfully updated OpenAI API key.")

        if settings_update.gemini_key is not None:
            # We need APIKeyStorage again
            APIKeyStorage = get_api_key_storage_model()
            
            if settings_update.gemini_key == "": # Explicitly clear key
                await sync_to_async(APIKeyStorage.objects.filter(key_name='gemini_api_key').delete)()
                message_parts.append("Gemini API key cleared.")
                logger.info(f"Admin user {admin_email} successfully cleared Gemini API key.")
                await refresh_gemini_client(gemini_service) # Refresh client after clearing
            else:
                await sync_to_async(APIKeyStorage.store_api_key)('gemini_api_key', settings_update.gemini_key)
                message_parts.append("Gemini API key updated.")
                logger.info(f"Admin user {admin_email} successfully updated Gemini API key.")
                await refresh_gemini_client(gemini_service) # Refresh client after updating

        # Update preferred model
        if settings_update.preferred_model is not None:
            if settings_update.preferred_model not in ["openai", "gemini"]:
                logger.warning(
                    f"Admin user {admin_email} attempted to set invalid preferred model: {settings_update.preferred_model}."
                )
                raise HTTPException(status_code=400, detail="Invalid preferred model. Must be 'openai' or 'gemini'.")
                
            # Get SystemSetting model
            SystemSetting = get_system_setting_model()
            system_settings = await sync_to_async(SystemSetting.load)()
            system_settings.preferred_llm = settings_update.preferred_model
            await sync_to_async(system_settings.save)()
            message_parts.append(f"Preferred LLM updated to {settings_update.preferred_model}.")
            logger.info(f"Admin user {admin_email} successfully updated preferred LLM to {settings_update.preferred_model}.")

        # Fetch updated settings to return
        APIKeyStorage = get_api_key_storage_model()
        SystemSetting = get_system_setting_model()
        
        openai_masked_key = await sync_to_async(APIKeyStorage.get_masked_api_key)('openai_api_key')
        gemini_masked_key = await sync_to_async(APIKeyStorage.get_masked_api_key)('gemini_api_key')
        
        final_system_settings = await sync_to_async(SystemSetting.load)()
        preferred_model = final_system_settings.preferred_llm
        
        response_message = " ".join(message_parts) if message_parts else "No changes applied."

        return LLMSettingsResponse(
            openai_key_set=bool(openai_masked_key),
            gemini_key_set=bool(gemini_masked_key),
            preferred_model=preferred_model,
            openai_key_masked=openai_masked_key,
            gemini_key_masked=gemini_masked_key,
            message=response_message
        )
    except HTTPException as e:
        raise e # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error updating LLM settings for admin {admin_email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating LLM settings: {str(e)}")
