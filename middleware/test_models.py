import asyncio
from google import genai
from google.auth import default

async def test_model(model_name):
    try:
        client = genai.Client(vertexai=True, project='genuine-episode-420910', location='us-central1') 
        async with client.aio.live.connect(model=model_name) as session:
            print(f"SUCCESS: Connected to {model_name}")
            return True
    except Exception as e:
        print(f"FAILED: {model_name} -> {e}")
        return False

async def main():
    models = [
        "gemini-2.0-flash-exp", 
        "gemini-2.0-flash-realtime-exp", 
        "gemini-2.0-flash-live-preview-04-09", 
        "gemini-2.0-flash", 
        "gemini-2.5-flash",
        "gemini-2.0-flash-001"
    ]
    for m in models:
        await test_model(m)

if __name__ == "__main__":
    asyncio.run(main())
