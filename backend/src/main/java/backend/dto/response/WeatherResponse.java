package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeatherResponse {
    private CurrentWeather current;
    private List<DailyForecast> forecast;
    private List<HourlyForecast> hourlyForecast;
    private String location;
    private LocalDateTime lastUpdated;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentWeather {
        private Integer temperature;
        private Integer feelsLike;
        private String description;
        private String icon;
        private Integer humidity;
        private Integer windSpeed;
        private Integer pressure;
        private Integer visibility;
        private Long sunrise;
        private Long sunset;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyForecast {
        private String date;
        private String dayName;
        private Temperature temperature;
        private String description;
        private String icon;
        private Integer humidity;
        private Integer windSpeed;
        private Double precipitation;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Temperature {
        private Integer min;
        private Integer max;
        private Integer day;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyForecast {
        private String time; // HH:mm format
        private String dateTime; // Full datetime
        private Integer temperature;
        private String description;
        private String icon;
        private Integer humidity;
        private Integer windSpeed;
        private Double precipitation;
    }
}

