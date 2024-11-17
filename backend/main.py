import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import threading

app = FastAPI()

# Allow all origins (for testing purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up the templates directory
templates = Jinja2Templates(directory="templates")

CHUNK_SIZE = 16000 * 5
RATE = 16000
CHANNELS = 1

model_size = "tiny.en"

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Client disconnected: {websocket.client}")

    async def send_personal_message(self, key: str, message: str, websocket: WebSocket):
        await websocket.send_json({key: message})

    async def broadcast(self, key: str, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_json({key: message})
            except WebSocketDisconnect:
                self.disconnect(connection)

manager = ConnectionManager()

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                angle = float(data)
                await manager.broadcast("angle", angle)
            except ValueError:
                print(f"Received invalid float: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected")

@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_running_loop()
    threading.Thread(target=send_audio, args=(loop,), daemon=True).start()

def send_audio(loop):
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    def audio_callback(indata, frames, time, status):
        if status:
            print(f"Sounddevice status: {status}")

        # Normalize the audio input and process it
        numpy_data = indata[:, 0].astype(np.float32)  # Use the first channel (mono)
        if np.max(np.abs(numpy_data)) == 0:
            return  # Avoid division by zero
        numpy_data = numpy_data / np.max(np.abs(numpy_data))

        # Transcribe the audio
        segments, info = model.transcribe(numpy_data, beam_size=5, language="en")
        for segment in segments:
            transcript = "%s" % (segment.text)
            print(transcript)

            # Schedule sending the transcript to all connected clients
            asyncio.run_coroutine_threadsafe(
                manager.broadcast("transcript", transcript), loop
            )

    try:
        with sd.InputStream(
            samplerate=RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=CHUNK_SIZE,
            callback=audio_callback,
        ):
            print("Listening...")
            while True:
                sd.sleep(1000)  # Keep the stream open
    except KeyboardInterrupt:
        print("Stopping...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
