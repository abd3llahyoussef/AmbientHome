import LiveLineChart from "./components/LiveLineChart";
import { useSensorStream } from "./hooks/useSensorStream";
import { useState, useEffect } from "react";
import type { SensorMessage } from "./types/sensor";
import "./App.css";

export default function App() {
  const { data, addMessage } = useSensorStream(30);
  const [mqttData, setMqttData] = useState<SensorMessage | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onmessage = (event) => {
      const message: SensorMessage = JSON.parse(event.data);
      setMqttData(message);
    };
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (mqttData) {
      addMessage(mqttData);
    }
  }, [mqttData, addMessage]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>IIoT Live Sensor Dashboard</h1>
        <p>Temperature (°C / °F) and humidity, updating in real time</p>
      </header>

      <div className="dashboard__grid">
        <LiveLineChart
          title="Temperature"
          unit="°C"
          color="#f97316"
          points={data.celsius}
          yMin={0}
          yMax={60}
        />
        <LiveLineChart
          title="Temperature"
          unit="°F"
          color="#ef4444"
          points={data.fahrenheit}
          yMin={32}
          yMax={140}
        />
        <LiveLineChart
          title="Humidity"
          unit="%"
          color="#38bdf8"
          points={data.humidity}
          yMin={0}
          yMax={100}
        />
      </div>
    </div>
  );
}
