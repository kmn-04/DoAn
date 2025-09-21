export interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  establishedYear?: number;
  rating: number;
  totalTours: number;
  totalBookings: number;
  specialties: string[];
  tours: Tour[];
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  images: string[];
  rating: number;
  totalReviews: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  category: {
    id: number;
    name: string;
    slug: string;
  };
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    activities: string[];
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerFilters {
  search?: string;
  specialty?: string;
  rating?: number;
  location?: string;
  sortBy?: 'name' | 'rating' | 'totalTours' | 'establishedYear';
  sortOrder?: 'asc' | 'desc';
}
