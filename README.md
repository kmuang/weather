# Weather App

A beautiful, real-time weather application built with React, featuring advanced UI/UX design with glassmorphism, animated weather effects, and live data from the Open-Meteo API — no API key required.

## Features

- **Real-time weather data** — current conditions, 24-hour hourly forecast, 7-day daily forecast
- **City search** — autocomplete powered by the Open-Meteo Geocoding API
- **Auto-location** — detects your location on load (with browser permission)
- **Dynamic backgrounds** — changes gradient and particle effects based on weather (clear, cloudy, rain, snow, storm, fog)
- **Animated weather icon** — floating animation matched to current conditions
- **Live particles** — animated raindrops, snowflakes, or lightning depending on weather
- **Weather metrics** — humidity, wind speed/direction, pressure, visibility, sunrise/sunset
- **UV Index** — color-coded bar with risk level
- **Temperature toggle** — switch between Celsius and Fahrenheit
- **Day/Night mode** — background adapts to time of day
- **Glassmorphism UI** — frosted glass cards with blur effects

## Getting Started

### Prerequisites

- Node.js 16+
- npm

### Installation

```bash
git clone <repo-url>
cd weather-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. On load, the app requests your location and shows local weather
2. Type a city name in the search bar to get suggestions
3. Click a suggestion to load that city's weather
4. Use the `°F / °C` button to toggle temperature units
5. Switch between **Hourly** and **7-Day** tabs in the forecast section

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key) |
| Geocoding | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |
| Styling | Pure CSS (glassmorphism, animations, responsive) |
| Build | Create React App |

## API

This app uses [Open-Meteo](https://open-meteo.com/) — a free, open-source weather API with no API key required. Data includes WMO weather codes, temperature, wind, humidity, pressure, UV index, and more.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
