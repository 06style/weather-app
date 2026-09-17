/* =========================================
   WEATHERPULSE - MAIN APPLICATION
   File: app.js
   Responsibility: Events + application logic
   ========================================= */


const App = {

    currentCity: WEATHER_CONFIG.DEFAULT_CITY,

    currentWeather: null,

    currentForecast: null,

    currentUnits: StorageManager.getUnit(),


    /* =========================================
       INITIALIZE APPLICATION
       ========================================= */

    init() {

        this.applyTheme();

        this.setupEventListeners();

        UI.renderFavorites();

        this.loadWeather(this.currentCity, true);
    },


    /* =========================================
       EVENT LISTENERS
       ========================================= */

    setupEventListeners() {

        /* ---------- Search Form ---------- */

        const searchForm =
            document.getElementById("searchForm");

        if (searchForm) {
            searchForm.addEventListener(
                "submit",
                (event) => {
                    event.preventDefault();
                    this.handleSearch();
                }
            );
        }
/* ---------- Refresh Weather ---------- */

const refreshButton =
    document.getElementById("refreshButton");

if (refreshButton) {
    refreshButton.addEventListener(
    "click",
    async () => {

        refreshButton.disabled = true;
        refreshButton.textContent = "🔄 Refreshing...";

        await this.loadWeather(
            WEATHER_CONFIG.DEFAULT_CITY,
            true
        );

        refreshButton.disabled = false;
        refreshButton.textContent = "🔄 Refresh Weather";
    }
);
}

        /* ---------- Search Input ---------- */

        const cityInput =
            document.getElementById("cityInput");

        if (cityInput) {

            cityInput.addEventListener(
                "input",
                () => {
                    this.handleCitySuggestions(
                        cityInput.value
                    );
                }
            );
        }


        /* ---------- Location Button ---------- */

        const locationButton =
            document.getElementById("locationButton");

        if (locationButton) {

            locationButton.addEventListener(
                "click",
                () => {
                    this.getUserLocation();
                }
            );
        }


        /* ---------- Unit Toggle ---------- */

        const unitToggle =
            document.getElementById("unitToggle");

        if (unitToggle) {

            unitToggle.addEventListener(
                "click",
                () => {
                    this.toggleUnit();
                }
            );
        }


        /* ---------- Theme Toggle ---------- */

        const themeToggle =
            document.getElementById("themeToggle");

        if (themeToggle) {

            themeToggle.addEventListener(
                "click",
                () => {
                    this.toggleTheme();
                }
            );
        }


        /* ---------- Favorite Button ---------- */

        const favoriteButton =
            document.getElementById("favoriteButton");

        if (favoriteButton) {

            favoriteButton.addEventListener(
                "click",
                () => {
                    this.toggleFavorite();
                }
            );
        }


        /* ---------- Favorite City List ---------- */

        const favoritesList =
            document.getElementById("favoritesList");

        if (favoritesList) {

            favoritesList.addEventListener(
                "click",
                (event) => {

                    const cityButton =
                        event.target.closest(
                            "[data-city]"
                        );

                    const removeButton =
                        event.target.closest(
                            "[data-remove-city]"
                        );


                    if (removeButton) {

                        const city =
                            removeButton.dataset.removeCity;

                        StorageManager.removeFavorite(city);

                        UI.renderFavorites(
                            this.currentCity
                        );

                        this.updateFavoriteButton();

                        return;
                    }


                    if (cityButton) {

                        const city =
                            cityButton.dataset.city;

                        this.loadWeather(city);
                    }
                }
            );
        }
    },


    /* =========================================
       SEARCH CITY
       ========================================= */

    async handleSearch() {

        const cityInput =
            document.getElementById("cityInput");

        if (!cityInput) return;

        const city =
            cityInput.value.trim();

        if (!city) {

            UI.showError(
                "Please enter a city name."
            );

            return;
        }

        await this.loadWeather(city);
    },


    /* =========================================
       LOAD WEATHER
       ========================================= */
    async loadWeather(city, forceRefresh = false) {

        if (!city) return;

        UI.showLoading();
        UI.hideError();

        try {

            const cached =
                StorageManager.getWeatherCache(city);


            /* ---------- Check Cache ---------- */

            if (
                !forceRefresh &&
                cached &&
                Date.now() - cached.timestamp <
                WEATHER_CONFIG.CACHE_DURATION
            ) {

                this.currentWeather =
                    cached.data.current;

                this.currentForecast =
                    cached.data.forecast;

                this.currentCity =
                    cached.city;

                UI.renderCurrentWeather(
                    this.currentWeather,
                    this.currentUnits
                );

                UI.renderForecast(
                    this.currentForecast,
                    this.currentUnits
                );
                UI.renderHourlyForecast(
                this.currentForecast,
                this.currentUnits
                );

                UI.renderFavorites(
                    this.currentCity
                );

                this.updateFavoriteButton();

                UI.hideLoading();

                return;
            }


            /* ---------- API Requests ---------- */

            const [
                weather,
                forecast
            ] = await Promise.all([

                WeatherService.getCurrentWeather(
                    city,
                    this.currentUnits
                ),

                WeatherService.getForecast(
                    city,
                    this.currentUnits
                )

            ]);


            this.currentWeather = weather;

            this.currentForecast = forecast;

            this.currentCity = weather.name;


            /* ---------- Save Cache ---------- */

            StorageManager.saveWeatherCache(
                weather.name,
                {
                    current: weather,
                    forecast: forecast
                }
            );


            /* ---------- Save Recent Search ---------- */

            StorageManager.saveRecentSearch(
                weather.name
            );


            /* ---------- Render UI ---------- */

            UI.renderCurrentWeather(
                weather,
                this.currentUnits
            );

            UI.renderForecast(
                forecast,
                this.currentUnits
            );
            UI.renderHourlyForecast(
            forecast,
            this.currentUnits
);

            UI.renderFavorites(
                this.currentCity
            );

            this.updateFavoriteButton();


            /* ---------- Clear Search Input ---------- */

            const cityInput =
                document.getElementById("cityInput");

            if (cityInput) {
                cityInput.value = "";
            }


        } catch (error) {

            console.error(
                "Weather loading error:",
                error
            );

            UI.showError(
                error.message ||
                "Unable to load weather data."
            );

        } finally {

            UI.hideLoading();
        }
    },


    /* =========================================
       CITY SUGGESTIONS
       ========================================= */

    async handleCitySuggestions(query) {

        const suggestions =
            document.getElementById("suggestions");

        if (!suggestions) return;


        if (query.trim().length < 2) {

            suggestions.innerHTML = "";

            suggestions.hidden = true;

            return;
        }


        try {

            const cities =
                await WeatherService.searchCities(
                    query.trim()
                );


            suggestions.innerHTML = "";


            if (cities.length === 0) {

                suggestions.hidden = true;

                return;
            }


            cities.forEach(city => {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "suggestion-item";

                const state =
                    city.state
                        ? `, ${city.state}`
                        : "";

                button.textContent =
                    `${city.name}${state}, ${city.country}`;


                button.addEventListener(
                    "click",
                    () => {

                        const selectedCity =
                            city.name;

                        const cityInput =
                            document.getElementById(
                                "cityInput"
                            );

                        if (cityInput) {
                            cityInput.value =
                                selectedCity;
                        }

                        suggestions.innerHTML = "";

                        suggestions.hidden = true;

                        this.loadWeather(
                            selectedCity
                        );
                    }
                );


                suggestions.appendChild(button);
            });


            suggestions.hidden = false;

        } catch (error) {

            console.error(
                "City suggestion error:",
                error
            );

            suggestions.innerHTML = "";

            suggestions.hidden = true;
        }
    },


    /* =========================================
       USE USER LOCATION
       ========================================= */

    getUserLocation() {

        if (!navigator.geolocation) {

            UI.showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        UI.showLoading();


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const {
                    latitude,
                    longitude
                } = position.coords;


                try {

                    const [
                        weather,
                        forecast
                    ] = await Promise.all([

                        WeatherService
                            .getWeatherByCoordinates(
                                latitude,
                                longitude,
                                this.currentUnits
                            ),

                        WeatherService
                            .getForecastByCoordinates(
                                latitude,
                                longitude,
                                this.currentUnits
                            )

                    ]);


                    this.currentWeather =
                        weather;

                    this.currentForecast =
                        forecast;

                    this.currentCity =
                        weather.name;


                    StorageManager.saveWeatherCache(
                        weather.name,
                        {
                            current: weather,
                            forecast: forecast
                        }
                    );


                    StorageManager.saveRecentSearch(
                        weather.name
                    );


                    UI.renderCurrentWeather(
                        weather,
                        this.currentUnits
                    );

                    UI.renderForecast(
                        forecast,
                        this.currentUnits
                    );

                    UI.renderFavorites(
                        this.currentCity
                    );

                    this.updateFavoriteButton();


                } catch (error) {

                    UI.showError(
                        error.message
                    );

                } finally {

                    UI.hideLoading();
                }
            },


            (error) => {

                let message =
                    "Unable to access your location.";

                if (error.code === 1) {
                    message =
                        "Location permission was denied.";
                }

                if (error.code === 2) {
                    message =
                        "Your location could not be detected.";
                }

                if (error.code === 3) {
                    message =
                        "Location request timed out.";
                }

                UI.showError(message);
            },


            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    },


    /* =========================================
       UNIT TOGGLE
       ========================================= */

    toggleUnit() {

        if (this.currentUnits === "metric") {

            this.currentUnits = "imperial";

        } else {

            this.currentUnits = "metric";
        }


        StorageManager.saveUnit(
            this.currentUnits
        );


        if (this.currentCity) {

            this.loadWeather(
                this.currentCity
            );
        }


        this.updateUnitButton();
    },


    updateUnitButton() {

        const unitToggle =
            document.getElementById("unitToggle");

        if (!unitToggle) return;


        if (this.currentUnits === "metric") {

            unitToggle.textContent = "°C";

        } else {

            unitToggle.textContent = "°F";
        }
    },


    /* =========================================
       FAVORITES
       ========================================= */

    toggleFavorite() {

        if (!this.currentCity) return;


        if (
            StorageManager.isFavorite(
                this.currentCity
            )
        ) {

            StorageManager.removeFavorite(
                this.currentCity
            );

        } else {

            StorageManager.addFavorite(
                this.currentCity
            );
        }


        UI.renderFavorites(
            this.currentCity
        );

        this.updateFavoriteButton();
    },


    updateFavoriteButton() {

        const button =
            document.getElementById(
                "favoriteButton"
            );

        if (!button || !this.currentCity) {
            return;
        }


        const favorite =
            StorageManager.isFavorite(
                this.currentCity
            );


        button.textContent =
            favorite ? "★" : "☆";

        button.setAttribute(
            "aria-label",
            favorite
                ? "Remove from favorites"
                : "Add to favorites"
        );
    },


    /* =========================================
       THEME
       ========================================= */

    applyTheme() {

        const theme =
            StorageManager.getTheme();

        document.documentElement.dataset.theme =
            theme;

        this.updateThemeButton(theme);
    },


    toggleTheme() {

        const currentTheme =
            document.documentElement.dataset.theme ||
            "light";

        const newTheme =
            currentTheme === "light"
                ? "dark"
                : "light";


        document.documentElement.dataset.theme =
            newTheme;


        StorageManager.saveTheme(
            newTheme
        );


        this.updateThemeButton(
            newTheme
        );
    },


    updateThemeButton(theme) {

        const themeToggle =
            document.getElementById(
                "themeToggle"
            );

        if (!themeToggle) return;


        themeToggle.textContent =
            theme === "light"
                ? "🌙"
                : "☀️";
    }
};


/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        App.init();
    }
);