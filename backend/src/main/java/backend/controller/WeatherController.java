package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.WeatherResponse;
import backend.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Weather", description = "Weather forecast APIs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class WeatherController extends BaseController {
    
    private final WeatherService weatherService;
    
    @GetMapping("/coordinates")
    @Operation(summary = "Get weather by coordinates", 
               description = "Get current weather and 5-day forecast by latitude and longitude")
    public ResponseEntity<ApiResponse<WeatherResponse>> getWeatherByCoordinates(
            @Parameter(description = "Latitude") @RequestParam Double latitude,
            @Parameter(description = "Longitude") @RequestParam Double longitude,
            @Parameter(description = "Location name") @RequestParam(required = false) String location) {
        
        try {
            log.info("🌤️ Weather request: lat={}, lon={}, location={}", latitude, longitude, location);
            
            String locationName = location != null ? location : "Unknown";
            WeatherResponse weather = weatherService.getWeatherData(latitude, longitude, locationName);
            
            return ResponseEntity.ok(success("Weather data retrieved successfully", weather));
            
        } catch (Exception e) {
            log.error("❌ Error fetching weather: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to fetch weather data: " + e.getMessage()));
        }
    }
    
    @GetMapping("/city")
    @Operation(summary = "Get weather by city name", 
               description = "Get current weather and 5-day forecast by city name")
    public ResponseEntity<ApiResponse<WeatherResponse>> getWeatherByCity(
            @Parameter(description = "City name") @RequestParam String cityName) {
        
        try {
            log.info("🌤️ Weather request for city: {}", cityName);
            
            WeatherResponse weather = weatherService.getWeatherByCity(cityName);
            
            return ResponseEntity.ok(success("Weather data retrieved successfully", weather));
            
        } catch (Exception e) {
            log.error("❌ Error fetching weather by city: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to fetch weather data: " + e.getMessage()));
        }
    }
    
    @PostMapping("/clear-cache")
    @Operation(summary = "Clear weather cache", 
               description = "Clear all cached weather data")
    public ResponseEntity<ApiResponse<Void>> clearCache() {
        try {
            weatherService.clearCache();
            return ResponseEntity.ok(success("Weather cache cleared successfully"));
        } catch (Exception e) {
            log.error("❌ Error clearing cache: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to clear cache: " + e.getMessage()));
        }
    }
}

