import asyncio
import litellm
import os

# Set API key directly for test
os.environ["GOOGLE_API_KEY"] = "AIzaSyAOvxTBqdaQ8RBIya-ifAZMQSPiTU_xCv4"

async def test_lite():
    print("Testing LiteLLM with gemini/gemini-2.0-flash-lite...")
    try:
        response = await litellm.acompletion(
            model="gemini/gemini-2.0-flash-lite",
            messages=[{"role": "user", "content": "Hi, are you working?"}],
        )
        print("Success!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_lite())
