#include <WebSocketsClient.h>

WebSocketsClient webSocket;

// from `audio_streaming.cpp`
void audioStreamingSetup();
void audioStreamingLoop();

// from `triangulation.cpp`
void triangulationSetup();
void triangulationLoop();
void sendTriangulationData(double angle, double distance);

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length);

void sendTranscriptionData(String transcription);

void setup() {
    Serial.begin(9600);

    audioStreamingSetup();
    triangulationSetup();
}

void loop() {
    webSocket.loop();
    audioStreamingLoop();
    triangulationLoop();
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("Disconnected from WebSocket server.");
            break;
        case WStype_CONNECTED:
            Serial.println("Connected to WebSocket server.");
            break;
        case WStype_TEXT:
            Serial.printf("Message from server: %s\n", payload);
            break;
        case WStype_BIN:
            break;
        default:
            break;
    }
}

void sendTriangulationData(double angle, double distance) {
    String message = "{\"type\": \"triangulation\", \"angle\": " + String(angle) + ", \"distance\": " + String(distance) + "}";
    webSocket.sendTXT(message);
}

void sendTranscriptionData(String transcription) {
    String message = "{\"type\": \"transcription\", \"text\": \"" + transcription + "\"}";
    webSocket.sendTXT(message);
}
