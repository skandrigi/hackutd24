# Tritone 🎧

Tritone is an innovative IoT system designed to enhance auditory accessibility for individuals with hearing impairments. This application leverages embedded hardware and web technologies to process and visualize audio, enabling users to focus on nearby or distant sounds with ease. Its intuitive interface provides real-time transcription and visual indicators of sound directionality and intensity.

Tritone bridges the gap between sound amplification and intelligent sound processing, offering a reliable and accessible solution for improving auditory experiences.

---

## Features

- **🌍 Mode Switching**: Toggle between Nearby Mode (amplify close sounds) and Long-Distance Mode (focus on distant sounds).
- **🎙️ Multi-Source Audio Capture**: Utilizes three embedded microphones or computer microphones as a fallback for seamless sound input.
- **⚡ Real-Time Audio Streaming**: Streams audio data via WebSocket connections with low latency for immediate processing.
- **📝 Live Transcription**: Provides accurate, real-time transcription of detected audio.
- **📊 Sound Visualizer**: Displays sound directionality and intensity using an intuitive visual interface.
- **🔄 Fallback System**: Ensures high-quality audio input by switching to computer microphones when embedded hardware quality is suboptimal.

---

## Getting Started

### Prerequisites

- **ESP32 microcontroller** with microphone integration for embedded hardware setup.
- **Python 3.8 or later** for backend and frontend components.
- **WebSocket support** for real-time audio data streaming.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/skandrigi/hackutd24.git
   cd hackutd
   ```
