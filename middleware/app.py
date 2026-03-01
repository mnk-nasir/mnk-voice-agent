import os
import time
import json
import asyncio
import base64
import httpx
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
    """Real intent recognition and generation with Gemini 2.0."""
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

async def deepgram_stt(audio_data: bytes) -> str:
    """Real Deepgram STT (Speech-to-Text)."""
    if not DEEPGRAM_API_KEY or DEEPGRAM_API_KEY == "your-deepgram-api-key":
        return "Mock transcribed text from audio bytes"

    url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true"
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/webm" # Expected frontend audio format
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, content=audio_data, headers=headers)
            if response.status_code == 200:
                result = response.json()
                return result.get('results', {}).get('channels', [{}])[0].get('alternatives', [{}])[0].get('transcript', '')
            else:
                print(f"Deepgram Error: {response.text}")
                return "Error transcribing audio"
        except Exception as e:
            print(f"Deepgram Exception: {e}")
            return "Error transcribing audio"
    return "Error transcribing audio"

async def synthesize_speech(text: str) -> bytes:
    """Real ElevenLabs TTS Synthesis."""
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your-elevenlabs-api-key":
        return b"dummy_audio_bytes_representing_" + text.encode()
        
    url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" # Rachel voice ID
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return response.content
            else:
                print(f"ElevenLabs Error: {response.text}")
                return b""
        except Exception as e:
            print(f"ElevenLabs Exception: {e}")
            return b""
    return b""

# --- Mock CRM Middleware Integration ---
from pydantic import BaseModel

class CRMRecord(BaseModel):
    customer_id: str
    intent: str
    notes: str

@app.post("/api/crm/salesforce/ticket")
async def create_salesforce_ticket(record: CRMRecord):
    """Mock Salesforce API for creating a case/ticket."""
    print(f"[Salesforce CRM] Creating case for {record.customer_id}: {record.intent}")
    return {"status": "success", "crm_id": "SF-98765", "message": "Ticket created in mock Salesforce"}

@app.post("/api/crm/zendesk/log_call")
async def log_zendesk_call(record: CRMRecord):
    """Mock Zendesk API for logging a voice call interaction."""
    print(f"[Zendesk CRM] Logging call for {record.customer_id}: {record.notes}")
    return {"status": "success", "ticket_id": "ZD-12345", "message": "Call logged in mock Zendesk"}
# ---------------------------------------

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected for STT -> LLM -> TTS pipeline")
    
    try:
        while True:
            # 1. Receive audio (or text) from client
            # The dashboard might send text for testing, or raw bytes when recording
            message = await websocket.receive()
            start_time = time.perf_counter()
            
            if "bytes" in message:
                audio_data = message["bytes"]
                print("Received audio bytes for STT")
                transcribed_text = await deepgram_stt(audio_data)
            else:
                transcribed_text = message.get("text", "")
                print(f"Received text input: {transcribed_text}")
                
            if not transcribed_text:
                continue
                
            # 3. Reasoning (Gemini 2.0 Flash)
            llm_response = await process_with_llm(transcribed_text)
            print(f"LLM Response: {llm_response}")
            
            # 4. TTS (ElevenLabs / Cartesia)
            audio_bytes = await synthesize_speech(llm_response)
            
            # Calculate and log Time to First Byte (TTFB) targeting < 300ms
            ttfb = (time.perf_counter() - start_time) * 1000
            print(f"TTFB: {ttfb:.2f}ms")
            
            # 5. Send back to client
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8') if audio_bytes else ""
            await websocket.send_json({
                "type": "response",
                "text": llm_response,
                "ttfb_ms": round(ttfb, 2),
                "audio": audio_b64
            })
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
