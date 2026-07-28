/**
 * Shape of a single incoming reading from your device/broker
 * (e.g. an MQTT payload from an ESP32).
 */
export interface SensorMessage {
  temperaturecelsius: number;
  temperaturefahrenheit: number;
  humidity: number;
}

/** A single point on a time-series chart. */
export interface TimeSeriesPoint {
  timestamp: number; // ms since epoch, used for the x-axis
  value: number;
}
