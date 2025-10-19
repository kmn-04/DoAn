package backend.service.impl;

import backend.dto.response.WeatherResponse;
import backend.service.WeatherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherServiceImpl implements WeatherService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${weather.api.key:384ec2b8713781d926f1826d65dea929}")
    private String apiKey;
    
    @Value("${weather.api.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;
    
    private static final int CACHE_DURATION_MINUTES = 30;
    
    @Override
    @Cacheable(value = "weatherData", key = "#latitude + ',' + #longitude")
    public WeatherResponse getWeatherData(Double latitude, Double longitude, String locationName) {
        log.info("🌤️ Fetching weather data for coordinates: {}, {}", latitude, longitude);
        
        try {
            // Fetch current weather
            WeatherResponse.CurrentWeather current = getCurrentWeather(latitude, longitude);
            
            // Fetch forecast (includes both daily and hourly)
            List<WeatherResponse.DailyForecast> forecast = getWeatherForecast(latitude, longitude);
            
            // Get hourly forecast for next 24 hours
            List<WeatherResponse.HourlyForecast> hourlyForecast = getHourlyForecast(latitude, longitude);
            
            WeatherResponse response = new WeatherResponse();
            response.setCurrent(current);
            response.setForecast(forecast);
            response.setHourlyForecast(hourlyForecast);
            response.setLocation(locationName);
            response.setLastUpdated(LocalDateTime.now());
            
            log.info("✅ Weather data fetched successfully for {}", locationName);
            return response;
            
        } catch (Exception e) {
            log.error("❌ Error fetching weather data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch weather data: " + e.getMessage());
        }
    }
    
    @Override
    @Cacheable(value = "weatherData", key = "#cityName")
    public WeatherResponse getWeatherByCity(String cityName) {
        log.info("🌤️ Fetching weather data for city: {}", cityName);
        
        try {
            // Get coordinates from city name first
            String geoUrl = String.format(
                "https://api.openweathermap.org/geo/1.0/direct?q=%s,VN&limit=1&appid=%s",
                cityName, apiKey
            );
            
            JsonNode[] geoResponse = restTemplate.getForObject(geoUrl, JsonNode[].class);
            
            if (geoResponse == null || geoResponse.length == 0) {
                throw new RuntimeException("City not found: " + cityName);
            }
            
            JsonNode location = geoResponse[0];
            double lat = location.get("lat").asDouble();
            double lon = location.get("lon").asDouble();
            String name = location.has("local_names") && location.get("local_names").has("vi")
                ? location.get("local_names").get("vi").asText()
                : location.get("name").asText();
            
            return getWeatherData(lat, lon, name);
            
        } catch (Exception e) {
            log.error("❌ Error fetching weather by city: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch weather by city: " + e.getMessage());
        }
    }
    
    @Override
    @CacheEvict(value = "weatherData", allEntries = true)
    public void clearCache() {
        log.info("🗑️ Clearing weather cache");
    }
    
    /**
     * Get current weather from OpenWeatherMap API
     */
    private WeatherResponse.CurrentWeather getCurrentWeather(Double latitude, Double longitude) {
        String url = String.format(
            "%s/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=vi",
            baseUrl, latitude, longitude, apiKey
        );
        
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response == null) {
                throw new RuntimeException("Empty response from weather API");
            }
            
            WeatherResponse.CurrentWeather current = new WeatherResponse.CurrentWeather();
            current.setTemperature((int) Math.round(response.get("main").get("temp").asDouble()));
            current.setFeelsLike((int) Math.round(response.get("main").get("feels_like").asDouble()));
            current.setDescription(response.get("weather").get(0).get("description").asText());
            current.setIcon(response.get("weather").get(0).get("icon").asText());
            current.setHumidity(response.get("main").get("humidity").asInt());
            current.setWindSpeed((int) Math.round(response.get("wind").get("speed").asDouble() * 3.6)); // m/s to km/h
            current.setPressure(response.get("main").get("pressure").asInt());
            current.setVisibility((int) Math.round(response.get("visibility").asInt() / 1000.0)); // m to km
            
            if (response.has("sys")) {
                current.setSunrise(response.get("sys").get("sunrise").asLong());
                current.setSunset(response.get("sys").get("sunset").asLong());
            }
            
            return current;
            
        } catch (Exception e) {
            log.error("Error fetching current weather: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch current weather", e);
        }
    }
    
    /**
     * Get weather forecast from OpenWeatherMap API
     */
    private List<WeatherResponse.DailyForecast> getWeatherForecast(Double latitude, Double longitude) {
        String url = String.format(
            "%s/forecast?lat=%s&lon=%s&appid=%s&units=metric&lang=vi",
            baseUrl, latitude, longitude, apiKey
        );
        
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response == null || !response.has("list")) {
                throw new RuntimeException("Empty forecast response");
            }
            
            JsonNode forecastList = response.get("list");
            
            // Group forecast by day
            Map<String, List<JsonNode>> dailyData = new LinkedHashMap<>();
            
            for (JsonNode item : forecastList) {
                String dateTime = item.get("dt_txt").asText();
                String date = dateTime.split(" ")[0];
                
                dailyData.computeIfAbsent(date, k -> new ArrayList<>()).add(item);
            }
            
            // Process daily forecasts
            List<WeatherResponse.DailyForecast> forecasts = new ArrayList<>();
            int count = 0;
            
            for (Map.Entry<String, List<JsonNode>> entry : dailyData.entrySet()) {
                if (count >= 5) break;
                
                String date = entry.getKey();
                List<JsonNode> items = entry.getValue();
                
                // Calculate min, max, avg temperature
                List<Double> temps = new ArrayList<>();
                for (JsonNode item : items) {
                    temps.add(item.get("main").get("temp").asDouble());
                }
                
                int minTemp = (int) Math.round(temps.stream().min(Double::compare).orElse(0.0));
                int maxTemp = (int) Math.round(temps.stream().max(Double::compare).orElse(0.0));
                int avgTemp = (int) Math.round(temps.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
                
                // Get most common weather description
                Map<String, Integer> descCount = new HashMap<>();
                for (JsonNode item : items) {
                    String desc = item.get("weather").get(0).get("description").asText();
                    descCount.put(desc, descCount.getOrDefault(desc, 0) + 1);
                }
                String mostCommonDesc = descCount.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("");
                
                // Get icon from midday forecast
                JsonNode middayForecast = items.stream()
                    .filter(item -> item.get("dt_txt").asText().contains("12:00:00"))
                    .findFirst()
                    .orElse(items.get(items.size() / 2));
                
                String icon = middayForecast.get("weather").get(0).get("icon").asText();
                
                // Calculate average humidity and wind speed
                int avgHumidity = (int) items.stream()
                    .mapToInt(item -> item.get("main").get("humidity").asInt())
                    .average()
                    .orElse(0);
                
                int avgWindSpeed = (int) Math.round(items.stream()
                    .mapToDouble(item -> item.get("wind").get("speed").asDouble())
                    .average()
                    .orElse(0) * 3.6); // m/s to km/h
                
                // Calculate precipitation
                double precipitation = items.stream()
                    .mapToDouble(item -> {
                        if (item.has("rain") && item.get("rain").has("3h")) {
                            return item.get("rain").get("3h").asDouble();
                        }
                        return 0.0;
                    })
                    .sum();
                
                // Get day name
                String dayName = getDayName(date);
                
                WeatherResponse.DailyForecast forecast = new WeatherResponse.DailyForecast();
                forecast.setDate(date);
                forecast.setDayName(dayName);
                
                WeatherResponse.Temperature temperature = new WeatherResponse.Temperature();
                temperature.setMin(minTemp);
                temperature.setMax(maxTemp);
                temperature.setDay(avgTemp);
                forecast.setTemperature(temperature);
                
                forecast.setDescription(mostCommonDesc);
                forecast.setIcon(icon);
                forecast.setHumidity(avgHumidity);
                forecast.setWindSpeed(avgWindSpeed);
                forecast.setPrecipitation(precipitation);
                
                forecasts.add(forecast);
                count++;
            }
            
            return forecasts;
            
        } catch (Exception e) {
            log.error("Error fetching forecast: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch forecast", e);
        }
    }
    
    /**
     * Get hourly forecast for next 24 hours (3-hour intervals)
     */
    private List<WeatherResponse.HourlyForecast> getHourlyForecast(Double latitude, Double longitude) {
        String url = String.format(
            "%s/forecast?lat=%s&lon=%s&appid=%s&units=metric&lang=vi&cnt=8",
            baseUrl, latitude, longitude, apiKey
        );
        
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response == null || !response.has("list")) {
                return new ArrayList<>();
            }
            
            JsonNode forecastList = response.get("list");
            List<WeatherResponse.HourlyForecast> hourlyForecasts = new ArrayList<>();
            
            for (JsonNode item : forecastList) {
                WeatherResponse.HourlyForecast hourly = new WeatherResponse.HourlyForecast();
                
                String dateTime = item.get("dt_txt").asText(); // Format: "2025-10-20 12:00:00"
                String time = dateTime.split(" ")[1].substring(0, 5); // Extract "12:00"
                
                hourly.setTime(time);
                hourly.setDateTime(dateTime);
                hourly.setTemperature((int) Math.round(item.get("main").get("temp").asDouble()));
                hourly.setDescription(item.get("weather").get(0).get("description").asText());
                hourly.setIcon(item.get("weather").get(0).get("icon").asText());
                hourly.setHumidity(item.get("main").get("humidity").asInt());
                hourly.setWindSpeed((int) Math.round(item.get("wind").get("speed").asDouble() * 3.6));
                
                // Precipitation
                double precip = 0.0;
                if (item.has("rain") && item.get("rain").has("3h")) {
                    precip = item.get("rain").get("3h").asDouble();
                } else if (item.has("snow") && item.get("snow").has("3h")) {
                    precip = item.get("snow").get("3h").asDouble();
                }
                hourly.setPrecipitation(precip);
                
                hourlyForecasts.add(hourly);
            }
            
            return hourlyForecasts;
            
        } catch (Exception e) {
            log.error("Error fetching hourly forecast: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Get localized day name
     */
    private String getDayName(String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            
            if (date.equals(today)) return "Hôm nay";
            if (date.equals(tomorrow)) return "Ngày mai";
            
            return date.getDayOfWeek().getDisplayName(TextStyle.FULL, new Locale("vi", "VN"));
        } catch (Exception e) {
            return dateString;
        }
    }
}

