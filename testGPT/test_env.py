import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class TestConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    groq_api_keys: str | None = None

config = TestConfig()
print(f"KEYS: [{config.groq_api_keys}]")
if config.groq_api_keys:
    parts = config.groq_api_keys.split(",")
    print(f"FIRST KEY: [{parts[0]}]")
    print(f"LAST KEY: [{parts[-1]}]")
