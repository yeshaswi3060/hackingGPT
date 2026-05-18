
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from testinggpt.core.backend import LiteLLMBackend

def test_truncation():
    print("Testing LiteLLMBackend Truncation...")
    
    backend = LiteLLMBackend(
        working_directory=".",
        system_prompt="Test Prompt",
        model="gpt-4o"
    )
    
    # Update max chars for small test
    backend._MAX_MESSAGE_CHARS = 100
    
    test_str = "A" * 500
    result = backend._truncate_content(test_str)
    
    print(f"Original length: {len(test_str)}")
    print(f"Truncated length: {len(result)}")
    print(f"Result Snippet: {result[:20]} ... {result[-20:]}")
    
    if len(result) < len(test_str) and "[... TRUNCATED" in result:
        print("SUCCESS: Truncation worked.")
    else:
        print("FAILURE: Truncation failed or marker missing.")
        sys.exit(1)

if __name__ == "__main__":
    test_truncation()
