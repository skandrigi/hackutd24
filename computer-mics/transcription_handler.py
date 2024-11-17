# import asyncio
# import websockets
# import sounddevice as sd
# import queue
# import numpy as np
# import speech_recognition as sr

# # WebSocket server URI
# SERVER_URI = "ws://localhost:12345"
# CLIENT_ID = "Laptop1"

# # Queue to hold audio chunks
# audio_queue = queue.Queue()

# # Function to continuously capture audio
# def audio_callback(indata, frames, time, status):
#     audio_queue.put(indata.copy())

# async def transcribe_audio(websocket):
#     recognizer = sr.Recognizer()
#     audio_data = np.array([])

#     while True:
#         try:
#             # Fetch audio chunks from the queue
#             while not audio_queue.empty():
#                 chunk = audio_queue.get()
#                 audio_data = np.append(audio_data, chunk)

#             # Transcribe when we have enough data
#             if len(audio_data) > 16000:  # Example: 1 second of audio at 16kHz
#                 # Convert the audio buffer into recognizer's AudioData format
#                 audio_sample = sr.AudioData(
#                     audio_data.tobytes(), sample_rate=16000, sample_width=2
#                 )
#                 try:
#                     transcript = recognizer.recognize_google(audio_sample)
#                     print(f"Transcript: {transcript}")
#                     # Send transcript back to WebSocket server
#                     await websocket.send(f"{CLIENT_ID}:TRANSCRIPT:{transcript}")
#                 except sr.UnknownValueError:
#                     print("Could not understand the audio")
#                 except sr.RequestError as e:
#                     print(f"Error with transcription service: {e}")

#                 # Clear the buffer after transcription
#                 audio_data = np.array([])

#             # Pause briefly to allow new audio to accumulate
#             await asyncio.sleep(0.1)

#         except Exception as e:
#             print(f"Error during transcription: {e}")
#             break

# async def handle_transcription():
#     async with websockets.connect(SERVER_URI) as websocket:
#         print("Connected to WebSocket server for transcription")

#         # Start the audio stream
#         with sd.InputStream(
#             callback=audio_callback, channels=1, samplerate=16000, dtype="int16"
#         ):
#             print("Listening for audio...")
#             await transcribe_audio(websocket)

# # Run the transcription handler
# try:
#     asyncio.run(handle_transcription())
# except KeyboardInterrupt:
#     print("Transcription handler stopped by user")

import asyncio
import websockets
import sounddevice as sd
import queue
import numpy as np
import speech_recognition as sr

# WebSocket server URI
SERVER_URI = "ws://localhost:12345"
CLIENT_ID = "Laptop1"

# Queue to hold audio chunks
audio_queue = queue.Queue()

# Function to continuously capture audio
def audio_callback(indata, frames, time, status):
    # Add audio data to the queue
    audio_queue.put(indata.copy())
    # Debugging: Print audio levels
    print(f"Audio levels: {np.linalg.norm(indata)}")

async def transcribe_audio(websocket):
    recognizer = sr.Recognizer()
    audio_data = np.array([])

    while True:
        try:
            # Fetch audio chunks from the queue
            while not audio_queue.empty():
                chunk = audio_queue.get()
                audio_data = np.append(audio_data, chunk)

            # Transcribe when we have enough data
            if len(audio_data) > 16000:  # Example: 1 second of audio at 16kHz
                print(f"Captured audio data size: {len(audio_data)}")
                # Convert the buffer into recognizer's AudioData format
                audio_sample = sr.AudioData(
                    audio_data.tobytes(), sample_rate=16000, sample_width=2
                )
                try:
                    transcript = recognizer.recognize_google(audio_sample)
                    print(f"Transcript: {transcript}")
                    # Send transcript back to WebSocket server
                    await websocket.send(f"{CLIENT_ID}:TRANSCRIPT:{transcript}")
                except sr.UnknownValueError:
                    print("Google Speech Recognition could not understand the audio")
                except sr.RequestError as e:
                    print(f"Error with transcription service: {e}")

                # Clear the buffer after transcription
                audio_data = np.array([])

            # Allow other tasks to run
            await asyncio.sleep(0.1)

        except Exception as e:
            print(f"Error during transcription: {e}")
            break

async def handle_transcription():
    async with websockets.connect(SERVER_URI) as websocket:
        print("Connected to WebSocket server for transcription")

        # Start the audio stream
        with sd.InputStream(
            callback=audio_callback, channels=1, samplerate=16000, dtype="int16"
        ):
            print("Listening for audio...")
            await transcribe_audio(websocket)

# Run the transcription handler
if __name__ == "__main__":
    try:
        asyncio.run(handle_transcription())
    except KeyboardInterrupt:
        print("Transcription handler stopped by user")
