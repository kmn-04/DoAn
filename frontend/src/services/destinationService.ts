import apiClient from './api';

export interface PopularDestinationResponse {
  name: string;
  country: string;
  countryCode: string;
  slug: string;
  image: string;
  tourCount: number;
  averageRating: number;
  averagePrice: number;
  climate?: string;
  highlights: string[];
}

const destinationService = {
  getPopularDestinations: async (limit: number = 8, minTourCount: number = 2): Promise<PopularDestinationResponse[]> => {
    const response = await apiClient.get<PopularDestinationResponse[]>(
      `/destinations/popular?limit=${limit}&minTourCount=${minTourCount}`
    );
    return response.data.data || [];
  },
};

export default destinationService;
