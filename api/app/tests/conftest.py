import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Import the FastAPI application instance
# Assuming your FastAPI app instance is named 'app' in 'api.app.main'
from api.app.main import app

@pytest.fixture(scope="module")
def client():
    """
    Yield a TestClient instance for the FastAPI app.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_admin_user():
    """
    Provides a mock admin user dictionary.
    """
    return {"email": "admin@example.com", "role": "admin", "id": 1}

@pytest.fixture
def mock_get_current_active_admin_user_dependency(mocker, mock_admin_user):
    """
    Mocks the get_current_active_admin_user dependency to return a mock admin user.
    """
    mock_dependency = mocker.patch("api.app.dependencies.get_current_active_admin_user")
    mock_dependency.return_value = mock_admin_user
    return mock_dependency

@pytest.fixture
def mock_get_current_active_admin_user_unauthorized(mocker):
    """
    Mocks the get_current_active_admin_user dependency to raise an HTTPException
    simulating an unauthorized user.
    """
    from fastapi import HTTPException
    mock_dependency = mocker.patch("api.app.dependencies.get_current_active_admin_user")
    mock_dependency.side_effect = HTTPException(status_code=403, detail="Not authorized")
    return mock_dependency

# Fixture to mock Django settings if necessary, though direct model mocking is preferred for these tests.
# @pytest.fixture(autouse=True)
# def mock_django_setup(mocker):
#     """
#     Mocks django.setup() to prevent it from running during tests if it causes issues.
#     Also mocks Django settings if they are accessed directly in a way that affects tests.
#     """
#     mocker.patch("django.setup", return_value=None)
#     # If your app uses django.conf.settings directly in a way that needs mocking for tests:
#     # mock_settings = MagicMock()
#     # mock_settings.YOUR_SETTING_VARIABLE = "some_value"
#     # mocker.patch("django.conf.settings", new=mock_settings)

# It's important that Django's setup in main.py (os.environ.setdefault and django.setup())
# is compatible with the test environment. If models are imported at the module level
# in files that are imported by main.py, Django needs to be configured before those imports.
# The current FastAPI app structure seems to handle Django setup on startup,
# which should be okay for TestClient as it loads the app.
# The primary focus for these tests will be on mocking the ORM interactions at the point of use.

@pytest.fixture
def mock_api_key_storage(mocker):
    """Mocks the APIKeyStorage Django model and its methods."""
    mock = MagicMock()
    mock.get_masked_api_key = MagicMock()
    mock.store_api_key = MagicMock()
    
    # For APIKeyStorage.objects.filter().delete()
    mock_filter_result = MagicMock()
    mock_filter_result.delete = MagicMock(return_value=(1, {"admin_portal.APIKeyStorage": 1})) # Simulate one record deleted
    
    mock_objects = MagicMock()
    mock_objects.filter.return_value = mock_filter_result
    mock.objects = mock_objects
    
    mocker.patch("backend.admin_portal.models.APIKeyStorage", new=mock)
    return mock

@pytest.fixture
def mock_system_setting(mocker):
    """Mocks the SystemSetting Django model and its methods."""
    mock_instance = MagicMock()
    mock_instance.preferred_llm = "openai" # Default mock value
    mock_instance.save = MagicMock()

    mock_model = MagicMock()
    mock_model.load = MagicMock(return_value=mock_instance)
    
    mocker.patch("backend.admin_portal.models.SystemSetting", new=mock_model)
    return mock_model, mock_instance

@pytest.fixture
def mock_refresh_gemini_client(mocker):
    """Mocks the refresh_gemini_client service function."""
    from unittest.mock import AsyncMock
    # The function is imported into the router's namespace (admin.py)
    # So, we patch it where it's looked up by the router code.
    mock = mocker.patch("api.app.routers.admin.refresh_gemini_client", new_callable=AsyncMock)
    return mock
