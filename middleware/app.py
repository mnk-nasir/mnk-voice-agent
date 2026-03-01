import os
import time
import json
import asyncio
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MNK Voice Agent Suite Middleware")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")

# Initialize Vertex AI
if GOOGLE_CLOUD_PROJECT:
    aiplatform.init(project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_REGION)
    model = GenerativeModel("gemini-2.0-flash-exp") # Utilizing Gemini 2.0 Flash

@app.get("/health")
async def health_check():
    return {"status": "ok"}

async def process_with_llm(text: str) -> str:
    """Mock intent recognition and generation with Gemini."""
    if not GOOGLE_CLOUD_PROJECT:
        # Fallback for local testing without GCP credentials
        return f"Echo from LLM: {text}"
    
    try:
        response = await model.generate_content_async(
            f"You are the MNK Voice Agent. Respond concisely and professionally to the user: {text}"
        )
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return "I'm sorry, I'm having trouble processing that right now."

async def synthesize_speech(text: str) -> bytes:
    """Mock ElevenLabs TTS Synthesis."""
    # In a real scenario, this would call the ElevenLabs /v1/text-to-speech stream API
    # Return dummy audio bytes for the demo
    return b"dummy_audio_bytes_representing_" + text.encode()

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected for STT -> LLM -> TTS pipeline")
    
    try:
        while True:
            # 1. Receive audio from client (Mocked as text for simplicity in this baseline)
            # In a real app, this would be raw audio bytes sent to Deepgram WebSocket
            data = await websocket.receive_text()
            print(f"Received input: {data}")
            
            # Start timing for TTFB (Time to First Byte)
            start_time = time.perf_counter()
            
            # 2. STT (Deepgram representation)
            # transcribed_text = await deepgram_stt(data)
            transcribed_text = data # Mocking STT result
            
            # 3. Reasoning (Gemini 2.0 Flash)
            llm_response = await process_with_llm(transcribed_text)
            print(f"LLM Response: {llm_response}")
            
            # 4. TTS (ElevenLabs / Cartesia)
            audio_bytes = await synthesize_speech(llm_response)
            
            # Calculate and log Time to First Byte (TTFB) targeting < 300ms
            ttfb = (time.perf_counter() - start_time) * 1000
            print(f"TTFB: {ttfb:.2f}ms")
            
            # 5. Send back to client
            await websocket.send_json({
                "type": "response",
                "text": llm_response,
                "ttfb_ms": round(ttfb, 2),
                "audio": "base64_audio_payload" # Mock audio payload
            })
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
