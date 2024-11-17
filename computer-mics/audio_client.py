import asyncio
import websockets
import sounddevice as sd
import numpy as np
from queue import Queue


# Queue to hold loudness values
message_queue = Queue()

# Function to calculate loudness
def audio_callback(indata, frames, time, status):
    # Calculate RMS loudness
    volume_norm = np.linalg.norm(indata) * 10
    message = f"{CLIENT_ID}:{volume_norm}"
    message_queue.put(message)  # Add the message to the queue

# Function to process the queue and send messages
async def send_loudness(websocket):
    while True:
        try:
            # Wait for messages to send
            message = message_queue.get()
            await websocket.send(message)
        except Exception as e:
            print(f"Error sending message: {e}")
            break

# Main WebSocket client function
async def websocket_client():
    try:
        async with websockets.connect(SERVER_URI) as websocket:
            print("Connected to WebSocket server")

            # Start the audio stream
            with sd.InputStream(callback=audio_callback, channels=1, samplerate=44100):
                print("Sending loudness data...")

                # Task to handle message sending
                sender_task = asyncio.create_task(send_loudness(websocket))

                try:
                    while True:
                        # Receive server commands
                        command = await websocket.recv()
                        if command == "RECORD":
                            print("RECORD command received")
                        elif command == "WAIT":
                            print("WAIT command received")
                except websockets.exceptions.ConnectionClosed:
                    print("WebSocket connection closed by the server")
                finally:
                    sender_task.cancel()

    except websockets.exceptions.InvalidStatusCode as e:
        print(f"Could not connect to WebSocket server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

# Run the client
asyncio.run(websocket_client())
