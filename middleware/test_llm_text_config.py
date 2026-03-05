import asyncio
from google import genai
from google.genai import types
import os

async def main():
    live_client = genai.Client(vertexai=True, project=os.environ.get("GOOGLE_CLOUD_PROJECT"), location=os.environ.get("GOOGLE_CLOUD_REGION"))
    config = types.LiveConnectConfig(
        response_modalities=["TEXT"]
    )
    async with live_client.aio.live.connect(model="gemini-2.0-flash-live-preview-04-09", config=config) as session:
        await session.send(input="Hello, can you hear me? Please respond in text only.", end_of_turn=True)
        async for response in session.receive():
            sc = getattr(response, 'server_content', None)
            if sc:
                if getattr(sc, 'model_turn', None):
                    for p in sc.model_turn.parts:
                        print(f"TEXT RECEIVED: {getattr(p, 'text', None)}")
            if sc and getattr(sc, 'turn_complete', False):
                print("TURN COMPLETE")
                break

if __name__ == "__main__":
    asyncio.run(main())
