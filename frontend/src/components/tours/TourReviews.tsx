import React, { useState } from 'react';
import { 
  StarIcon,
  UserCircleIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui';

interface Review {
  id: number;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
  tourDate: string;
  travelerType: 'family' | 'couple' | 'solo' | 'friends' | 'business';
}

interface TourReviewsProps {
  reviews: Review[];
  overallRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

const mockReviews: Review[] = [
  {
    id: 1,
    user: {
      name: "Nguyễn Minh Anh",
      verified: true
    },
    rating: 5,
    title: "Chuyến đi tuyệt vời, đáng nhớ!",
    content: "Tour được tổ chức rất chuyên nghiệp, hướng dẫn viên nhiệt tình và am hiểu. Khách sạn sạch sẽ, thức ăn ngon. Cảnh đẹp không thể tả được bằng lời. Sẽ quay lại lần nữa!",
    date: "2024-01-15",
    helpful: 12,
    images: [
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400"
    ],
    tourDate: "2024-01-10",
    travelerType: "family"
  },
  {
    id: 2,
    user: {
      name: "Trần Văn Hùng",
      verified: true
    },
    rating: 4,
    title: "Tour tốt, có một số điểm cần cải thiện",
    content: "Nhìn chung tour khá ổn, cảnh đẹp, lịch trình hợp lý. Tuy nhiên xe hơi cũ và thời gian di chuyển hơi lâu. Hy vọng công ty sẽ cải thiện phương tiện.",
    date: "2024-01-12",
    helpful: 8,
    tourDate: "2024-01-07",
    travelerType: "couple"
  },
  {
    id: 3,
    user: {
      name: "Lê Thị Mai",
      verified: false
    },
    rating: 5,
    title: "Trải nghiệm tuyệt vời cho lần đầu đi tour",
    content: "Lần đầu đi tour nhóm nhưng cảm thấy rất hài lòng. Mọi thứ được sắp xếp chu đáo, không phải lo lắng gì cả. Đặc biệt ấn tượng với bữa tối BBQ trên bãi biển.",
    date: "2024-01-10",
    helpful: 15,
    tourDate: "2024-01-05",
    travelerType: "solo"
  }
];

const TourReviews: React.FC<TourReviewsProps> = ({
  reviews = mockReviews,
  overallRating,
  totalReviews,
  ratingDistribution
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const travelerTypeLabels = {
    family: 'Gia đình',
    couple: 'Cặp đôi',
    solo: 'Một mình',
    friends: 'Bạn bè',
    business: 'Công tác'
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default: // newest
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const filteredReviews = filterRating 
    ? sortedReviews.filter(review => review.rating === filterRating)
    : sortedReviews;

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Reviews Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Đánh giá từ khách hàng
        </h3>

        {/* Overall Rating */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{overallRating}</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(overallRating), 'lg')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {totalReviews} đánh giá
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 max-w-md space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{rating} sao</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${((ratingDistribution[rating] || 0) / totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div className="flex flex-wrap items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
            <option value="helpful">Hữu ích nhất</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Hiển thị {displayedReviews.length} / {filteredReviews.length} đánh giá
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            {/* Review Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                {review.user.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                  {review.user.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Đã xác minh
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating, 'sm')}
                    <span className="font-medium">{review.rating}/5</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(review.date)}</span>
                  <span>•</span>
                  <span>{travelerTypeLabels[review.travelerType]}</span>
                </div>

                <p className="text-sm text-gray-600">
                  Đã tham gia tour: {formatDate(review.tourDate)}
                </p>
              </div>
            </div>

            {/* Review Content */}
            <div className="ml-16">
              <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <HandThumbUpIcon className="h-4 w-4" />
                  <span>Hữu ích ({review.helpful})</span>
                </button>
                
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Trả lời</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredReviews.length > 3 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="px-8 py-2"
          >
            {showAllReviews 
              ? 'Thu gọn đánh giá' 
              : `Xem thêm ${filteredReviews.length - 3} đánh giá`
            }
          </Button>
        </div>
      )}

      {/* Write Review CTA */}
      <div className="mt-8 pt-6 border-t">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Bạn đã từng tham gia tour này?
          </h4>
          <p className="text-gray-600 mb-4">
            Chia sẻ trải nghiệm của bạn để giúp những khách hàng khác
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
            Viết đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TourReviews;
