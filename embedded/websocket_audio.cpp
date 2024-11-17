#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

// Wi-Fi Info
const char *ssid = "";     // Manually set when we run
const char *password = ""; // Manually set when we run

// WebSocket server URL
const char *websocket_server = ""; // Manually set when we run

WebsocketsClient webSocket;

const int micPin = 36;         // ADC pin for the solo mic
const int samplingRate = 8000; // Target sampling rate (8kHz), might need to adjust

void connectToWiFi()
{
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to Wi-Fi...");
    }
    Serial.println("Connected to Wi-Fi");
}

void connectToWebSocket()
{
    if (webSocket.connect(websocket_server))
    {
        Serial.println("Connected to WebSocket server");
    }
    else
    {
        Serial.println("WebSocket connection failed");
    }
}

void audioSetup()
{
    Serial.begin(115200);

    // Connect to Wi-Fi
    connectToWiFi();

    // Connect to WebSocket server
    connectToWebSocket();
}

void audioLoop()
{
    static unsigned long lastSampleTime = 0;
    unsigned long currentTime = micros();

    // Maintain a consistent sampling rate
    if (currentTime - lastSampleTime >= (1000000 / samplingRate))
    {
        lastSampleTime = currentTime;

        // Read ADC value from microphone
        int micValue = analogRead(micPin);

        // Send a message to WebSocket server
        webSocket.send("Hello WebSocket!");

        // Send ADC value as raw audio data to WebSocket server
        webSocket.send(String(micValue));

        // Print value for debugging
        Serial.println(micValue);
    }

    // Keep WebSocket connection alive
    webSocket.poll();
}
