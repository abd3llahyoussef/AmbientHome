CREATE TABLE iot_data (
    id SERIAL PRIMARY KEY,
    temperatureCelsius FLOAT NOT NULL,
    temperatureFahrenheit FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);