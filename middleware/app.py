import os
import time
import json
import asyncio
import base64
import httpx
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from google import genai
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream

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
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

from google.auth import default as get_default_credentials

# Initialize Vertex AI
if GOOGLE_CLOUD_PROJECT:
    # Explicitly load ADC credentials for the Live API Client
    try:
        credentials, project_id = get_default_credentials()
        live_client = genai.Client(
            vertexai=True, 
            project=GOOGLE_CLOUD_PROJECT, 
            location=GOOGLE_CLOUD_REGION,
            credentials=credentials
        )
        print("Gemini Live API Client Initialized using Explicit Credentials")
    except Exception as e:
        print(f"Failed to initialize explicit credentials: {e}")
        live_client = genai.Client(vertexai=True, project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_REGION)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

import logging
import sys

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

async def process_with_llm(text: str) -> str:
    """Real intent recognition and generation with Gemini 2.0 Multimodal Live API."""
    if not GOOGLE_CLOUD_PROJECT:
        # Fallback for local testing without GCP credentials
        return f"Echo from LLM: {text}"
    
    try:
        # Utilizing the Gemini Multimodal Live API via WebSockets to meet Hackathon requirements
        # Note: We must explicitly request TEXT modality because the Multimodal Live API defaults to native AUDIO
        async with live_client.aio.live.connect(
            model="gemini-2.0-flash-live-preview-04-09",
            config={"response_modalities": ["TEXT"]}
        ) as session:
            await session.send(input=f"You are the MNK Voice Agent. Respond concisely and professionally to the user: {text}", end_of_turn=True)
            
            full_response = ""
            async for response in session.receive():
                # Extract text chunks as they stream in over the Live API websocket
                server_content = getattr(response, 'server_content', None)
                if server_content and getattr(server_content, 'model_turn', None):
                    for part in server_content.model_turn.parts:
                        if part.text:
                            full_response += part.text
                
                # Check for the end of the Live API turn
                if server_content and getattr(server_content, 'turn_complete', False):
                    break
                    
            return full_response if full_response else "I'm sorry, I couldn't generate a response."
    except Exception as e:
        logger.error(f"FATAL LLM EXCEPTION CAUGHT: {str(e)}", exc_info=True)
        return f"CRASH: {str(e)}"

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

# --- Phase 5: Twilio Telephony Integration ---
@app.post("/api/twilio/incoming")
async def twilio_incoming():
    """Builds TwiML to connect an inbound phone call to our WebSocket."""
    response = VoiceResponse()
    response.say("Welcome back to the MNK Voice Agent Suite. Please say something.")
    
    connect = Connect()
    connect.stream(url='wss://your-ngrok-or-cloudrun-url.com/ws/stream') 
    response.append(connect)
    
    return str(response)

class OutboundCallRequest(BaseModel):
    to_phone_number: str

@app.post("/api/twilio/outbound")
async def twilio_outbound(req: OutboundCallRequest):
    """Triggers an outbound call using the Twilio REST API."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return {"error": "Missing Twilio Credentials in .env"}

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    # We use TwiML bins or a public URL to host the instructions for the call
    # For now, we will construct inline TwiML that connects to the Web Socket
    twiml = f"""
    <Response>
        <Say>Hi, this is the MNK Voice Agent calling you.</Say>
        <Connect>
            <Stream url="wss://your-ngrok-or-cloudrun-url.com/ws/stream" />
        </Connect>
    </Response>
    """
    
    try:
        call = client.calls.create(
            twiml=twiml,
            to=req.to_phone_number,
            from_=TWILIO_PHONE_NUMBER
        )
        return {"status": "success", "call_sid": call.sid}
    except Exception as e:
        return {"error": str(e)}
# ---------------------------------------------

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
                raw_text = message.get("text", "")
                if raw_text.startswith("{"):
                    try:
                        import json
                        parsed = json.loads(raw_text)
                        transcribed_text = parsed.get("text", raw_text)
                    except:
                        transcribed_text = raw_text
                else:
                    transcribed_text = raw_text
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
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket FATAL error: {e}", exc_info=True)
