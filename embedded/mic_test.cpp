const int micPin = 36; // ADC1_0 (GPIO36)

void setup() {
    Serial.begin(115200); // Serial communication baud rate
}

void loop() {
    int micValue = analogRead(micPin); 
    Serial.println(micValue);    
    delay(10);
}
