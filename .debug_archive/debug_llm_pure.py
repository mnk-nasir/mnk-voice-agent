import asyncio
import os
from google import genai

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "genuine-episode-420910")
GOOGLE_CLOUD_REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")

try:
    live_client = genai.Client(
        vertexai=True, 
        project=GOOGLE_CLOUD_PROJECT, 
        location=GOOGLE_CLOUD_REGION
    )
except Exception as e:
    print(f"Auth error: {e}")
    live_client = None

async def process_with_llm(text: str) -> str:
    if not live_client:
        return "No client initialized."
    try:
        async with live_client.aio.live.connect(
            model="gemini-2.0-flash-live-preview-04-09",
            config={"response_modalities": ["TEXT"]}
        ) as session:
            await session.send(input=f"You are the MNK Voice Agent. Respond concisely and professionally to the user: {text}", end_of_turn=True)
            full_response = ""
            async for response in session.receive():
                server_content = getattr(response, 'server_content', None)
                if server_content and getattr(server_content, 'model_turn', None):
                    for part in server_content.model_turn.parts:
                        if part.text:
                            full_response += part.text
                if server_content and getattr(server_content, 'turn_complete', False):
                    break
            return full_response if full_response else "I'm sorry, I couldn't generate a response."
    except Exception as e:
        return f"CRASH: {str(e)}"

async def main():
    print("Testing Joke prompt:")
    res = await process_with_llm("Tell me a short joke about a programmer.")
    print(f"Result: {res}")
    
    print("\nTesting Error prompt:")
    res2 = await process_with_llm("Error transcribing audio")
    print(f"Result: {res2}")

if __name__ == "__main__":
    asyncio.run(main())
