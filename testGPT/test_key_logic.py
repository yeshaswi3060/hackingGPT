from testinggpt.core.config import testinggptConfig
import os

def test_key_selection():
    # Setup environment with both keys
    os.environ["GOOGLE_API_KEY"] = "gemini_key_123"
    os.environ["GROQ_API_KEY"] = "groq_key_456"
    
    # Test 1: Gemini model
    config_gemini = testinggptConfig(target="test", llm_model="gemini/gemini-pro")
    print(f"Model: {config_gemini.llm_model} -> Key: {config_gemini.get_api_key()}")
    
    # Test 2: Groq model
    config_groq = testinggptConfig(target="test", llm_model="groq/llama-3.3-70b-versatile")
    print(f"Model: {config_groq.llm_model} -> Key: {config_groq.get_api_key()}")
    
    # Test 3: Manual override
    config_override = testinggptConfig(target="test", llm_model="groq/llama-3.3-70b-versatile", llm_api_key="manual_override")
    print(f"Model: {config_override.llm_model} (Override) -> Key: {config_override.get_api_key()}")

if __name__ == "__main__":
    test_key_selection()
