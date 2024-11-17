#include <Arduino.h>

// Mic pins and trigger values
#define TRIGGERVALUE 2000
#define AB in meters
#define AC
#define BC
#define MAXTIME 20000
#define DELAYTIME 20000

int micA = 36;
int micB = 39;
int micC = 34;

bool micA_trigger = false;
bool micB_trigger = false;
bool micC_trigger = false;

unsigned long micA_timestamp, micB_timestamp, micC_timestamp;

struct Origin {
  double angle;
  double distance;
};

Origin ori = {0, 0};

Origin calculate() {
  double r_1 = (-2 * AB*AB*AB + AB*AB* (BC + AC) - 
                 sqrt(3) * sqrt(-((AB - BC) * (AB - BC) - AC * AC) * 
                                 ((AB - AC) * (AB - AC) - AC * AC) * 
                                 ((BC - AC) * (BC - AC) - AC * AC)) - 
                 (BC + AC) * (2 * BC * BC - 3 * BC * AC + 2 * AC * AC - AC * AC) + 
                 AB * (BC*BC + AC*AC + AC*AC)) / 
                 (4 * (AB*AB + BC*BC - BC*AC + AC*AC - AB*(BC + AC)) - 
                 3 * AC*AC);
  
  double r_2 = (-2 * AB*AB*AB + AB*AB*(BC + AC) + 
                 sqrt(3) * sqrt(-((AB - BC) * (AB - BC) - AC * AC) * 
                                 ((AB - AC) * (AB - AC) - AC * AC) * 
                                 ((BC - AC) * (BC - AC) - AC * AC)) - 
                 (BC + AC) * (2 * BC*BC - 3*BC*AC + 2*AC*AC - AC*AC) + 
                 AB * (BC*BC + AC*AC + AC*AC)) / 
                 (4 * (AB*AB + BC*BC - BC*AC + AC*AC - AB*(BC + AC)) - 
                 3*AC*AC);

  if (r_1 == 0 && r_2 == 0) {
    Serial.println("error");
    return Origin{-1, -1};  // Error case if no valid solution
  }

  double x, y;
  if (r_1 >= r_2) {
    x = (i_1 + i_2 + 2 * BC * (2 * AC * AC * AC - 3 * AC * AC + i_3) - 
         2 * AB * (i_4 + i_3)) / i_5;
    y = (6 * BC * BC * BC * (AB - AC) + 2 * AB * i_3 + 2 * BC * i_3 - 4 * AC * i_3 - 
         3 * (AB - AC) * (AB + AC) * (2 * (AB - AC) * AC + AC * AC)) / i_7;
  } else {
    x = (i_1 + i_2 + 2 * AB * i_3 - 2 * AB * (i_4) - 2 * BC * (-2 * AC * AC + 3 * AC * AC + i_3)) / i_5;
    y = (6 * BC * BC * BC * (AB - AC) - 2 * AB * i_3 - 2 * BC * i_3 + 4 * AC * i_3 - 
         3 * (AB - AC) * (AB + AC) * (2 * (AB - AC) * AC + AC * AC)) / i_7;
  }

  double angle = atan2(y - AC / (2 * sqrt(3)), x - 0.5 * AC) * 180 / PI;
  if (angle < 0) {
    angle += 360;
  }
  double distance = sqrt((x - 0.5 * AC) * (x - 0.5 * AC) + (y - AC / (2 * sqrt(3))) * (y - AC / (2 * sqrt(3))));

  return Origin{angle, distance};
}



void triangulationSetup() {
  Serial.begin(9600);
  pinMode(micA, INPUT);
  pinMode(micB, INPUT);
  pinMode(micC, INPUT);
}

void triangulationLoop() {
  if (!micA_trigger && analogRead(micA) > TRIGGERVALUE && micros() > micA_timestamp + DELAYTIME) {
    micA_timestamp = micros();
    micA_trigger = true;
  }
  if (!micB_trigger && analogRead(micB) > TRIGGERVALUE && micros() > micB_timestamp + DELAYTIME) {
    micB_timestamp = micros();
    micB_trigger = true;
  }
  if (!micC_trigger && analogRead(micC) > TRIGGERVALUE && micros() > micC_timestamp + DELAYTIME) {
    micC_timestamp = micros();
    micC_trigger = true;
  }

if (micA_trigger && micB_trigger && micC_trigger) {
    ori = calculate(micA_timestamp - micB_timestamp, micB_timestamp - micC_timestamp, 0);
    
    Serial.println("Angle: " + String(ori.angle) + ", Distance: " + String(ori.distance));

    sendTriangulationData(ori.angle, ori.distance);

    micA_trigger = false;
    micB_trigger = false;
    micC_trigger = false;
}


  delay(15);  // Delay between calculations
}
