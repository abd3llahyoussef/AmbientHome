# 🏠 AmbientHome

**AmbientHome** is an end-to-end IoT home climate monitoring system. It reads real-time temperature and humidity data from a **DHT11 sensor** using an **ESP8266 microcontroller**, securely transmits telemetry over **TLS-encrypted MQTT** to **HiveMQ Cloud**, persists historical readings in a **PostgreSQL** database via a **Node.js/TypeScript backend**, and streams live updates over **WebSockets** to a modern **React + Vite dashboard**.

---

## 📐 System Architecture & Data Flow

```
                     ┌────────────────────────┐
                     │   DHT11 Climate Sensor │
                     └───────────┬────────────┘
                                 │ (GPIO 5 / D1)
                                 ▼
                     ┌────────────────────────┐
                     │ ESP8266 Microcontroller│
                     │  (BearSSL TLS / MQTT)  │
                     └───────────┬────────────┘
                                 │ MQTTS (Port 8883)
                                 ▼
                     ┌────────────────────────┐
                     │     HiveMQ Cloud       │
                     │     (MQTT Broker)      │
                     └───────────┬────────────┘
                                 │ MQTT Subscribe ("publishedData")
                                 ▼
                     ┌────────────────────────┐
                     │ Node.js Backend Server │
                     │  (Express + WS + PG)   │
                     └─────┬────────────┬─────┘
    INSERT INTO iot_data   │            │ WebSocket Broadcast (ws://localhost:8080)
                           ▼            ▼
               ┌───────────────┐    ┌─────────────────────────────────┐
               │  PostgreSQL   │    │     React 19 Frontend           │
               │   Database    │    │  (Live Chart.js Visualization)  │
               └───────────────┘    └─────────────────────────────────┘
```

---

## 🌟 Key Features

- 🌡️ **Dual Unit Temperature Monitoring**: Live tracking of temperature in both Celsius (°C) and Fahrenheit (°F).
- 💧 **Relative Humidity Tracking**: Real-time relative humidity percentage (% RH) collection.
- 🔒 **Secure Hardware Communication**: Embedded ESP8266 firmware with **BearSSL TLS** certificate validation uploading data securely via MQTT over port 8883.
- ⚡ **Real-Time Data Streaming**: Instant update pipeline using WebSockets for ultra-low latency dashboard rendering without browser polling.
- 🗄️ **Persistent Telemetry Logging**: Node.js backend writes all incoming telemetry into a PostgreSQL relational database table (`iot_data`).
- 📊 **Dynamic Time-Series Visualization**: React 19 dashboard built with Chart.js, rendering smooth rolling multi-metric charts (Celsius, Fahrenheit, Humidity).

---

## 📁 Repository Structure

```
AmbientHome/
├── DHT11/                       # ESP8266 Firmware (Arduino / C++)
│   └── DHT11.ino                # Sketch for Wi-Fi, DHT11 reading & BearSSL MQTT client
├── dhtdashboard/                # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/          # Chart.js time-series visualizer component
│   │   ├── hooks/               # Custom streaming hook (useSensorStream)
│   │   ├── types/               # TypeScript interfaces for sensor telemetry
│   │   ├── App.tsx              # Main dashboard view & WebSocket handler
│   │   └── Chart.tsx            # Real-time chart configuration
│   ├── package.json
│   └── vite.config.ts
└── dhtdashboard_backend/        # Backend Service (Node.js + Express + TypeScript)
    ├── src/
    │   ├── server.ts            # Express app, MQTT listener & WebSocket server
    │   └── client.ts            # PostgreSQL client initialization
    ├── migrations/              # SQL schema migration files (db-migrate)
    └── package.json
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Hardware** | ESP8266 (NodeMCU / Wemos D1 Mini), DHT11 Temperature & Humidity Sensor |
| **Firmware** | Arduino C++, `DHT.h`, `ESP8266WiFi`, `PubSubClient`, `BearSSL`, `LittleFS`, `ArduinoJson` |
| **MQTT Broker** | HiveMQ Cloud (TLS / Port 8883) |
| **Backend** | Node.js, TypeScript, Express.js 5, WebSockets (`ws`), MQTT.js, `pg` (PostgreSQL) |
| **Database** | PostgreSQL |
| **Frontend** | React 19, TypeScript, Vite, Chart.js, `react-chartjs-2` |

---

## 🔌 Hardware Setup & Circuit Wiring

### Components Required
1. **ESP8266 Board** (e.g., NodeMCU V3 or Wemos D1 Mini)
2. **DHT11 Sensor** (Temperature & Humidity)
3. **10kΩ Pull-up Resistor** (if DHT11 module lacks an integrated resistor)
4. **Jumper Wires & Breadboard**

### Pin Connection Diagram

| DHT11 Sensor Pin | ESP8266 Pin | Notes |
|---|---|---|
| **VCC** | `3.3V` / `5V` | Power supply |
| **DATA** | `GPIO 5` (`D1`) | Signal data pin |
| **GND** | `GND` | Ground reference |

---

## 🚀 Getting Started

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL is installed and running on your system, or set up a hosted PostgreSQL instance.

Create a new database named `ambienthome` (or as defined in your connection string):

```sql
CREATE DATABASE ambienthome;
```

Run migrations in `dhtdashboard_backend` (or create the table manually):

```sql
CREATE TABLE iot_data (
    id SERIAL PRIMARY KEY,
    temperatureCelsius FLOAT NOT NULL,
    temperatureFahrenheit FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Backend Setup (`dhtdashboard_backend`)

1. Navigate to the backend folder:
   ```bash
   cd dhtdashboard_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `dhtdashboard_backend/` with your configuration:
   ```env
   PORT=8080
   DATABASE_URL=postgresql://username:password@localhost:5432/ambienthome
   MQTT_Server=your_mqtt_server_address:port
   MQTT_Client_Id=your_mqtt_client_id
   MQTT_Username=your_mqtt_username
   MQTT_Password=your_mqtt_password
   MQTT_SubscribedTobic=your_mqtt_subscribed_topic
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:8080` and start the WebSocket server on `ws://localhost:8080`.

---

### 3. Frontend Setup (`dhtdashboard`)

1. Navigate to the frontend folder:
   ```bash
   cd dhtdashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`. The dashboard will automatically connect to `ws://localhost:8080` to render live streaming charts.

---

### 4. Firmware Setup (`DHT11/DHT11.ino`)

1. Open `DHT11/DHT11.ino` in the **Arduino IDE**.
2. Install the required Arduino libraries via Library Manager:
   - `ESP8266WiFi`
   - `DHT sensor library` by Adafruit
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon
3. Update Wi-Fi & MQTT credentials in `DHT11.ino`:
   ```cpp
   const char *ssid = "YOUR_WIFI_SSID";
   const char *pass = "YOUR_WIFI_PASSWORD";

   const char* MQTT_Server   = "YOUR_HIVEMQ_HOST.hivemq.cloud";
   const char* MQTT_Username = "YOUR_MQTT_USERNAME";
   const char* MQTT_Password = "YOUR_MQTT_PASSWORD";
   ```
4. Upload root CA certificates to LittleFS memory on the ESP8266 for TLS BearSSL verification (`certs.ar` / `certs.idx`).
5. Select your ESP8266 board model and COM port, then click **Upload**.

---

## 📡 API & Communication Specifications

### MQTT Telemetry Payload Structure

Topic: `publishedData`
```json
{
  "temperaturecelsius": 24.5,
  "temperaturefahrenheit": 76.1,
  "humidity": 55.0
}
```

### WebSocket Message Stream

Endpoint: `ws://localhost:8080`
- Receives broadcast JSON messages whenever new telemetry arrives from the MQTT broker.

### REST API Endpoints

- **`GET /`**: Fetches stored historical telemetry data from PostgreSQL database.
  - **Response**: Array of sensor reading objects.

---

## 📜 License

This project is open source and available under the [ISC License](LICENSE).
