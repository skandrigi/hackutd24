#include <WiFi.h>
#include <WebSocketsClient.h>
#include <I2S.h>

const char* ssid = "";
const char* password = "";
const char* serverUrl = "";  

WebSocketsClient webSocket;

#define I2S_DATA_IN_PIN 34
#define I2S_CLOCK_PIN 14

void audioStreamingSetup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi!");

  webSocket.begin(serverUrl, 80);
  webSocket.onEvent(webSocketEvent);
  
  I2S.begin(I2S_PHILIPS_MODE, 16000, 16); // Initialize I2S with 16 kHz sample rate and 16-bit resolution
  I2S.setPins(I2S_DATA_IN_PIN, I2S_CLOCK_PIN, I2S_CLOCK_PIN);
}

void audioStreamingLoop() {
  webSocket.loop();  

  int16_t audioData[512];
  size_t bytesRead = I2S.read(audioData, sizeof(audioData));
  
  if (bytesRead > 0) {
    webSocket.sendBIN(audioData, bytesRead);
  }

  delay(10); // Delay to avoid high CPU usage
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
