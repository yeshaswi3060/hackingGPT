from testinggpt.core.config import load_config
import os

# Set dummy key for validation check
os.environ["GROQ_API_KEY"] = "gsk_test"

try:
    config = load_config(target="127.0.0.1")
    print("Success: Config loaded correctly!")
    print(f"Backend Type: {config.backend_type}")
    print(f"LLM API Key (masked): {config.llm_api_key[:10]}...")
except Exception as e:
    print(f"Failed: {e}")
