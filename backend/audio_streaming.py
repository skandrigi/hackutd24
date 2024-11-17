import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel

CHUNK_SIZE = 16000 * 5
RATE = 16000
CHANNELS = 1

model_size = "tiny.en"

def audio_callback(indata, frames, time, status):
    if status:
        print(f"Sounddevice status: {status}")
    global model

    # Normalize the audio input and process it
    numpy_data = indata[:, 0].astype(np.float32)  # Use the first channel (mono)
    numpy_data = numpy_data / np.max(np.abs(numpy_data))

    # Transcribe the audio
    segments, info = model.transcribe(numpy_data, beam_size=5, language="en")
    for segment in segments:
        print(
            "[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text)
        )

def send_audio():
    global model
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    try:
        with sd.InputStream(
            samplerate=RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=CHUNK_SIZE,
            callback=audio_callback,
        ):
            print("Listening...")
            input()  # Keep the script running
    except KeyboardInterrupt:
        print("Stopping...")

if __name__ == "__main__":
    send_audio()