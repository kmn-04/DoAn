package backend.service;

import backend.dto.response.WeatherResponse;

/**
 * Service for fetching weather data from OpenWeatherMap API
 */
public interface WeatherService {
    
    /**
     * Get weather data by coordinates
     * 
     * @param latitude Latitude of the location
     * @param longitude Longitude of the location
     * @param locationName Name of the location for display
     * @return Weather data including current weather and forecast
     */
    WeatherResponse getWeatherData(Double latitude, Double longitude, String locationName);
    
    /**
     * Get weather data by city name
     * 
     * @param cityName Name of the city
     * @return Weather data including current weather and forecast
     */
    WeatherResponse getWeatherByCity(String cityName);
    
    /**
     * Clear weather cache
     */
    void clearCache();
}

