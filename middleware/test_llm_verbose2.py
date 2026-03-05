import asyncio
from google import genai
import os

async def main():
    live_client = genai.Client(vertexai=True, project=os.environ.get("GOOGLE_CLOUD_PROJECT"), location=os.environ.get("GOOGLE_CLOUD_REGION"))
    async with live_client.aio.live.connect(model="gemini-2.0-flash-live-preview-04-09") as session:
        await session.send(input="Hello, can you hear me?", end_of_turn=True)
        with open("llm_out_native.txt", "w", encoding="utf-8") as f:
            async for response in session.receive():
                sc = getattr(response, 'server_content', None)
                if sc:
                    f.write(f"ServerContent keys: {dir(sc)}\n")
                    if getattr(sc, 'model_turn', None):
                        f.write(f"Model Turn parts: {sc.model_turn.parts}\n")
                        for p in sc.model_turn.parts:
                            f.write(f"Part type: {type(p)}, text: {getattr(p, 'text', 'NO TEXT')}\n")
                            f.write(f"Part keys: {dir(p)}\n")
                
                if sc and getattr(sc, 'turn_complete', False):
                    f.write("TURN COMPLETE\n")
                    break

if __name__ == "__main__":
    asyncio.run(main())
