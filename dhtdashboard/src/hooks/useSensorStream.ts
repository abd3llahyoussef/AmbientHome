import { useCallback, useEffect, useRef, useState } from "react";
import type { SensorMessage, TimeSeriesPoint } from "../types/sensor";

interface SensorStreamState {
  celsius: TimeSeriesPoint[];
  fahrenheit: TimeSeriesPoint[];
  humidity: TimeSeriesPoint[];
}

const MAX_POINTS = 30; // how many points stay visible per chart before scrolling off

/**
 * Keeps a rolling time-series buffer for each metric in a SensorMessage.
 * Call `addMessage` every time a new reading arrives (from MQTT, a
 * WebSocket, an HTTP poll, whatever your real data source is).
 */
export function useSensorStream(maxPoints: number = MAX_POINTS) {
  const [data, setData] = useState<SensorStreamState>({
    celsius: [],
    fahrenheit: [],
    humidity: [],
  });

  const maxPointsRef = useRef(maxPoints);
  maxPointsRef.current = maxPoints;

  const addMessage = useCallback((message: SensorMessage) => {
    const timestamp = Date.now();
    setData((prev) => {
      const cap = maxPointsRef.current;
      return {
        celsius: [...prev.celsius, { timestamp, value: message.temperaturecelsius }].slice(-cap),
        fahrenheit: [...prev.fahrenheit, { timestamp, value: message.temperaturefahrenheit }].slice(-cap),
        humidity: [...prev.humidity, { timestamp, value: message.humidity }].slice(-cap),
      };
    });
  }, []);

  return { data, addMessage };
}


