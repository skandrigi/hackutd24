import asyncio

CLIENT_ID = "audio_input"  
SERVER_URI = "ws://localhost:8000/ws"  
import websockets
import sounddevice as sd
import numpy as np
from queue import Queue
import openai
import io


# Initialize Whisper model
from openai import OpenAI
client = OpenAI()

# Queue to hold loudness values
audio_data = []
message_queue = Queue()

# Function to calculate loudness
def audio_callback(indata, frames, time, status):
    # Append audio data for transcription
    audio_data.append(indata.copy())

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

# Function to transcribe audio every 5 seconds
async def transcribe_audio():
    while True:
        await asyncio.sleep(5)
        if audio_data:
            audio_chunk = np.concatenate(audio_data, axis=0)
            audio_data.clear()

            temp_audio_file = "/tmp/audio_chunk.npy"
            np.save(temp_audio_file, audio_chunk)

            with open(temp_audio_file, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                print(f"Transcription: {transcription.text}")
async def websocket_client():
    try:
        async with websockets.connect(SERVER_URI) as websocket:
            print("Connected to WebSocket server")

            # Start the audio stream
            with sd.InputStream(callback=audio_callback, channels=1, samplerate=44100):
                print("Sending loudness data...")

                # Task to handle message sending and transcription
                sender_task = asyncio.create_task(send_loudness(websocket))

                transcriber_task = asyncio.create_task(transcribe_audio())

                try:
                    while True:
                        # Receive server commands or audio data
                        data = await websocket.recv()
                        if isinstance(data, str):
                            if data == "RECORD":
                                print("RECORD command received")
                            elif data == "WAIT":
                                print("WAIT command received")
                        elif isinstance(data, bytes):
                            print(f"Received audio data of size {len(data)}")
                            # Process the audio data as needed
                except websockets.exceptions.ConnectionClosed:
                    print("WebSocket connection closed by the server")
                finally:
                    transcriber_task.cancel()
                    sender_task.cancel()

    except websockets.exceptions.InvalidStatusCode as e:
        print(f"Could not connect to WebSocket server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

# Run the client
asyncio.run(websocket_client())
