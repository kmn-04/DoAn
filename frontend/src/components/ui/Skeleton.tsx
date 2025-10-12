import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Shimmer effect component
export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
};

// Tour Card Skeleton
export const TourCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200 relative">
        <Shimmer className="absolute inset-0" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2">
          <Shimmer className="h-full" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full">
            <Shimmer className="h-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4">
            <Shimmer className="h-full" />
          </div>
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex space-x-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-16">
            <Shimmer className="h-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-20">
            <Shimmer className="h-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-12">
            <Shimmer className="h-full" />
          </div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-24">
            <Shimmer className="h-full" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-20">
            <Shimmer className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Avatar skeleton */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full">
          <Shimmer className="w-full h-full rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32">
            <Shimmer className="h-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-24">
            <Shimmer className="h-full" />
          </div>
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-gray-200 rounded mb-2">
              <Shimmer className="h-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto">
              <Shimmer className="h-full" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Form fields skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2">
              <Shimmer className="h-full" />
            </div>
            <div className="h-10 bg-gray-200 rounded">
              <Shimmer className="h-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking Form Skeleton
export const BookingFormSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-xl border border-stone-200 p-8 animate-pulse">
      {/* Price skeleton */}
      <div className="mb-8 pb-6 border-b border-stone-200">
        <div className="h-12 bg-gray-200 rounded w-32 mb-2">
          <Shimmer className="h-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-24">
          <Shimmer className="h-full" />
        </div>
      </div>
      
      {/* Form skeleton */}
      <div className="space-y-6">
        {/* Schedule selection skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-3">
            <Shimmer className="h-full" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded border-2">
                <Shimmer className="h-full" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Participant selection skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-3">
            <Shimmer className="h-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2">
                  <Shimmer className="h-full" />
                </div>
                <div className="h-10 bg-gray-200 rounded">
                  <Shimmer className="h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-12 bg-gray-200 rounded">
          <Shimmer className="h-full" />
        </div>
      </div>
    </div>
  );
};

// Review Skeleton
export const ReviewSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full">
          <Shimmer className="w-full h-full rounded-full" />
        </div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2">
            <Shimmer className="h-full" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-16">
            <Shimmer className="h-full" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-12">
          <Shimmer className="h-full" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full">
          <Shimmer className="h-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4">
          <Shimmer className="h-full" />
        </div>
      </div>
    </div>
  );
};

// Destination Card Skeleton
export const DestinationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-64 bg-gray-200 relative">
        <Shimmer className="absolute inset-0" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-2">
          <Shimmer className="h-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-4">
          <Shimmer className="h-full" />
        </div>
        
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-full">
              <Shimmer className="h-full" />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-24">
            <Shimmer className="h-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16">
            <Shimmer className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-24">
          <Shimmer className="h-full" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded">
          <Shimmer className="h-full w-full" />
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-2">
        <Shimmer className="h-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-20">
        <Shimmer className="h-full" />
      </div>
    </div>
  );
};

// Booking Card Skeleton
export const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2">
              <Shimmer className="h-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2">
              <Shimmer className="h-full" />
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16">
            <Shimmer className="h-full" />
          </div>
        </div>
        
        {/* Image and details */}
        <div className="flex space-x-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded">
            <Shimmer className="w-full h-full" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full">
              <Shimmer className="h-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3">
              <Shimmer className="h-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2">
              <Shimmer className="h-full" />
            </div>
          </div>
        </div>
        
        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-24">
            <Shimmer className="h-full" />
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20">
              <Shimmer className="h-full" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-16">
              <Shimmer className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;