# MNK Voice Agent Suite - Architecture Diagram

This document contains a visual representation of the MNK Voice Agent Suite architecture, specifically designed for your Devpost hackathon submission. You can view this diagram on GitHub, or copy-paste the Mermaid code block below into any supported Markdown renderer (like Notion, GitHub, or Mermaid Live Editor).

```mermaid
graph TD
    %% Styling definitions
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px;
    classDef middleware fill:#ffcb6b,stroke:#333,stroke-width:2px;
    classDef ai_service fill:#c3e88d,stroke:#333,stroke-width:2px;
    classDef google_cloud fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff;
    classDef database fill:#ff7eb3,stroke:#333,stroke-width:2px;

    %% 1. Clients & End Users
    subgraph "External Touchpoints"
        UserPhone(("📱 Caller (PSTN)")):::client
        UserBrowser(("💻 Web Browser")):::client
    end

    %% 2. Web Frontend / Management
    subgraph "Admin & Monitoring"
        NextDashboard["⚛️ Next.js Dashboard<br>(localhost:3000 / Vercel)"]:::frontend
    end

    %% 3. Core Orchestrator Backend
    subgraph "Core Infrastructure (Google Cloud Run)"
        FastAPI["⚡ FastAPI Middleware<br>(mnk-orchestrator)"]:::middleware
        WebSockets(("🔌 WebSocket<br>/ws/stream")):::middleware
        HTTP_Twilio(("🌐 REST Hooks<br>/api/twilio/...")):::middleware
        HTTP_CRM(("🌐 REST APIs<br>/api/crm/...")):::middleware

        %% Backend routing inside the Node
        FastAPI --> WebSockets
        FastAPI --> HTTP_Twilio
        FastAPI --> HTTP_CRM
    end

    %% 4. AI Ecosystem
    subgraph "AI Intelligence Layer"
        Deepgram["🗣️ Deepgram<br>(Speech-to-Text / Nova-2)"]:::ai_service
        Gemini["🧠 Google Gemini 2.0 Flash<br>(Vertex AI SDK)"]:::ai_service
        ElevenLabs["🎙️ ElevenLabs<br>(Text-to-Speech)"]:::ai_service
    end

    %% 5. Cloud Services & Data
    subgraph "Google Cloud Platform Services"
        SecretManager["🔐 Secret Manager<br>(API Keys)"]:::google_cloud
        AlloyDB[("🗄️ AlloyDB<br>(Conversation History)")]:::database
    end

    %% 6. Integrations (CRM & Telephony)
    subgraph "External Platforms"
        Twilio["📞 Twilio<br>(Media Streams API)"]
        CRM["💼 Mock CRMs<br>(Salesforce / Zendesk)"]
    end

    %% =============== 
    %% CONNECTIONS
    %% ===============

    %% User Interactions
    UserBrowser <-->|Web Interface| NextDashboard
    UserPhone <-->|Voice Call| Twilio

    %% Frontend to Backend
    NextDashboard -->|Settings & Metrics| FastAPI
    NextDashboard <-->|Web UI Audio Stream| WebSockets

    %% Twilio to Backend
    Twilio -->|Inbound Webhook| HTTP_Twilio
    Twilio <-->|Raw µ-law 8000Hz Audio| WebSockets

    %% Audio Processing Pipeline
    WebSockets --->|1. Raw Audio Streams| Deepgram
    Deepgram --->|2. Transcribed Text| FastAPI
    FastAPI --->|3. Intent / Context| Gemini
    Gemini --->|4. LLM Response| FastAPI
    FastAPI --->|5. Synthesize Request| ElevenLabs
    ElevenLabs --->|6. Audio Bytes| WebSockets
    
    %% Storage & Secrets
    FastAPI -.->|Reads Credentials| SecretManager
    FastAPI -.->|Logs Conversations| AlloyDB

    %% External Systems
    HTTP_CRM -.->|Creates Tickets| CRM
```

### Component Breakdown
1. **Frontend (Next.js)**: The React-based dashboard used by administrators to monitor active live calls, interact with the agent via the browser, and track real-time LLM consumption and costs.
2. **Middleware (FastAPI on Google Cloud Run)**: The low-latency central nervous system of the suite. It maintains WebSocket connections to stream bytes instantly without HTTP overhead.
3. **Twilio Media Streams**: Allows standard phone calls (PSTN) to bypass traditional UI paths, streaming raw 8kHz mu-law audio directly into the FastAPI websocket interface.
4. **AI Models**:
   - **Deepgram** transcribes the raw inbound audio in real-time.
   - **Gemini 2.0 Flash** processes the intent, reasons over the context, and generates the text reply.
   - **ElevenLabs** turns the text reply back into a highly emotive human voice audio stream.
5. **GCP Backend**: Scales effortlessly to zero when not in use, natively using **Secret Manager** to securely load external API keys at runtime, and **AlloyDB** to persist interactions.
