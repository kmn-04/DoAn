// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Re-export auth types
export * from './auth';
export * from './partner';

// Country Types
export interface Country {
  id: number;
  name: string;
  code: string; // VN, JP, KR, etc.
  continent: 'Asia' | 'Europe' | 'America' | 'Africa' | 'Oceania';
  currency?: string;
  visaRequired: boolean;
  flagUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Tour Types
export interface Tour {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  maxParticipants: number;
  location: string;
  tourType: 'domestic' | 'international';
  country?: Country;
  visaInfo?: string;
  flightIncluded: boolean;
  itinerary?: string;
  includes?: string;
  excludes?: string;
  notes?: string;
  isFeatured: boolean;
  status: 'Active' | 'Inactive' | 'Draft';
  category: Category;
  targetAudiences: TargetAudience[];
  images: TourImage[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface TargetAudience {
  id: number;
  name: string;
  description?: string;
}

export interface TourImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// Booking Types
export interface Booking {
  id: number;
  tour: Tour;
  user: User;
  bookingDate: string;
  tourDate: string;
  numberOfParticipants: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  specialRequests?: string;
  customerInfo: CustomerInfo;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  emergencyContact: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: 'CreditCard' | 'BankTransfer' | 'Cash';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  paidAt?: string;
}

// Review Types
export interface Review {
  id: number;
  tour: Tour;
  user: User;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Types
export interface TourSearchParams {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  location?: string;
  tourType?: 'domestic' | 'international';
  continent?: string;
  countryId?: number;
  visaRequired?: boolean;
  flightIncluded?: boolean;
  startDate?: string;
  endDate?: string;
  participants?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// Tour Filters for UI Components
export interface TourFilters {
  search?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  duration?: string;
  location?: string;
  tourType?: 'domestic' | 'international';
  continent?: string;
  country?: string;
  visaRequired?: boolean;
  flightIncluded?: boolean;
  rating?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface TourCreateRequest {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  maxParticipants: number;
  location: string;
  tourType: 'domestic' | 'international';
  countryId?: number;
  visaInfo?: string;
  flightIncluded: boolean;
  itinerary?: string;
  includes?: string;
  excludes?: string;
  notes?: string;
  categoryId: number;
  targetAudienceIds: number[];
  isFeatured: boolean;
  status: 'Active' | 'Inactive' | 'Draft';
}

export interface BookingCreateRequest {
  tourId: number;
  tourDate: string;
  numberOfParticipants: number;
  specialRequests?: string;
  customerInfo: CustomerInfo;
}

// Dashboard Types
export interface DashboardStats {
  totalTours: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyRevenue: number[];
  topTours: Tour[];
  recentBookings: Booking[];
}
