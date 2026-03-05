# MNK Voice Agent Suite

AI Customer Engagement Suite | March 2026

Unifying High-Speed Conversational AI with Enterprise-Grade Automation.

## Overview
MNK Voice Agent is an end-to-end AI platform designed to automate high-volume customer interactions across voice and digital channels. By combining proprietary orchestration with the Gemini 2.0 Flash ecosystem, MNK allows enterprises to resolve up to 80% of common queries autonomously while maintaining a human-like, low-latency experience.
<img width="1680" height="971" alt="image" src="https://github.com/user-attachments/assets/f9eed1b9-466d-46e7-b287-880a08555526" />

## Technical Architecture
The suite is built on a Google Cloud Serverless foundation, ensuring infinite scalability and "Scale-to-Zero" cost efficiency.

*   **Ingestion**: Google Cloud Run / SIP Trunk
*   **Transcription**: Deepgram / Whisper v3
*   **Reasoning**: Gemini 2.0 Flash (Multimodal Live API via Google GenAI SDK)
*   **Synthesis**: ElevenLabs / Cartesia
*   **Monitoring**: MNK Latency Middleware (Target < 300ms V2V)

## Project Structure
- **/dashboard** - Next.js 15 React Dashboard tracking real-time analytics, cost, and Agent states.
- **/middleware** - FastAPI orchestrator managing the WebSocket STT -> LLM -> TTS pipeline.
- **/terraform** - Infrastructure-as-code configuration for Cloud Run, AlloyDB, and Secret Manager.

## Getting Started

### Dashboard (Frontend)
```bash
cd dashboard
npm install
npm run dev
```

### Middleware (Backend)
```bash
cd middleware
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
**Env Requirements:** `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY`, `GOOGLE_CLOUD_PROJECT`

## Benchmarks
| Metric | MNK Target |
| :--- | :--- |
| Latency (V2V) | <300ms |
| Intent Accuracy | 96% |
| Self-Service Rate | 75%+ |
