/**
 * Geocoding utility - Tự động lấy coordinates từ tên địa điểm
 */

const WEATHER_API_KEY = '384ec2b8713781d926f1826d65dea929';

export interface Coordinates {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Lấy coordinates từ tên địa điểm
 * Sử dụng OpenWeatherMap Geocoding API
 */
export const getCoordinatesFromLocation = async (locationName: string): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)},VN&limit=1&appid=${WEATHER_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const location = data[0];
      return {
        latitude: location.lat,
        longitude: location.lon,
        displayName: location.local_names?.vi || location.name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

/**
 * Fallback: Extract city name from destination string
 * VD: "Hà Nội - Hạ Long - Ninh Bình" → "Hạ Long"
 */
export const extractMainDestination = (destination: string): string => {
  if (!destination) return '';
  
  // Tách theo dấu "-" và lấy phần đầu tiên
  const parts = destination.split('-').map(s => s.trim());
  
  // Ưu tiên lấy phần có tên điểm đến nổi tiếng
  const knownDestinations = [
    'Hạ Long', 'Hà Nội', 'Đà Nẵng', 'Hội An', 'Nha Trang',
    'Đà Lạt', 'Phú Quốc', 'Sapa', 'Ninh Bình', 'Huế',
    'TP. Hồ Chí Minh', 'Sài Gòn', 'Vũng Tàu', 'Cần Thơ'
  ];
  
  for (const part of parts) {
    for (const known of knownDestinations) {
      if (part.includes(known) || known.includes(part)) {
        return known;
      }
    }
  }
  
  // Nếu không tìm thấy, lấy phần đầu tiên
  return parts[0] || destination;
};

/**
 * Helper: Lấy coordinates với fallback
 */
export const getCoordinatesWithFallback = async (
  destination: string,
  latitude?: number,
  longitude?: number
): Promise<Coordinates | null> => {
  // Nếu đã có coordinates, sử dụng luôn
  if (latitude && longitude) {
    return {
      latitude,
      longitude,
      displayName: destination
    };
  }
  
  // Nếu chưa có, tự động lấy từ tên địa điểm
  const mainDestination = extractMainDestination(destination);
  return await getCoordinatesFromLocation(mainDestination);
};

export default {
  getCoordinatesFromLocation,
  extractMainDestination,
  getCoordinatesWithFallback
};

