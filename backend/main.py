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
            # Wait for incoming message from ESP32
            data = await websocket.receive_text()
            try:
                # Parse the incoming JSON data
                received_data = json.loads(data)

                # Check the type of data (triangulation or audio transcription)
                if "angle" in received_data and "distance" in received_data:
                    # Handle triangulation data
                    angle = received_data["angle"]
                    distance = received_data["distance"]
                    print(f"Received triangulation data: Angle={angle}, Distance={distance}")

                    # Prepare the response JSON
                    location_data = {
                        "type": "location",
                        "angle": angle,
                        "distance": distance
                    }
                    location_json = json.dumps(location_data)

                    # Broadcast triangulation data to all clients
                    await manager.broadcast(location_json)

                elif "transcription" in received_data:
                    # Handle audio transcription data
                    transcription = received_data["transcription"]
                    print(f"Received transcription: {transcription}")

                    # Prepare the response JSON
                    transcription_data = {
                        "type": "transcription",
                        "text": transcription
                    }
                    transcription_json = json.dumps(transcription_data)

                    # Broadcast transcription data to all clients
                    await manager.broadcast(transcription_json)

            except json.JSONDecodeError:
                print("Received invalid JSON data")

            # Add a small delay for loop control
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected")