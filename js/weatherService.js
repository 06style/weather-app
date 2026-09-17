/* =========================================
   WEATHERPULSE - WEATHER SERVICE
   File: weatherService.js
   Responsibility: API requests + errors
   ========================================= */


const WeatherService = {

    /* =========================================
       CURRENT WEATHER
       ========================================= */

    async getCurrentWeather(city, units = WEATHER_CONFIG.DEFAULT_UNITS) {

        const url =
            `${WEATHER_CONFIG.BASE_URL}` +
            `${WEATHER_CONFIG.CURRENT_WEATHER_ENDPOINT}` +
            `?q=${encodeURIComponent(city)}` +
            `&units=${units}` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       5-DAY FORECAST
       ========================================= */

    async getForecast(city, units = WEATHER_CONFIG.DEFAULT_UNITS) {

        const url =
            `${WEATHER_CONFIG.BASE_URL}` +
            `${WEATHER_CONFIG.FORECAST_ENDPOINT}` +
            `?q=${encodeURIComponent(city)}` +
            `&units=${units}` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       WEATHER BY COORDINATES
       Used for "Use My Location"
       ========================================= */

    async getWeatherByCoordinates(
        latitude,
        longitude,
        units = WEATHER_CONFIG.DEFAULT_UNITS
    ) {

        const url =
            `${WEATHER_CONFIG.BASE_URL}` +
            `${WEATHER_CONFIG.CURRENT_WEATHER_ENDPOINT}` +
            `?lat=${latitude}` +
            `&lon=${longitude}` +
            `&units=${units}` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       FORECAST BY COORDINATES
       ========================================= */

    async getForecastByCoordinates(
        latitude,
        longitude,
        units = WEATHER_CONFIG.DEFAULT_UNITS
    ) {

        const url =
            `${WEATHER_CONFIG.BASE_URL}` +
            `${WEATHER_CONFIG.FORECAST_ENDPOINT}` +
            `?lat=${latitude}` +
            `&lon=${longitude}` +
            `&units=${units}` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       CITY AUTOCOMPLETE / CITY SEARCH
       ========================================= */

    async searchCities(query, limit = 5) {

        if (!query || query.trim().length < 2) {
            return [];
        }

        const url =
            `${WEATHER_CONFIG.GEO_ENDPOINT}` +
            `?q=${encodeURIComponent(query)}` +
            `&limit=${limit}` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       REVERSE GEOCODING
       Coordinates → City Name
       ========================================= */

    async getCityFromCoordinates(latitude, longitude) {

        const url =
            `${WEATHER_CONFIG.REVERSE_GEO_ENDPOINT}` +
            `?lat=${latitude}` +
            `&lon=${longitude}` +
            `&limit=1` +
            `&appid=${WEATHER_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                this.getErrorMessage(response.status)
            );
        }

        return await response.json();
    },


    /* =========================================
       ERROR HANDLING
       ========================================= */

    getErrorMessage(status) {

        switch (status) {

            case 400:
                return "Invalid request. Please check the city name.";

            case 401:
                return "Invalid API key. Please check your OpenWeather API key.";

            case 404:
                return "City not found. Please try another city.";

            case 429:
                return "API request limit reached. Please try again later.";

            case 500:
            case 502:
            case 503:
            case 504:
                return "Weather service is temporarily unavailable.";

            default:
                return "Something went wrong. Please try again.";
        }
    }
};