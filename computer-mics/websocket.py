import asyncio
import websockets

# Store connected clients
connected_clients = {}

async def handler(websocket):
    try:
        # Register the client with default values
        connected_clients[websocket] = ("", 0)  # Tuple: (client_id, loudness)
        print("Client connected")

        async for message in websocket:
            # Parse the received message
            client_id, loudness = message.split(":")
            loudness = float(loudness)
            connected_clients[websocket] = (client_id, loudness)
            print(f"Received from {client_id}: Loudness = {loudness}")

            # Determine the client with the highest loudness
            selected_client = max(
                connected_clients, key=lambda ws: connected_clients[ws][1]
            )
            if websocket == selected_client:
                await websocket.send("RECORD")  # Notify this client to record
            else:
                await websocket.send("WAIT")  # Notify other clients to wait

    except websockets.exceptions.ConnectionClosedError:
        print("Client disconnected")
        if websocket in connected_clients:
            del connected_clients[websocket]  # Remove disconnected client
    except Exception as e:
        print(f"Unexpected error: {e}")
        if websocket in connected_clients:
            del connected_clients[websocket]

async def main():
    print("Starting WebSocket server...")
    server = await websockets.serve(handler, "localhost", 12345)
    await server.wait_closed()

# Run the server
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("WebSocket server stopped by user")
