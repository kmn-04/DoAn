import React, { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { wishlistService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

interface WishlistButtonProps {
  tourId: number;
  tourName: string;
  isWishlisted?: boolean;
  onToggle?: (isWishlisted: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  tourId,
  tourName,
  isWishlisted = false,
  onToggle,
  size = 'md',
  showText = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user?.id) return;
      
      try {
        const inWishlist = await wishlistService.isInWishlist(user.id, tourId);
        setWishlisted(inWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [user?.id, tourId]);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!user?.id) {
      alert('Vui lòng đăng nhập để lưu tour yêu thích');
      return;
    }

    setIsLoading(true);
    try {
      if (wishlisted) {
        // Remove from wishlist
        await wishlistService.removeFromWishlist(user.id, tourId);
        setWishlisted(false);
        onToggle?.(false);
      } else {
        // Add to wishlist
        await wishlistService.addToWishlist(user.id, tourId);
        setWishlisted(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        group relative inline-flex items-center justify-center
        transition-all duration-200
        ${wishlisted 
          ? 'text-red-600 hover:text-red-700' 
          : 'text-gray-400 hover:text-red-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={wishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      aria-label={wishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      {/* Heart Icon with animation */}
      <div className="relative">
        {wishlisted ? (
          <HeartSolidIcon 
            className={`${sizeClasses[size]} animate-pulse-once`} 
          />
        ) : (
          <HeartIcon 
            className={`${sizeClasses[size]} group-hover:scale-110 transition-transform`} 
          />
        )}
      </div>

      {/* Text (optional) */}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {wishlisted ? 'Đã lưu' : 'Lưu tour'}
        </span>
      )}

      {/* Tooltip */}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        px-2 py-1 bg-gray-900 text-white text-xs rounded
        opacity-0 group-hover:opacity-100 pointer-events-none
        transition-opacity duration-200 whitespace-nowrap
      ">
        {wishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      </div>
    </button>
  );
};

export default WishlistButton;
