import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextModalImage = () => {
    setModalIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="bg-stone-100 rounded-none h-96 flex items-center justify-center border border-stone-200">
        <PhotoIcon className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-96 lg:h-[500px]">
        {/* Main Image */}
        <div className="lg:col-span-3 relative group cursor-pointer overflow-hidden rounded-none shadow-lg border border-stone-200" onClick={() => openModal(currentIndex)}>
          <img
            src={images[currentIndex]}
            alt={`${title} - Ảnh ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-3 rounded-none opacity-0 group-hover:opacity-100 transition-all border border-white/20 shadow-lg"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-3 rounded-none opacity-0 group-hover:opacity-100 transition-all border border-white/20 shadow-lg"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-none text-sm font-normal tracking-wide">
            {currentIndex + 1} / {images.length}
          </div>

          {/* View All Photos Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal(0);
            }}
            className="absolute bottom-4 left-4 bg-white/95 hover:bg-white text-slate-900 px-5 py-2.5 rounded-none text-xs font-medium flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all tracking-wider uppercase shadow-lg border border-white/50"
          >
            <PhotoIcon className="h-4 w-4" />
            <span>Xem tất cả ảnh</span>
          </button>
        </div>

        {/* Thumbnail Grid */}
        <div className="hidden lg:block space-y-3">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className="relative cursor-pointer group overflow-hidden rounded-none shadow-md border border-stone-200"
              onClick={() => openModal(index + 1)}
            >
              <img
                src={image}
                alt={`${title} - Thumbnail ${index + 2}`}
                className="w-full h-[120px] object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-medium tracking-wide">
                    +{images.length - 5} ảnh
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Previous Button */}
            <button
              onClick={prevModalImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeftIcon className="h-12 w-12" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextModalImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRightIcon className="h-12 w-12" />
            </button>

            {/* Main Image */}
            <img
              src={images[modalIndex]}
              alt={`${title} - Ảnh ${modalIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {modalIndex + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setModalIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    index === modalIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
