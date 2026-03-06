import asyncio
import websockets
import json

async def test():
    async with websockets.connect("wss://mnk-orchestrator-148520507547.us-central1.run.app/ws/stream") as websocket:
        await websocket.send(json.dumps({"text": "Tell me a short joke about a programmer."}))
        response = await websocket.recv()
        print(f"Response: {response}")

asyncio.run(test())
