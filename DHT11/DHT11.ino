#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

//dht connfigration
#include <DHT.h>

// Define DHT11 pin and type
#define DHTPIN 5     // Data pin connected to DHT11
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

//TLS Connfigration
#include <Time.h>
#include <TZ.h>
#include <LittleFS.h>
#include <CertStoreBearSSL.h>


//WiFi Connfigration
const char *ssid = "DESKTOP-B1OGNGK 8563";
const char *pass = "97@3Vc86";

//MQTT Configration
const char* MQTT_Server = "805cbd81a3a94169829feb28a5458e8f.s2.eu.hivemq.cloud";
const char* MQTT_Username = "abdallah";
const char* MQTT_Password = "Abdo123#";
const char* MQTT_ClientId = "Device0001";
const int MQTT_Port = 8883;

//MQTT topics
const char* publishTopic = "publishedData";
const char* subscribeTopic = "requestedData";


BearSSL::CertStore certStore;
WiFiClientSecure espClient;
void callback(char* type,byte* payload,unsigned int length);
PubSubClient *mqtt_client;

//Wifi connection function
void wifiSetup(){

  WiFi.begin(ssid,pass);

  while(WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(200);
  }

  Serial.println("Connected to WiFi");
  Serial.println(WiFi.SSID());
  Serial.println(WiFi.localIP());

}

void setup() {
  Serial.begin(115200); // Start serial communication
  Serial.println("DHT11 Sensor Initialization...");
  dht.begin(); // Initialize DHT sensor

  wifiSetup();

  //TLS init
  LittleFS.begin();
  Serial.println("\n\nWelcome to IOT home Weather\n");
  setDateTime();

  int numCerts = certStore.initCertStore(LittleFS,PSTR("/certs.idx"),PSTR("/certs.ar"));

   Serial.printf("Number of CA certs read: %d\n", numCerts);
  if (numCerts == 0)
  {
    Serial.printf("No certs found. Did you run certs-from-mozilla.py and upload the LittleFS directory before running?\n");
    return; // Can't connect to anything w/o certs!
  }

  BearSSL::WiFiClientSecure *bear = new BearSSL::WiFiClientSecure();
  bear->setCertStore(&certStore);

  mqtt_client = new PubSubClient(*bear);
  mqtt_client->setServer(MQTT_Server,MQTT_Port);
  mqtt_client->setCallback(Callback);

  mqtt_connect();

}

void loop() {
 // put your main code here, to run repeatedly:
  delay(2500);

  if (!mqtt_client->loop())
    mqtt_connect();

  delay(2000);
  
  // Read humidity and temperature
  float humidity = dht.readHumidity();
  float temperatureC = dht.readTemperature();
  float temperatureF = dht.readTemperature(true);

  // Check if any readings failed
  if (isnan(humidity) || isnan(temperatureC) || isnan(temperatureF)) {
    Serial.println("Failed to read from DHT sensor!");
  delay(2000);

    return;
  }

  // Print values to Serial Monitor
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");

  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.print(" °C / ");
  Serial.print(temperatureF);
  Serial.println(" °F");

  // Wait 2 seconds between readings
  delay(2000);

  //Humidity_Data
  String pkt = "{";
  pkt +="\"Humidity_data\":";
  pkt += ""+String(humidity)+"";
  pkt += "}";

  //mqtt_publish((char*) pkt.c_str());

  //TemperatureC Data 
  String pktTempC = "{";
  pktTempC += "\"TempratureC_Data\":";
  pktTempC += ""+String(temperatureC)+"";
  pktTempC += "}";

  //mqtt_publish((char*) pktTempC.c_str());


    //TemperatureF Data 
  String pktTempF = "{";
  pktTempF += "\"TempratureF_Data\":";
  pktTempF += ""+String(temperatureF)+"";
  pktTempF += "}";

  //mqtt_publish((char*) pktTempF.c_str());

  //All Data
  String allPkt = "{";
  allPkt += "\"temperaturecelsius\":";
  allPkt += ""+String(temperatureC)+",";
  allPkt += "\"temperaturefahrenheit\":";
  allPkt += ""+String(temperatureF)+",";
  allPkt +="\"humidity\":";
  allPkt += ""+String(humidity)+"";
  allPkt += "}";

  mqtt_publish((char*) allPkt.c_str());
}


void setDateTime(){
  // You can use your own timezone, but the exact time is not used at all.
  // Only the date is needed for validating the certificates.
  configTime(TZ_Europe_Berlin, "pool.ntp.org", "time.nist.gov");

  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2)
  {
    delay(100);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println();

  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.printf("%s %s", tzname[0], asctime(&timeinfo));
}


void mqtt_connect()
{
  // Loop until we're reconnected
  while (!mqtt_client->connected())
  {
    Serial.println("\nAttempting MQTT connection...");

    Serial.println("Reconnecting MQTT client to : " + String(MQTT_Server) + ":" + String(MQTT_Port));
    Serial.println("mqtt_clientId : " + String(MQTT_ClientId));
    Serial.println("mqtt_user : " + String(MQTT_Username));
    Serial.println("mqtt_password : " + String(MQTT_Password));
    // Attempt to connect
    if (mqtt_client->connect(MQTT_ClientId, MQTT_Username, MQTT_Password))
    {
      Serial.println("MQTT Client Connected");
      // Subscribe
      mqtt_subscribe(subscribeTopic);
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqtt_client->state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void mqtt_publish(char *data)
{
  mqtt_connect();
  Serial.println("Publish Topic: \"" + String(publishTopic) + "\"");
  if (mqtt_client->publish(publishTopic, data))
    Serial.println("Publish \"" + String(data) + "\" ok");
  else
    Serial.println("Publish \"" + String(data) + "\" failed");
}


void mqtt_subscribe(const char *topic)
{
  if (mqtt_client->subscribe(topic))
    Serial.println("Subscribe \"" + String(topic) + "\" ok");
  else
    Serial.println("Subscribe \"" + String(topic) + "\" failed");
}


void Callback(char* topic,byte* payload , unsigned int length){
    String command;
    Serial.print("\n\nMessage arrived [");
    Serial.print(topic);
    Serial.print("] ");

    for(int i=0;i<length;i++){
      command += (char)payload[i];
    Serial.println((char)payload[i]);
      }
    
    if (command.length() > 0){
    Serial.println("\nCMD receive is : " + command);
    }
     DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, command);
    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.f_str());
        return; // Exit early if JSON is invalid
    }
    JsonObject obj = doc.as<JsonObject>();
    // 3. Extract the value
    String value = obj["value"].as<String>();
    
    Serial.print("Parsed JSON object: ");
    serializeJson(obj, Serial); // Correct way to print JSON objects
    Serial.println();
    
    Serial.print("Extracted Value: ");
    Serial.println(value);
}
