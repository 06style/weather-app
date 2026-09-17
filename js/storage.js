/* =========================================
   WEATHERPULSE - LOCAL STORAGE
   File: storage.js
   Responsibility: Browser localStorage
   ========================================= */

const StorageManager = {

    /* ---------- Weather Cache ---------- */

    saveWeatherCache(city, data) {
        const cache = {
            city: city.toLowerCase(),
            data: data,
            timestamp: Date.now()
        };

        localStorage.setItem(
            `weatherCache_${city.toLowerCase()}`,
            JSON.stringify(cache)
        );
    },

    getWeatherCache(city) {
        const cached = localStorage.getItem(
            `weatherCache_${city.toLowerCase()}`
        );

        if (!cached) {
            return null;
        }

        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error("Cache read error:", error);
            return null;
        }
    },


    /* ---------- Recent Searches ---------- */

    getRecentSearches() {
        const searches = localStorage.getItem("weatherRecentSearches");

        if (!searches) {
            return [];
        }

        try {
            return JSON.parse(searches);
        } catch (error) {
            console.error("Recent searches read error:", error);
            return [];
        }
    },

    saveRecentSearch(city) {
        let searches = this.getRecentSearches();

        searches = searches.filter(
            item => item.toLowerCase() !== city.toLowerCase()
        );

        searches.unshift(city);

        searches = searches.slice(0, 5);

        localStorage.setItem(
            "weatherRecentSearches",
            JSON.stringify(searches)
        );
    },


    /* ---------- Favorite Cities ---------- */

    getFavorites() {
        const favorites = localStorage.getItem("weatherFavorites");

        if (!favorites) {
            return [];
        }

        try {
            return JSON.parse(favorites);
        } catch (error) {
            console.error("Favorites read error:", error);
            return [];
        }
    },

    addFavorite(city) {
        let favorites = this.getFavorites();

        const exists = favorites.some(
            item => item.toLowerCase() === city.toLowerCase()
        );

        if (!exists) {
            favorites.push(city);
        }

        localStorage.setItem(
            "weatherFavorites",
            JSON.stringify(favorites)
        );
    },

    removeFavorite(city) {
        let favorites = this.getFavorites();

        favorites = favorites.filter(
            item => item.toLowerCase() !== city.toLowerCase()
        );

        localStorage.setItem(
            "weatherFavorites",
            JSON.stringify(favorites)
        );
    },

    isFavorite(city) {
        const favorites = this.getFavorites();

        return favorites.some(
            item => item.toLowerCase() === city.toLowerCase()
        );
    },


    /* ---------- Unit Preference ---------- */

    saveUnit(unit) {
        localStorage.setItem("weatherUnit", unit);
    },

    getUnit() {
        return localStorage.getItem("weatherUnit") || "metric";
    },


    /* ---------- Theme Preference ---------- */

    saveTheme(theme) {
        localStorage.setItem("weatherTheme", theme);
    },

    getTheme() {
        return localStorage.getItem("weatherTheme") || "light";
    },


    /* ---------- Clear Cache ---------- */

    clearWeatherCache() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("weatherCache_")) {
                localStorage.removeItem(key);
            }
        });
    }
};