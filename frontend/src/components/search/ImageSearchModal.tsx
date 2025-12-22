import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import tourService from '../../services/tourService';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResults: (tours: any[]) => void;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({ isOpen, onClose, onResults }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('tours.imageSearch.errors.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('tours.imageSearch.errors.fileTooLarge'));
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setSelectedImage(base64String);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      setError(t('tours.imageSearch.errors.noImageSelected'));
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = selectedImage.split(',')[1];
      
      const results = await tourService.searchByImage(base64Data, 6);
      
      if (results && results.length > 0) {
        onResults(results);
        onClose();
      } else {
        setError(t('tours.imageSearch.errors.noResults'));
      }
    } catch (err: unknown) {
      console.error('Image search error:', err);
      setError((err as any).response?.data?.message || t('tours.imageSearch.errors.searchFailed'));
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('tours.imageSearch.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('tours.imageSearch.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${selectedImage 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">
                    {t('tours.imageSearch.clickToChange')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <PhotoIcon className="h-16 w-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-700 font-medium">
                      {t('tours.imageSearch.clickToSelect')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('tours.imageSearch.supportedFormats')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>{t('tours.imageSearch.tip.title')}:</strong> {t('tours.imageSearch.tip.message')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={searching}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={!selectedImage || searching}
              className="flex-1"
            >
              {searching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {t('tours.imageSearch.searching')}
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  {t('tours.imageSearch.searchButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchModal;

