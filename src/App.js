import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', bg: 'clear' },
  1: { label: 'Mainly Clear', icon: '🌤️', bg: 'clear' },
  2: { label: 'Partly Cloudy', icon: '⛅', bg: 'cloudy' },
  3: { label: 'Overcast', icon: '☁️', bg: 'cloudy' },
  45: { label: 'Foggy', icon: '🌫️', bg: 'fog' },
  48: { label: 'Icy Fog', icon: '🌫️', bg: 'fog' },
  51: { label: 'Light Drizzle', icon: '🌦️', bg: 'rain' },
  53: { label: 'Drizzle', icon: '🌦️', bg: 'rain' },
  55: { label: 'Heavy Drizzle', icon: '🌧️', bg: 'rain' },
  61: { label: 'Light Rain', icon: '🌧️', bg: 'rain' },
  63: { label: 'Rain', icon: '🌧️', bg: 'rain' },
  65: { label: 'Heavy Rain', icon: '🌧️', bg: 'rain' },
  71: { label: 'Light Snow', icon: '🌨️', bg: 'snow' },
  73: { label: 'Snow', icon: '❄️', bg: 'snow' },
  75: { label: 'Heavy Snow', icon: '❄️', bg: 'snow' },
  77: { label: 'Snow Grains', icon: '🌨️', bg: 'snow' },
  80: { label: 'Light Showers', icon: '🌦️', bg: 'rain' },
  81: { label: 'Showers', icon: '🌧️', bg: 'rain' },
  82: { label: 'Heavy Showers', icon: '⛈️', bg: 'storm' },
  85: { label: 'Snow Showers', icon: '🌨️', bg: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: '❄️', bg: 'snow' },
  95: { label: 'Thunderstorm', icon: '⛈️', bg: 'storm' },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈️', bg: 'storm' },
  99: { label: 'Thunderstorm w/ Heavy Hail', icon: '⛈️', bg: 'storm' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: '🌡️', bg: 'clear' };
}

function formatTime(iso) {
  const d = new Date(iso);
  const h = d.getHours();
  return h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS[d.getDay()];
}

function formatFullDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getWindDir(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function getCountryFlag(countryCode) {
  if (!/^[a-z]{2}$/i.test(countryCode || '')) return '';
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)));
}

function getCountryName(countryCode) {
  if (!/^[a-z]{2}$/i.test(countryCode || '')) return countryCode;
  try {
    return new Intl.DisplayNames([navigator.language || 'en'], { type: 'region' }).of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}

function getWindDescription(speedKmh) {
  if (speedKmh < 6) return 'Calm';
  if (speedKmh < 20) return 'Light breeze';
  if (speedKmh < 39) return 'Breezy';
  if (speedKmh < 62) return 'Strong wind';
  return 'Very strong wind';
}

function TemperatureChart({ weather, startIndex, temp }) {
  const points = weather.hourly.time.slice(startIndex, startIndex + 24).map((time, index) => ({
    time,
    temperature: weather.hourly.temperature_2m[startIndex + index],
    precipitation: weather.hourly.precipitation_probability[startIndex + index] || 0,
  }));
  if (!points.length) return null;
  const temperatures = points.map(point => point.temperature);
  const min = Math.min(...temperatures) - 2;
  const max = Math.max(...temperatures) + 2;
  const span = Math.max(max - min, 1);
  const x = index => 18 + (index / Math.max(points.length - 1, 1)) * 324;
  const y = value => 94 - ((value - min) / span) * 58;
  const line = points.map((point, index) => `${x(index)},${y(point.temperature)}`).join(' ');

  return (
    <section className="chart-card glass" aria-labelledby="chart-title">
      <h2 id="chart-title">Next 24 Hours</h2>
      <div className="chart-legend">
        <span><i className="legend-temp" />Temperature</span>
        <span><i className="legend-rain" />Chance of rain</span>
      </div>
      <svg className="forecast-chart" viewBox="0 0 360 166" role="img" aria-label="24 hour temperature and precipitation chance forecast">
        {[0, 1, 2].map(tick => <line key={tick} className="chart-grid" x1="18" x2="342" y1={46 + tick * 29} y2={46 + tick * 29} />)}
        {points.map((point, index) => {
          const barHeight = (point.precipitation / 100) * 30;
          return <rect key={`rain-${point.time}`} className="rain-bar" x={x(index) - 5} y={132 - barHeight} width="10" height={barHeight} rx="3" />;
        })}
        <polyline className="temp-line" points={line} />
        {points.map((point, index) => index % 4 === 0 || index === points.length - 1 ? (
          <g key={`label-${point.time}`}>
            <circle className="temp-dot" cx={x(index)} cy={y(point.temperature)} r="3.5" />
            <text className="chart-temp-label" x={x(index)} y={y(point.temperature) - 9} textAnchor="middle">{temp(point.temperature)}</text>
            <text className="chart-time-label" x={x(index)} y="157" textAnchor="middle">{index === 0 ? 'Now' : formatTime(point.time)}</text>
          </g>
        ) : null)}
      </svg>
    </section>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('F');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('hourly');
  const [searchFocused, setSearchFocused] = useState(false);

  const toF = (c) => Math.round(c * 9 / 5 + 32);
  const temp = (c) => unit === 'C' ? `${Math.round(c)}°` : `${toF(c)}°`;
  const precipitationAmount = (millimeters) => unit === 'C'
    ? `${millimeters.toFixed(1)} mm`
    : `${(millimeters / 25.4).toFixed(2)} in`;
  const windSpeed = (kilometersPerHour) => unit === 'F'
    ? `${Math.round(kilometersPerHour * 0.621371)} mph`
    : `${Math.round(kilometersPerHour)} km/h`;

  const fetchWeather = useCallback(async (lat, lon, name, country) => {
    setLoading(true);
    setError('');
    try {
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,` +
        `wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_gusts_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum` +
        `&timezone=auto&forecast_days=7`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) throw new Error('Weather request failed');
      const data = await weatherResponse.json();
      setWeather(data);
      setLocation({ name, country, lat, lon });
      setLoading(false);
    } catch {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6`);
      const data = await res.json();
      setSuggestions(data.results || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchCities(query), 300);
    return () => clearTimeout(t);
  }, [query, searchCities]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${coords.latitude}&longitude=${coords.longitude}`)
            .catch(() => {});
          fetchWeather(coords.latitude, coords.longitude, 'Current Location', '');
        },
        () => fetchWeather(40.7128, -74.006, 'New York', 'US')
      );
    } else {
      fetchWeather(40.7128, -74.006, 'New York', 'US');
    }
  }, [fetchWeather]);

  const selectCity = (city) => {
    setQuery('');
    setSuggestions([]);
    setSearchFocused(false);
    fetchWeather(city.latitude, city.longitude, city.name, city.country_code || '');
  };

  const bgClass = weather ? getWeatherInfo(weather.current.weather_code).bg : 'clear';
  const isDay = weather
    ? (() => {
        const now = new Date();
        const sunrise = new Date(weather.daily.sunrise[0]);
        const sunset = new Date(weather.daily.sunset[0]);
        return now >= sunrise && now <= sunset;
      })()
    : true;

  const nowHourIndex = weather
    ? Math.max(0, weather.hourly.time.findIndex(t => new Date(t) >= new Date()))
    : 0;
  const hourlySlice = weather ? weather.hourly.time.slice(nowHourIndex, nowHourIndex + 24) : [];

  return (
    <div className={`app ${theme} bg-${bgClass} ${isDay ? 'day' : 'night'}`}>
      <div className="particles">
        {bgClass === 'rain' && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="raindrop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${0.5 + Math.random()}s` }} />
        ))}
        {bgClass === 'snow' && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="snowflake" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}>❄</div>
        ))}
        {bgClass === 'storm' && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="lightning" style={{ animationDelay: `${i * 1.5}s` }} />
        ))}
      </div>

      <div className="container">
        <h1 className="app-title">Weather Condition</h1>
        <div className="top-controls">
          {/* Search */}
          <div className={`search-wrap ${searchFocused ? 'focused' : ''}`}>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search city..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => { setSearchFocused(false); setSuggestions([]); }, 200)}
              />
              <button className={`unit-toggle ${unit === 'F' ? 'active' : ''}`} onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}>
                °{unit === 'C' ? 'F' : 'C'}
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map(c => (
                  <li key={c.id} onMouseDown={() => selectCity(c)}>
                    <span className="city-name">{c.name}</span>
                    <span className="city-meta">{c.admin1 && `${c.admin1}, `}{c.country}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        {loading && (
          <div className="loader-wrap">
            <div className="loader" />
            <p>Loading weather...</p>
          </div>
        )}

        {error && <div className="error-card">{error}</div>}

        {weather && !loading && (
          <>
            {/* Hero Card */}
            <div className="hero-card glass">
              <div className="hero-top">
                <div className="location-info">
                  <h2 className="city">{location?.name}</h2>
                  {location?.country && (
                    <span className="country">
                      <span role="img" aria-label={`${getCountryName(location.country)} flag`}>{getCountryFlag(location.country)}</span>
                      {getCountryName(location.country)}
                    </span>
                  )}
                  <p className="date">{formatFullDate()}</p>
                </div>
                <div className="weather-icon-wrap">
                  <div className="weather-icon-big">
                    {getWeatherInfo(weather.current.weather_code).icon}
                  </div>
                </div>
              </div>

              <div className="temp-row">
                <div className="temp-main">{temp(weather.current.temperature_2m)}<span className="unit">{unit}</span></div>
                <div className="temp-details">
                  <div className="condition">{getWeatherInfo(weather.current.weather_code).label}</div>
                  <div className="feels-like">Feels like {temp(weather.current.apparent_temperature)}</div>
                  <div className="hi-lo">
                    <span>↑ {temp(weather.daily.temperature_2m_max[0])}</span>
                    <span>↓ {temp(weather.daily.temperature_2m_min[0])}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
              {[
                { icon: '💧', label: 'Humidity', value: `${weather.current.relative_humidity_2m}%` },
                { icon: '🌬️', label: 'Wind', value: `${windSpeed(weather.current.wind_speed_10m)} ${getWindDir(weather.current.wind_direction_10m)}` },
                { icon: '💨', label: 'Wind gusts', value: `${windSpeed(weather.current.wind_gusts_10m)} · ${getWindDescription(weather.current.wind_gusts_10m)}` },
                { icon: '🌧️', label: 'Past hour rain', value: weather.current.precipitation > 0 ? precipitationAmount(weather.current.precipitation) : 'None' },
                { icon: '🌅', label: 'Sunrise', value: new Date(weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { icon: '🌇', label: 'Sunset', value: new Date(weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ].map(m => (
                <div key={m.label} className="metric-card glass">
                  <span className="metric-icon">{m.icon}</span>
                  <span className="metric-label">{m.label}</span>
                  <span className="metric-value">{m.value}</span>
                </div>
              ))}
            </div>

            <TemperatureChart weather={weather} startIndex={nowHourIndex} temp={temp} />

            {/* Tabs: Hourly / 7-Day */}
            <div className="forecast-card glass">
              <div className="tabs">
                <button className={activeTab === 'hourly' ? 'active' : ''} onClick={() => setActiveTab('hourly')}>Hourly</button>
                <button className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>7-Day</button>
              </div>

              {activeTab === 'hourly' && (
                <div className="hourly-scroll">
                  {hourlySlice.map((time, i) => {
                    const code = weather.hourly.weather_code[nowHourIndex + i];
                    const t = weather.hourly.temperature_2m[nowHourIndex + i];
                    const precip = weather.hourly.precipitation_probability[nowHourIndex + i] ?? 0;
                    return (
                      <div key={time} className={`hourly-item ${i === 0 ? 'now' : ''}`}>
                        <span className="h-time">{i === 0 ? 'Now' : formatTime(time)}</span>
                        <span className="h-icon">{getWeatherInfo(code).icon}</span>
                        <span className="h-temp">{temp(t)}</span>
                        <span className="h-precip" aria-label={`${precip}% chance of rain`}>💧{precip}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'daily' && (
                <div className="daily-list">
                  {weather.daily.time.map((date, i) => {
                    const code = weather.daily.weather_code[i];
                    const max = weather.daily.temperature_2m_max[i];
                    const min = weather.daily.temperature_2m_min[i];
                    const precip = weather.daily.precipitation_sum[i];
                    return (
                      <div key={date} className={`daily-item ${i === 0 ? 'today' : ''}`}>
                        <span className="d-day">{i === 0 ? 'Today' : formatDay(date)}</span>
                        <span className="d-icon">{getWeatherInfo(code).icon}</span>
                        <span className="d-cond">{getWeatherInfo(code).label}</span>
                        {precip > 0 && <span className="d-precip">💧{precip.toFixed(1)}mm</span>}
                        <div className="d-temps">
                          <span className="d-max">{temp(max)}</span>
                          <span className="d-min">{temp(min)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <footer className="footer">
          Weather by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          {' · '}{new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
