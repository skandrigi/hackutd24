from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
import random
import asyncio

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

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            while True:
                data = await websocket.receive()

                if isinstance(data, str):  # angle and distance
                    try:
                        json_data = json.loads(data)
                        if json_data.get("type") == "triangulation":
                            angle = json_data["angle"]
                            distance = json_data["distance"]
                            print(
                                f"Received triangulation data: Angle={angle}, Distance={distance}"
                            )
                    except json.JSONDecodeError:
                        print("Invalid JSON message received.")

                elif isinstance(data, bytes):  # audio data (raw binary)
                    audio_data = data
                    print(f"Received binary audio data of size {len(audio_data)}")
                    await websocket.send_bytes(
                        audio_data
                    )  # Send the received binary data back to the client

                # Send random location data
                angle = random.randint(0, 360)  # Generate a random angle for the chunk
                await websocket.send_json({"angle": angle})
                timeout = random.randint(1, 5)  # Generate a random timeout for the chunk
                await asyncio.sleep(timeout)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected")
