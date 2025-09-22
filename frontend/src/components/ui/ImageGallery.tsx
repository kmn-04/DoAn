import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { PartnerImage } from '../../types';

interface ImageGalleryProps {
  images: PartnerImage[];
  title?: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, className = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter gallery images only
  const galleryImages = images.filter(img => img.imageType === 'gallery');
  const coverImage = images.find(img => img.imageType === 'cover');
  
  // Combine cover + gallery for display
  const displayImages = coverImage ? [coverImage, ...galleryImages] : galleryImages;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') previousImage();
  };

  if (displayImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Không có ảnh</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-4 gap-2">
        {/* Main Image (first image, spans 2x2) */}
        <div className="col-span-2 row-span-2">
          <div 
            className="relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={displayImages[0]?.imageUrl}
              alt={displayImages[0]?.altText || 'Main image'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                Xem ảnh lớn
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Images Grid */}
        {displayImages.slice(1, 5).map((image, index) => (
          <div key={image.id} className="relative">
            <div 
              className="h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index + 1)}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || `Image ${index + 2}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
            </div>
          </div>
        ))}

        {/* Show More Button if more than 5 images */}
        {displayImages.length > 5 && (
          <div 
            className="h-32 bg-gray-800 bg-opacity-75 rounded-lg flex items-center justify-center cursor-pointer hover:bg-opacity-85 transition-colors"
            onClick={() => openLightbox(4)}
          >
            <div className="text-center text-white">
              <span className="text-2xl font-bold">+{displayImages.length - 4}</span>
              <p className="text-sm">ảnh khác</p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-screen mx-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); previousImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="relative">
              <img
                src={displayImages[currentIndex]?.imageUrl}
                alt={displayImages[currentIndex]?.altText || 'Gallery image'}
                className="max-w-full max-h-screen object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {displayImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
