#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
const char* serverUrl = "http://your-server-ip:3000/api/drone-alert";

const String droneId = "DRONE_001";

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);

  Serial.print("连接WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("已连接!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    if (detectFraudActivity()) {
      sendFraudAlert();
    }
  }
  delay(5000);
}

bool detectFraudActivity() {
  return random(0, 10) > 8;
}

void sendFraudAlert() {
  HTTPClient http;

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "Drone-AntiFraud/1.0/" + droneId);

  StaticJsonDocument<1024> doc;

  doc["droneId"] = droneId;
  doc["fraudType"] = "冒充客服";
  doc["phone"] = "13800138000";
  doc["amount"] = "5000";
  doc["time"] = millis();
  doc["description"] = "无人机检测到可疑活动";
  doc["location"]["latitude"] = 39.9042;
  doc["location"]["longitude"] = 116.4074;
  doc["altitude"] = 120;
  doc["sensors"]["temperature"] = 28;
  doc["sensors"]["humidity"] = 65;
  doc["timestamp"] = millis();
  doc["detectionConfidence"] = 0.92;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP响应代码: " + String(httpResponseCode));
    Serial.println("响应内容: " + response);

    DynamicJsonDocument responseDoc(1024);
    deserializeJson(responseDoc, response);

    bool success = responseDoc["success"];
    if (success) {
      String reportId = responseDoc["reportId"];
      Serial.println("数据提交成功! 报告ID: " + reportId);
    }
  } else {
    Serial.println("请求失败,错误代码: " + String(httpResponseCode));
  }

  http.end();
}
