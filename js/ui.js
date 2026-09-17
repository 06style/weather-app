/* =========================================
   WEATHERPULSE - USER INTERFACE
   File: ui.js
   Responsibility: Render weather data
   ========================================= */


const UI = {

    /* =========================================
       CURRENT WEATHER
       ========================================= */

    renderCurrentWeather(weather, units = "metric") {

        const locationName = document.getElementById("locationName");
        const lastUpdated = document.getElementById("lastUpdated");
        const temperature = document.getElementById("temperature");
        const weatherCondition = document.getElementById("weatherCondition");
        const feelsLike = document.getElementById("feelsLike");
        const humidity = document.getElementById("humidity");
        const wind = document.getElementById("wind");
        const pressure = document.getElementById("pressure");
        const visibility = document.getElementById("visibility"); 
        const sunrise = document.getElementById("sunrise");
        const sunset = document.getElementById("sunset");
        const weatherIcon = document.getElementById("weatherIcon");

        if (!weather) return;


        /* ---------- Location ---------- */

        locationName.textContent =
            `${weather.name}, ${weather.sys.country}`;


        /* ---------- Temperature ---------- */

        const unitSymbol = units === "metric" ? "°C" : "°F";

        temperature.textContent =
            `${Math.round(weather.main.temp)}${unitSymbol}`;


        /* ---------- Condition ---------- */

        const condition =
            weather.weather[0].description;

        weatherCondition.textContent =
            this.capitalize(condition);


        /* ---------- Feels Like ---------- */

        feelsLike.textContent =
            `${Math.round(weather.main.feels_like)}${unitSymbol}`;


        /* ---------- Humidity ---------- */

        humidity.textContent =
            `${weather.main.humidity}%`;


        /* ---------- Wind ---------- */

        const windUnit =
            units === "metric" ? "m/s" : "mph";

        wind.textContent =
            `${weather.wind.speed} ${windUnit}`;


        /* ---------- Pressure ---------- */

        pressure.textContent =
            `${weather.main.pressure} hPa`;


        /* ---------- Visibility ---------- */

        const visibilityKm =
            (weather.visibility / 1000).toFixed(1);

        visibility.textContent =
            `${visibilityKm} km`;
        
            /* ---------- Sunrise & Sunset ---------- */

if (sunrise && weather.sys?.sunrise) {
    sunrise.textContent =
        new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
}

if (sunset && weather.sys?.sunset) {
    sunset.textContent =
        new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
}

        /* ---------- Updated Time ---------- */

        const updatedTime =
            new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        lastUpdated.textContent =
            `Updated at ${updatedTime}`;


        /* ---------- Weather Icon ---------- */

        this.setWeatherIcon(
            weatherIcon,
            weather.weather[0].main,
            weather.weather[0].icon
        );
        
        this.setWeatherBackground(weather);

    },

/* =========================================
   HOURLY FORECAST
   ========================================= */

renderHourlyForecast(forecast, units = "metric") {

    const hourlyList =
        document.getElementById("hourlyList");

    if (!hourlyList || !forecast || !forecast.list) return;

    hourlyList.innerHTML = "";

    const unitSymbol =
        units === "metric" ? "°C" : "°F";

    // Show next 8 forecast entries
    const hourlyData =
        forecast.list.slice(0, 8);

    hourlyData.forEach(item => {

        const card =
            document.createElement("article");

        card.className = "hourly-card";

        const date =
            new Date(item.dt * 1000);

        const time =
            date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });

        const weatherMain =
            item.weather[0].main;

        const iconClass =
            this.getWeatherIconClass(
                weatherMain,
                item.weather[0].icon
            );

        card.innerHTML = `
            <div class="hourly-time">
                ${time}
            </div>

            <div class="weather-icon small ${iconClass}">
                <span aria-hidden="true"></span>
            </div>

            <div class="hourly-temperature">
                ${Math.round(item.main.temp)}${unitSymbol}
            </div>

            <div class="hourly-condition">
                ${this.capitalize(item.weather[0].description)}
            </div>
            <div class="hourly-rain">
    💧 ${Math.round((item.pop || 0) * 100)}%
</div>
        `;

        hourlyList.appendChild(card);
    });
},
    
    


    /* =========================================
       5-DAY FORECAST
       ========================================= */

    renderForecast(forecast, units = "metric") {

        const forecastList =
            document.getElementById("forecastList");

        if (!forecastList || !forecast) return;

        forecastList.innerHTML = "";

        const unitSymbol =
            units === "metric" ? "°C" : "°F";


        /*
         * OpenWeather gives forecast data
         * every 3 hours.
         *
         * We select one forecast point
         * around midday for each day.
         */

        const dailyForecasts =
            this.getDailyForecasts(forecast.list);


        dailyForecasts.forEach(day => {

            const card =
                document.createElement("article");

            card.className = "forecast-card";

            const date =
                new Date(day.dt * 1000);

            const dayName =
                date.toLocaleDateString([], {
                    weekday: "short"
                });

            const weatherMain =
                day.weather[0].main;

            const condition =
                day.weather[0].description;

            const iconClass =
                this.getWeatherIconClass(
                    weatherMain,
                    day.weather[0].icon
                );

            card.innerHTML = `
                <div class="forecast-day">
                    ${dayName}
                </div>

                <div class="weather-icon medium ${iconClass}">
                    <span aria-hidden="true"></span>
                </div>

                <div class="forecast-condition">
                    ${this.capitalize(condition)}
                </div>

                <div class="forecast-temperature">
                    ${Math.round(day.main.temp)}${unitSymbol}
                </div>

                <div class="forecast-feels">
                    Feels ${Math.round(day.main.feels_like)}${unitSymbol}
                </div>
            `;

            forecastList.appendChild(card);
        });
    },


    /* =========================================
       SELECT DAILY FORECASTS
       ========================================= */

    getDailyForecasts(list) {

        const grouped = {};

        list.forEach(item => {

            const date =
                new Date(item.dt * 1000);

            const dateKey =
                `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }

            grouped[dateKey].push(item);
        });


        return Object.values(grouped)
            .slice(0, 5)
            .map(dayItems => {

                /*
                 * Try to find the forecast closest
                 * to 12 PM.
                 */

                return dayItems.reduce(
                    (closest, current) => {

                        const currentHour =
                            new Date(
                                current.dt * 1000
                            ).getHours();

                        const closestHour =
                            new Date(
                                closest.dt * 1000
                            ).getHours();

                        return Math.abs(currentHour - 12) <
                               Math.abs(closestHour - 12)
                            ? current
                            : closest;

                    }
                );
            });
    },


    /* =========================================
       WEATHER ICON
       ========================================= */

    setWeatherIcon(element, condition, iconCode) {

        if (!element) return;

        const iconClass =
            this.getWeatherIconClass(
                condition,
                iconCode
            );

        element.className =
            `weather-icon large ${iconClass}`;

        element.innerHTML =
            `<span aria-hidden="true"></span>`;
    },


    getWeatherIconClass(condition, iconCode) {

        const isNight =
            iconCode && iconCode.endsWith("n");

        if (isNight) {
            return "weather-night";
        }


        switch (condition.toLowerCase()) {

            case "clear":
                return "weather-sunny";

            case "clouds":
                return "weather-cloudy";

            case "rain":
                return "weather-rain";

            case "drizzle":
                return "weather-rain";

            case "thunderstorm":
                return "weather-storm";

            case "snow":
                return "weather-snow";

            case "mist":
            case "fog":
            case "haze":
            case "smoke":
            case "dust":
            case "sand":
            case "ash":
                return "weather-mist";

            default:
                return "weather-cloudy";
        }
    },


    
/* =========================================
   DYNAMIC WEATHER BACKGROUND
   ========================================= */

setWeatherBackground(weather) {

    const background =
        document.getElementById("weatherBackground");

    if (!background || !weather || !weather.weather?.[0]) {
        return;
    }

    const condition =
        weather.weather[0].main.toLowerCase();

    const iconCode =
        weather.weather[0].icon || "";

    /* Remove previous weather states */

    background.classList.remove(
        "weather-clear",
        "weather-partly-cloudy",
        "weather-cloudy",
        "weather-rain",
        "weather-heavy-rain",
        "weather-storm",
        "weather-snow",
        "weather-mist",
        "weather-night"
    );

    /* Night comes first */

    if (iconCode.endsWith("n")) {

        background.classList.add("weather-night");

        return;
    }

    /* Weather conditions */

    switch (condition) {

        case "clear":
            background.classList.add("weather-clear");
            break;

        case "clouds":

            if (
                weather.weather[0].description
                    .toLowerCase()
                    .includes("few") ||
                weather.weather[0].description
                    .toLowerCase()
                    .includes("scattered")
            ) {
                background.classList.add(
                    "weather-partly-cloudy"
                );
            } else {
                background.classList.add(
                    "weather-cloudy"
                );
            }

            break;

        case "rain":

            if (
                weather.weather[0].description
                    .toLowerCase()
                    .includes("heavy")
            ) {
                background.classList.add(
                    "weather-heavy-rain"
                );
            } else {
                background.classList.add(
                    "weather-rain"
                );
            }

            break;

        case "drizzle":
            background.classList.add(
                "weather-rain"
            );
            break;

        case "thunderstorm":
            background.classList.add(
                "weather-storm"
            );
            break;

        case "snow":
            background.classList.add(
                "weather-snow"
            );
            break;

        case "mist":
        case "fog":
        case "haze":
        case "smoke":
        case "dust":
        case "sand":
        case "ash":
            background.classList.add(
                "weather-mist"
            );
            break;

        default:
            background.classList.add(
                "weather-cloudy"
            );
    }
},

    /* =========================================
      FAVORITES
       ========================================= */

    renderFavorites(currentCity = "") {

        const favoritesList =
            document.getElementById("favoritesList");

        if (!favoritesList) return;

        const favorites =
            StorageManager.getFavorites();

        favoritesList.innerHTML = "";


        if (favorites.length === 0) {

            favoritesList.innerHTML = `
                <p class="empty-message">
                    No favorite cities yet.
                </p>
            `;

            return;
        }


        favorites.forEach(city => {

            const card =
                document.createElement("div");

            card.className = "favorite-card";

            const active =
                city.toLowerCase() ===
                currentCity.toLowerCase();

            card.innerHTML = `
                <button
                    class="favorite-city-button ${active ? "active" : ""}"
                    data-city="${this.escapeHTML(city)}"
                    type="button"
                >
                    ${this.escapeHTML(city)}
                </button>

                <button
                    class="remove-favorite"
                    data-remove-city="${this.escapeHTML(city)}"
                    type="button"
                    aria-label="Remove ${this.escapeHTML(city)} from favorites"
                >
                    ×
                </button>
            `;

            favoritesList.appendChild(card);
        });
    },


    /* =========================================
       LOADING STATE
       ========================================= */

    showLoading() {

        const loading =
            document.getElementById("loading");

        const error =
            document.getElementById("errorMessage");

        if (loading) {
            loading.hidden = false;
        }

        if (error) {
            error.hidden = true;
        }
    },


    hideLoading() {

        const loading =
            document.getElementById("loading");

        if (loading) {
            loading.hidden = true;
        }
    },


    /* =========================================
       ERROR MESSAGE
       ========================================= */

    showError(message) {

        const error =
            document.getElementById("errorMessage");

        const errorText =
            document.getElementById("errorText");

        if (errorText) {
            errorText.textContent = message;
        }

        if (error) {
            error.hidden = false;
        }

        this.hideLoading();
    },


    hideError() {

        const error =
            document.getElementById("errorMessage");

        if (error) {
            error.hidden = true;
        }
    },


    /* =========================================
       CAPITALIZE TEXT
       ========================================= */

    capitalize(text) {

        if (!text) return "";

        return text.charAt(0).toUpperCase() +
               text.slice(1);
    },


    /* =========================================
       SAFE HTML
       ========================================= */

    escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};