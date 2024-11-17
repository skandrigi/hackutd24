#include <WiFi.h>
#include <WebSocketsClient.h>
#include "WebSocketsClient.h"

// Declare function prototypes for audio and triangulation functions
void audioStreamingSetup();
void audioStreamingLoop();
void triangulationSetup();
void triangulationLoop();
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length);

WebSocketsClient webSocket;

void setup() {
    Serial.begin(9600);
    audioSetup(); 
    triangulationSetup(); 
}

void loop() {
    webSocket.loop(); 
    audioLoop(); 
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
