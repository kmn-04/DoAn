export interface PartnerImage {
  id: number;
  imageUrl: string;
  imageType: 'cover' | 'logo' | 'gallery';
  displayOrder: number;
  altText?: string;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: 'Hotel' | 'Restaurant';
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  avatarUrl?: string; // Legacy single image
  rating: number;
  totalReviews: number;
  totalTours: number;
  totalBookings: number;
  specialties: string[];
  images: PartnerImage[]; // New multiple images
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
  type?: string;
  specialty?: string; // Deprecated - use specialties array
  specialties?: string[];
  rating?: number;
  location?: string; // Deprecated - use locations array  
  locations?: string[];
  sortBy?: 'name' | 'rating' | 'rating-desc' | 'totalTours' | 'establishedYear';
  sortOrder?: 'asc' | 'desc';
}
