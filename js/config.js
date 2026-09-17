/* =========================================
   WEATHERPULSE - API CONFIGURATION
   File: config.js
   Responsibility: API key + API URLs
   ========================================= */

const WEATHER_CONFIG = {
    API_KEY: "c003044518f1987a85b628f33f486ed8",

    BASE_URL: "https://api.openweathermap.org/data/2.5",

    CURRENT_WEATHER_ENDPOINT: "/weather",

    FORECAST_ENDPOINT: "/forecast",

    GEO_ENDPOINT: "https://api.openweathermap.org/geo/1.0/direct",

    REVERSE_GEO_ENDPOINT: "https://api.openweathermap.org/geo/1.0/reverse",

    DEFAULT_UNITS: "metric",

    DEFAULT_CITY: "Delhi",

    CACHE_DURATION: 10 * 60 * 1000
};