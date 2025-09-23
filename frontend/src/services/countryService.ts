import { apiClient } from './api';

// Country types
export interface Country {
  id: number;
  name: string;
  code: string; // VN, JP, KR, etc.
  continent: 'ASIA' | 'EUROPE' | 'AMERICA' | 'AFRICA' | 'OCEANIA';
  currency?: string;
  visaRequired: boolean;
  flagUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type Continent = 'ASIA' | 'EUROPE' | 'AMERICA' | 'AFRICA' | 'OCEANIA';

const countryService = {
  // Get all countries
  getAllCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/countries');
    return response.data;
  },

  // Get country by ID
  getCountryById: async (id: number): Promise<Country> => {
    const response = await apiClient.get<Country>(`/countries/${id}`);
    return response.data;
  },

  // Get country by code
  getCountryByCode: async (code: string): Promise<Country> => {
    const response = await apiClient.get<Country>(`/countries/code/${code}`);
    return response.data;
  },

  // Get countries by continent
  getCountriesByContinent: async (continent: string): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>(`/countries/continent/${continent}`);
    return response.data;
  },

  // Get all continents
  getAllContinents: async (): Promise<Continent[]> => {
    const response = await apiClient.get<Continent[]>('/countries/continents');
    return response.data;
  },

  // Get countries by visa requirement
  getCountriesByVisaRequirement: async (required: boolean): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>(`/countries/visa-required/${required}`);
    return response.data;
  },

  // Create country (admin only)
  createCountry: async (countryData: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Promise<Country> => {
    const response = await apiClient.post<Country>('/countries', countryData);
    return response.data;
  },

  // Update country (admin only)
  updateCountry: async (id: number, countryData: Partial<Omit<Country, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Country> => {
    const response = await apiClient.put<Country>(`/countries/${id}`, countryData);
    return response.data;
  },

  // Delete country (admin only)
  deleteCountry: async (id: number): Promise<void> => {
    await apiClient.delete(`/countries/${id}`);
  },
};

export default countryService;
