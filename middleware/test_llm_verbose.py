import asyncio
from google import genai
import os

async def main():
    try:
        live_client = genai.Client(vertexai=True, project=os.environ.get("GOOGLE_CLOUD_PROJECT"), location=os.environ.get("GOOGLE_CLOUD_REGION"))
        async with live_client.aio.live.connect(model="gemini-2.0-flash-live-preview-04-09") as session:
            await session.send(input="Hello, can you hear me?", end_of_turn=True)
            print("Message sent, waiting for response...")
            async for response in session.receive():
                print(f"RAW RESPONSE: {response}")
                server_content = getattr(response, 'server_content', None)
                if server_content and getattr(server_content, 'model_turn', None):
                    for part in server_content.model_turn.parts:
                        print(f"PART: {part}")
                        if part.text:
                            print(f"TEXT: {part.text}")
                
                if server_content and getattr(server_content, 'turn_complete', False):
                    print("TURN COMPLETE")
                    break
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
