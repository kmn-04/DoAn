import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { PartnerImage } from '../../types';

interface ImageCarouselProps {
  images: PartnerImage[];
  alt?: string;
  className?: string;
  imageClassName?: string;
  showCounter?: boolean;
  showNavigation?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  alt, 
  className = '',
  imageClassName = '',
  showCounter = true,
  showNavigation = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter gallery + cover images for carousel
  const carouselImages = images.filter(img => 
    img.imageType === 'gallery' || img.imageType === 'cover'
  ).sort((a, b) => a.displayOrder - b.displayOrder);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  if (!carouselImages || carouselImages.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Không có ảnh</span>
      </div>
    );
  }

  const currentImage = carouselImages[currentIndex];

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <img
        src={currentImage.imageUrl}
        alt={currentImage.altText || alt || 'Image'}
        className={`w-full h-full object-cover ${imageClassName}`}
      />
      
      {/* Navigation Arrows */}
      {showNavigation && carouselImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {showCounter && carouselImages.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {currentIndex + 1} / {carouselImages.length}
        </div>
      )}

      {/* Dot Indicators */}
      {carouselImages.length > 1 && carouselImages.length <= 5 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
