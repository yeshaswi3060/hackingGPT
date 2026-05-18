import os
import asyncio
import litellm
from dotenv import load_dotenv

async def test_groq():
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("ERROR: GROQ_API_KEY not found in .env")
        return

    print(f"Testing Groq with key: {api_key[:8]}...{api_key[-4:]}")
    model = "groq/llama-3.1-8b-instant"
    
    try:
        response = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            api_key=api_key
        )
        print("SUCCESS!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_groq())
