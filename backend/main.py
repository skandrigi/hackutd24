from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
import asyncio

app = FastAPI()

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive()

            if data["type"] == "text":  # angle and distance
                message = data["text"]
                try:
                    json_data = json.loads(message)
                    if json_data.get("type") == "triangulation":
                        angle = json_data["angle"]
                        distance = json_data["distance"]
                        print(f"Received triangulation data: Angle={angle}, Distance={distance}")
                except json.JSONDecodeError:
                    print("Invalid JSON message received.")
                
            elif data["type"] == "binary":  # audio data (raw binary)
                audio_data = data["bytes"]
                print(f"Received binary audio data of size {len(audio_data)}")
                await websocket.send_bytes(audio_data)  # Send the received binary data back to the client

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected")