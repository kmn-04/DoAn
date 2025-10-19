import { apiClient } from './api';

// Use backend API instead of direct OpenWeatherMap calls for better security
const USE_BACKEND_API = true;

// Weather data interfaces
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  sunrise?: number;
  sunset?: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  temperature: {
    min: number;
    max: number;
    day: number;
  };
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface HourlyForecast {
  time: string;
  dateTime: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
  hourlyForecast?: HourlyForecast[];
  location: string;
  lastUpdated: Date;
}

// Cache configuration (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();

/**
 * Get weather icon URL from OpenWeatherMap
 */
export const getWeatherIconUrl = (icon: string, size: '2x' | '4x' = '2x'): string => {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
};

/**
 * Convert temperature from Kelvin to Celsius
 */
const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

/**
 * Get day name from date string
 */
const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
  
  return date.toLocaleDateString('vi-VN', { weekday: 'long' });
};

/**
 * Get current weather by coordinates
 */
export const getCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<CurrentWeather> => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_API_KEY,
        units: 'metric', // Use Celsius
        lang: 'vi' // Vietnamese language
      }
    });

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      pressure: data.main.pressure,
      visibility: Math.round(data.visibility / 1000), // Convert to km
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Không thể lấy thông tin thời tiết hiện tại');
  }
};

/**
 * Get weather forecast by coordinates (5 days, 3-hour intervals)
 */
export const getWeatherForecast = async (
  latitude: number,
  longitude: number,
  days: number = 5
): Promise<DailyForecast[]> => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    const forecastData = response.data.list;
    
    // Group forecast by day
    const dailyData = new Map<string, any[]>();
    
    forecastData.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)!.push(item);
    });

    // Process daily forecasts
    const forecasts: DailyForecast[] = [];
    let count = 0;
    
    for (const [date, items] of dailyData.entries()) {
      if (count >= days) break;
      
      // Calculate min, max, and average temperature
      const temps = items.map(item => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      
      // Get most common weather description
      const descriptions = items.map(item => item.weather[0].description);
      const mostCommonDesc = descriptions.sort((a, b) =>
        descriptions.filter(v => v === a).length - descriptions.filter(v => v === b).length
      ).pop()!;
      
      // Get icon (from midday forecast)
      const middayForecast = items.find(item => item.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
      
      forecasts.push({
        date,
        dayName: getDayName(date),
        temperature: {
          min: Math.round(minTemp),
          max: Math.round(maxTemp),
          day: Math.round(avgTemp)
        },
        description: mostCommonDesc,
        icon: middayForecast.weather[0].icon,
        humidity: Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length),
        windSpeed: Math.round(items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length * 3.6),
        precipitation: items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0)
      });
      
      count++;
    }
    
    return forecasts;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Không thể lấy dự báo thời tiết');
  }
};

/**
 * Get complete weather data (via backend API for security)
 */
export const getWeatherData = async (
  latitude: number,
  longitude: number,
  locationName: string
): Promise<WeatherData> => {
  if (USE_BACKEND_API) {
    // Call backend API (cached on server-side)
    try {
      console.log('🌤️ Fetching weather data from backend...');
      
      const response = await apiClient.get('/weather/coordinates', {
        params: {
          latitude,
          longitude,
          location: locationName
        }
      });
      
      const data = response.data.data;
      
      // Convert to frontend format
      return {
        current: data.current,
        forecast: data.forecast,
        hourlyForecast: data.hourlyForecast || [],
        location: data.location,
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error('Error fetching weather from backend:', error);
      throw new Error('Không thể lấy thông tin thời tiết');
    }
  }
  
  // Fallback: Direct API call (not used if USE_BACKEND_API = true)
  // Check cache
  const cacheKey = `${latitude},${longitude}`;
  const cached = weatherCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ Using cached weather data');
    return cached.data;
  }
  
  try {
    console.log('🌤️ Fetching fresh weather data...');
    
    // Fetch both current and forecast in parallel
    const [current, forecast] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      getWeatherForecast(latitude, longitude, 5)
    ]);
    
    const weatherData: WeatherData = {
      current,
      forecast,
      location: locationName,
      lastUpdated: new Date()
    };
    
    // Update cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Get weather by city name (fallback if no coordinates)
 */
export const getWeatherByCity = async (cityName: string): Promise<WeatherData> => {
  try {
    // First, get coordinates from city name
    const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: cityName,
        limit: 1,
        appid: WEATHER_API_KEY
      }
    });
    
    if (geoResponse.data.length === 0) {
      throw new Error('Không tìm thấy thành phố');
    }
    
    const { lat, lon, name } = geoResponse.data[0];
    return getWeatherData(lat, lon, name);
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw new Error('Không thể lấy thông tin thời tiết');
  }
};

/**
 * Get weather recommendation based on conditions
 */
export const getWeatherRecommendation = (weather: CurrentWeather): {
  clothing: string[];
  activities: string[];
  alerts: string[];
} => {
  const recommendations = {
    clothing: [] as string[],
    activities: [] as string[],
    alerts: [] as string[]
  };
  
  const temp = weather.temperature;
  
  // Clothing recommendations
  if (temp < 15) {
    recommendations.clothing.push('Áo khoác ấm');
    recommendations.clothing.push('Quần dài');
  } else if (temp < 25) {
    recommendations.clothing.push('Áo nhẹ');
    recommendations.clothing.push('Quần dài hoặc short');
  } else {
    recommendations.clothing.push('Quần áo thoáng mát');
    recommendations.clothing.push('Mũ chống nắng');
  }
  
  // UV protection
  if (temp > 25) {
    recommendations.clothing.push('Kem chống nắng SPF 50+');
  }
  
  // Rain gear
  if (weather.description.includes('mưa') || weather.humidity > 80) {
    recommendations.clothing.push('Áo mưa hoặc ô');
  }
  
  // Activity recommendations
  if (temp >= 20 && temp <= 30 && weather.humidity < 70) {
    recommendations.activities.push('Thời tiết lý tưởng cho các hoạt động ngoài trời');
  }
  
  if (weather.description.includes('nắng') || weather.description.includes('quang đãng')) {
    recommendations.activities.push('Tham quan, chụp ảnh');
  }
  
  // Weather alerts
  if (temp > 35) {
    recommendations.alerts.push('⚠️ Nhiệt độ cao, hạn chế hoạt động ngoài trời giữa trưa');
  }
  
  if (temp < 10) {
    recommendations.alerts.push('⚠️ Thời tiết lạnh, chuẩn bị áo ấm');
  }
  
  if (weather.windSpeed > 40) {
    recommendations.alerts.push('⚠️ Gió mạnh, chú ý an toàn');
  }
  
  if (weather.description.includes('mưa')) {
    recommendations.alerts.push('⚠️ Có mưa, chuẩn bị đồ chống mưa');
  }
  
  return recommendations;
};

// Export default object for backward compatibility
const weatherService = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherData,
  getWeatherByCity,
  getWeatherIconUrl,
  getWeatherRecommendation
};

export default weatherService;

