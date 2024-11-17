#include <Arduino.h>
#include "audio_streaming.cpp"
#include "triangulation.cpp"

void setup() {
  // Initialize both audio streaming and triangulation
  audioStreamingSetup(); 
  triangulationSetup(); 
}

void loop() {
  audioStreamingLoop();
  triangulationLoop();
}
