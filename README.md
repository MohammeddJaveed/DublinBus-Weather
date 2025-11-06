# 🚌 DublinBusWeatherCombo

A **React Native** application that combines **Dublin Bus real-time tracking (GTFS-Realtime API)** with **live weather updates** from OpenWeather.  
Users can view nearby bus stops, track live bus locations, and check current weather conditions at their destination.

---

## 🚀 Features

- **Real-Time Bus Tracking:**  
  Uses the General Transit Feed Specification (GTFS-Realtime) API to show live bus movement and timing.

- **Interactive Map:**  
  Displays all bus stops on a map using `react-native-maps`.  
  Users can select a stop to view route details and destination information.

- **Weather Integration:**  
  Integrates OpenWeather API to provide real-time weather conditions for any location.

- **Search Functionality:**  
  Enter an **Eircode** or **place name** to view the buses reaching that destination.

- **Static + Realtime Data Sync:**  
  Static GTFS data (routes, stops, destinations) are mapped with realtime route IDs for accurate information.

---

## 🛠️ Tech Stack

- **React Native** (v0.82.1)
- **React Navigation** (v7)
- **React Native Maps**
- **Axios** for API requests
- **Moment.js** for time formatting
- **OpenWeather API**
- **GTFS-Realtime API** for transit data
- **TypeScript** support
- **CSV-Parser & PapaParse** for static GTFS file parsing

---

## 📱 Screens

- **Map Screen:** Displays bus stops and bus positions in real time.
- **Search Screen:** Enter destination (Eircode or name) to find buses.
- **Weather Overlay:** Shows live weather data for selected locations.

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js ≥ 20
- Android Studio or Xcode (for simulator)
