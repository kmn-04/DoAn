import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { wishlistService } from '../services';
import { useAuth } from '../hooks/useAuth';
import TourCard from '../components/tours/TourCard';

interface WishlistItem {
  id: number;
  tourId: number;
  tour: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    duration: number;
    location: string;
    tourType: 'DOMESTIC' | 'INTERNATIONAL';
    rating: number;
    reviewCount: number;
    maxPeople: number;
    image: string;
    badge?: string;
    category: string;
  };
  addedAt: string;
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (tourId: number) => {
    try {
      await wishlistService.removeFromWishlist(tourId);
      setWishlistItems(prev => prev.filter(item => item.tourId !== tourId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả tour yêu thích?')) {
      return;
    }

    try {
      await wishlistService.clearWishlist();
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-8">
            Bạn cần đăng nhập để xem danh sách tour yêu thích của mình.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <HeartSolidIcon className="h-8 w-8 mr-3 text-red-600" />
            Tour yêu thích
          </h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa có tour yêu thích
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Hãy khám phá các tour du lịch tuyệt vời và lưu những tour bạn yêu thích 
              để dễ dàng tìm lại sau này!
            </p>
            <Link
              to="/tours"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Khám phá tour ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HeartSolidIcon className="h-8 w-8 mr-3 text-red-600" />
            Tour yêu thích
            <span className="ml-3 text-xl text-gray-500">
              ({wishlistItems.length})
            </span>
          </h1>

          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative">
              <TourCard
                tour={item.tour}
                isWishlisted={true}
                onToggleWishlist={() => handleRemove(item.tourId)}
              />
              
              {/* Added date */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Đã lưu {new Date(item.addedAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Sẵn sàng đặt tour?
          </h3>
          <p className="text-gray-600 mb-6">
            Chọn tour yêu thích của bạn và bắt đầu hành trình khám phá ngay hôm nay!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/tours"
              className="inline-flex items-center bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Xem thêm tour khác
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
