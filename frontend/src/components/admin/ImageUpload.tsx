import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface ImageUploadProps {
  multiple?: boolean;
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  maxFiles?: number;
  label?: string;
  required?: boolean;
  showPrimaryBadge?: boolean; // Hiển thị nhãn "Chính" trên ảnh đầu tiên khi multiple=true
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  multiple = false,
  value,
  onChange,
  maxFiles = 10,
  label = 'Upload ảnh',
  required = false,
  showPrimaryBadge = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentImages = multiple 
    ? (Array.isArray(value) ? value : []) 
    : (value ? [value] : []);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - currentImages.length;

    if (multiple && fileArray.length > remainingSlots) {
      setError(`Chỉ có thể upload tối đa ${maxFiles} ảnh (còn ${remainingSlots} slot)`);
      return;
    }

    // Validate file types
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Mỗi ảnh phải nhỏ hơn 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      if (multiple) {
        // Upload multiple files
        const formData = new FormData();
        fileArray.forEach(file => {
          formData.append('files', file);
        });

        const response = await api.post('/upload/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Extract data from ApiResponse wrapper
        const imageUrls = response.data?.data || [];
        const newUrls = [...currentImages, ...imageUrls];
        onChange(newUrls);
      } else {
        // Upload single file
        const formData = new FormData();
        formData.append('file', fileArray[0]);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Extract data from ApiResponse wrapper
        const imageUrl = response.data?.data || '';
        onChange(imageUrl);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = currentImages[index];

    try {
      // Delete from server
      await api.delete('/upload/image', {
        params: { url: imageUrl }
      });

      // Update state
      if (multiple) {
        const newUrls = currentImages.filter((_, i) => i !== index);
        onChange(newUrls as string | string[]);
      } else {
        onChange('');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Lỗi xóa ảnh');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area - Compact Version */}
      {(multiple || currentImages.length === 0) && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id={`image-upload-${label}`}
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
            disabled={uploading || (multiple && currentImages.length >= maxFiles)}
          />
          
          <label
            htmlFor={`image-upload-${label}`}
            className="cursor-pointer flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <CloudArrowUpIcon className="h-5 w-5 text-blue-500 animate-pulse" />
                <span className="text-sm text-gray-600">Đang upload...</span>
              </>
            ) : (
              <>
                <PhotoIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">Chọn ảnh</span>
                  {' '}hoặc kéo thả ({multiple ? `tối đa ${maxFiles}` : '1'} ảnh, ≤10MB)
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image Preview Grid - Compact */}
      {currentImages.length > 0 && (
        <div className={`mt-2 grid gap-2 ${multiple ? 'grid-cols-4 md:grid-cols-6' : 'grid-cols-4 md:grid-cols-6'}`}>
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={typeof imageUrl === 'string' ? imageUrl : ''}
                  alt={`${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Xóa"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
              {multiple && showPrimaryBadge && index === 0 && (
                <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {multiple && currentImages.length > 0 && currentImages.length < maxFiles && (
        <p className="mt-2 text-xs text-gray-500">
          Đã upload {currentImages.length}/{maxFiles} ảnh
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

