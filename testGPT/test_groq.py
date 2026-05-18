import asyncio
import litellm
import os

# Set Groq API key
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

async def test_groq():
    print("Testing LiteLLM with groq/llama-3.3-70b-versatile...")
    try:
        response = await litellm.acompletion(
            model="groq/llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hi, are you working?"}],
        )
        print("Success!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())
