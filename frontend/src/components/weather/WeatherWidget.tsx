import React, { useState, useEffect } from 'react';
import { 
  CloudIcon, 
  SunIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import weatherService from '../../services/weatherService';
import type { 
  WeatherData, 
  CurrentWeather 
} from '../../services/weatherService';
import { getWeatherIconUrl } from '../../services/weatherService';

interface WeatherWidgetProps {
  tourId: number;
  destination: string;
  latitude?: number;
  longitude?: number;
  weatherEnabled?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  tourId,
  destination,
  latitude,
  longitude,
  weatherEnabled = true
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState(destination);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!weatherEnabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Kiểm tra xem đã có coordinates chưa
        if (!latitude || !longitude) {
          console.warn('⚠️ Tour chưa có coordinates, không thể hiển thị thời tiết');
          setError('Thông tin thời tiết chưa có sẵn cho điểm đến này');
          setLoading(false);
          return;
        }

        setLocationName(destination);

        // Lấy dữ liệu thời tiết từ backend (sử dụng coordinates có sẵn)
        const data = await weatherService.getWeatherData(
          latitude,
          longitude,
          destination
        );

        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Không thể tải thông tin thời tiết');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [tourId, destination, latitude, longitude, weatherEnabled]);

  if (!weatherEnabled || error) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 p-6 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-stone-200 rounded mb-4"></div>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-stone-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const { current, forecast, hourlyForecast } = weatherData;
  const recommendations = weatherService.getWeatherRecommendation(current);

  return (
    <div className="space-y-6">
      {/* Hourly Forecast for today */}
      {hourlyForecast && hourlyForecast.length > 0 && (
        <div className="bg-white border border-stone-200 p-6">
          <h4 className="text-lg font-medium text-slate-900 mb-4 tracking-tight">
            📅 Dự báo theo giờ (24h tới)
          </h4>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {hourlyForecast.slice(0, 8).map((hour, index) => (
              <div 
                key={index}
                className="bg-stone-50 p-3 text-center hover:bg-stone-100 transition-colors border border-stone-200"
              >
                <div className="text-sm font-medium text-slate-900 mb-2">
                  {hour.time}
                </div>
                <img 
                  src={getWeatherIconUrl(hour.icon)}
                  alt={hour.description}
                  className="w-10 h-10 mx-auto"
                />
                <div className="text-lg font-medium text-slate-900 mt-2">
                  {hour.temperature}°
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  💧 {hour.humidity}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Current Weather */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" 
             style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight mb-1">
                Thời tiết tại {locationName}
              </h3>
              <p className="text-sm text-stone-300">
                Cập nhật: {new Date(weatherData.lastUpdated).toLocaleTimeString('vi-VN')}
              </p>
            </div>
            <CloudIcon className="h-8 w-8 text-white opacity-50" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={getWeatherIconUrl(current.icon, '4x')} 
                alt={current.description}
                className="w-20 h-20"
              />
              <div>
                <div className="text-5xl font-light tracking-tight">
                  {current.temperature}°C
                </div>
                <div className="text-base capitalize text-stone-300 mt-1">
                  {current.description}
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-sm text-stone-300">
                Cảm giác như <span className="font-medium text-white">{current.feelsLike}°C</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <div className="text-stone-400">Độ ẩm</div>
                  <div className="font-medium">{current.humidity}%</div>
                </div>
                <div>
                  <div className="text-stone-400">Gió</div>
                  <div className="font-medium">{current.windSpeed} km/h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white border border-stone-200 p-6">
        <h4 className="text-lg font-medium text-slate-900 mb-4 tracking-tight">
          Dự báo 5 ngày tới
        </h4>
        
        <div className="grid grid-cols-5 gap-3">
          {forecast.slice(0, 5).map((day, index) => (
            <div 
              key={index}
              className="bg-stone-50 p-3 text-center hover:bg-stone-100 transition-colors border border-stone-200"
            >
              <div className="text-sm font-medium text-slate-900 mb-2">
                {day.dayName}
              </div>
              <img 
                src={getWeatherIconUrl(day.icon, '2x')} 
                alt={day.description}
                className="w-12 h-12 mx-auto"
              />
              <div className="text-xs capitalize text-stone-600 mb-2 line-clamp-2">
                {day.description}
              </div>
              <div className="space-y-1">
                <div className="text-lg font-medium text-slate-900">
                  {day.temperature.max}°
                </div>
                <div className="text-sm text-stone-500">
                  {day.temperature.min}°
                </div>
              </div>
              <div className="text-xs text-stone-500 mt-2">
                💧 {day.humidity}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Recommendations */}
      {(recommendations.clothing.length > 0 || recommendations.alerts.length > 0) && (
        <div className="bg-amber-50 border-l-4 p-6 space-y-4" 
             style={{ borderLeftColor: '#D4AF37' }}>
          {/* Alerts */}
          {recommendations.alerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-900">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="font-medium text-sm">Lưu ý thời tiết</span>
              </div>
              <div className="space-y-1">
                {recommendations.alerts.map((alert, index) => (
                  <div key={index} className="text-sm text-amber-800">
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clothing Recommendations */}
          {recommendations.clothing.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900">
                <SunIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="font-medium text-sm">Chuẩn bị</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recommendations.clothing.map((item, index) => (
                  <div 
                    key={index}
                    className="text-sm text-slate-700 bg-white px-3 py-2 border border-stone-200"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Recommendations */}
          {recommendations.activities.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">
                Hoạt động phù hợp
              </div>
              <div className="space-y-1">
                {recommendations.activities.map((activity, index) => (
                  <div key={index} className="text-sm text-slate-700">
                    🎯 {activity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Weather Info */}
      <div className="bg-stone-50 border border-stone-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-stone-600 mb-1">Áp suất</div>
            <div className="text-sm font-medium text-slate-900">
              {current.pressure} hPa
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 mb-1">Tầm nhìn</div>
            <div className="text-sm font-medium text-slate-900">
              {current.visibility} km
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 mb-1">Độ ẩm</div>
            <div className="text-sm font-medium text-slate-900">
              {current.humidity}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;

