import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

# Define the path to the root .env file relative to this config file's location
# Assuming config.py is in api/app/
DOTENV_PATH = Path(__file__).resolve().parent.parent.parent / '.env' # Go up three levels from api/app/config.py

# Load the .env file from the root directory
load_dotenv(dotenv_path=DOTENV_PATH)

class Settings(BaseSettings):
    api_secret_key: str = os.getenv("API_SECRET_KEY", "default_secret")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    # Add other API settings here

    # If using Pydantic's built-in .env loading, you might configure it like this instead of manual load_dotenv:
    # class Config:
    #    env_file = '../../.env' # Path relative to this file

settings = Settings()

