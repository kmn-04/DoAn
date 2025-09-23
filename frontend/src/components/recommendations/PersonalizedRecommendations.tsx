import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  FireIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  UsersIcon,
  TagIcon,
  ChevronRightIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import recommendationService from '../../services/recommendationService';
import { wishlistService } from '../../services';
import type { TourRecommendation } from '../../services/recommendationService';
import { Card, Button } from '../ui';

interface PersonalizedRecommendationsProps {
  className?: string;
  context?: 'homepage' | 'profile' | 'booking' | 'search';
  limit?: number;
  showHeader?: boolean;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  className = '',
  context = 'homepage',
  limit = 8,
  showHeader = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<{
    forYou: TourRecommendation[];
    trending: TourRecommendation[];
    similar: TourRecommendation[];
    lastMinute: TourRecommendation[];
  }>({
    forYou: [],
    trending: [],
    similar: [],
    lastMinute: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'similar' | 'lastMinute'>('forYou');
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!isAuthenticated || !user?.id) {
        // Load trending for non-authenticated users
        try {
          const trending = await recommendationService.getTrendingTours(limit);
          setRecommendations(prev => ({ ...prev, trending }));
          setActiveTab('trending');
        } catch (error) {
          console.error('Error loading trending tours:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        
        // Load personalized recommendations
        const data = await recommendationService.getHomepageRecommendations(user.id);
        setRecommendations(data);
        
        // Load user's wishlist to show heart states
        const userWishlist = await wishlistService.getUserWishlist(user.id);
        const wishlistIds = new Set(userWishlist.map(item => item.id));
        setWishlistItems(wishlistIds);
        
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [user?.id, isAuthenticated, limit]);

  const handleWishlistToggle = async (tourId: number) => {
    if (!user?.id) return;

    try {
      const isInWishlist = wishlistItems.has(tourId);
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(user.id, tourId);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(tourId);
          return newSet;
        });
        
        // Show success toast
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: 'Đã xóa khỏi yêu thích',
            message: 'Tour đã được xóa khỏi danh sách yêu thích.'
          }
        });
        window.dispatchEvent(event);
        
      } else {
        await wishlistService.addToWishlist(user.id, tourId);
        setWishlistItems(prev => new Set([...prev, tourId]));
        
        // Show success toast
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: 'Đã thêm vào yêu thích',
            message: 'Tour đã được thêm vào danh sách yêu thích.'
          }
        });
        window.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Có lỗi xảy ra',
          message: 'Không thể cập nhật danh sách yêu thích.'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Còn ${days} ngày`;
    if (hours > 0) return `Còn ${hours} giờ`;
    return 'Sắp hết hạn';
  };

  const tabs = [
    {
      id: 'forYou' as const,
      name: 'Dành cho bạn',
      icon: SparklesIcon,
      count: recommendations.forYou?.length || 0,
      visible: isAuthenticated
    },
    {
      id: 'trending' as const,
      name: 'Đang hot',
      icon: FireIcon,
      count: recommendations.trending?.length || 0,
      visible: true
    },
    {
      id: 'similar' as const,
      name: 'Tương tự',
      icon: TagIcon,
      count: recommendations.similar?.length || 0,
      visible: isAuthenticated
    },
    {
      id: 'lastMinute' as const,
      name: 'Last minute',
      icon: ClockIcon,
      count: recommendations.lastMinute?.length || 0,
      visible: true
    }
  ].filter(tab => tab.visible);

  const getCurrentRecommendations = (): TourRecommendation[] => {
    return recommendations[activeTab] || [];
  };

  if (isLoading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRecommendations = getCurrentRecommendations();

  if (currentRecommendations.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isAuthenticated ? 'Gợi ý dành riêng cho bạn' : 'Tour đang được quan tâm'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isAuthenticated 
                ? 'Dựa trên sở thích và lịch sử tìm kiếm của bạn'
                : 'Những tour du lịch được yêu thích nhất hiện tại'
              }
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentRecommendations.slice(0, limit).map((recommendation) => (
            <RecommendationCard
              key={recommendation.tour.id}
              recommendation={recommendation}
              isInWishlist={wishlistItems.has(recommendation.tour.id)}
              onWishlistToggle={() => handleWishlistToggle(recommendation.tour.id)}
              showWishlist={isAuthenticated}
            />
          ))}
        </div>

        {/* View All Button */}
        {currentRecommendations.length > limit && (
          <div className="text-center mt-8">
            <Link to="/tours">
              <Button variant="outline" className="px-8 py-3">
                Xem tất cả
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: TourRecommendation;
  isInWishlist: boolean;
  onWishlistToggle: () => void;
  showWishlist: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isInWishlist,
  onWishlistToggle,
  showWishlist
}) => {
  const { tour, score, reasons = [], tags = [], personalizedPrice, urgency } = recommendation;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Còn ${days} ngày`;
    if (hours > 0) return `Còn ${hours} giờ`;
    return 'Sắp hết hạn';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Image */}
        <Link to={`/tours/${tour.slug}`}>
          <img
            src={tour.mainImage}
            alt={tour.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={onWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
            )}
          </button>
        )}

        {/* Score Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
            <SparklesIcon className="h-3 w-3 mr-1" />
            {Math.round(score * 100)}% phù hợp
          </span>
        </div>

        {/* Urgency Banner */}
        {urgency && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-transparent p-3">
            <div className="flex items-center text-white text-sm font-medium">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              <span className="flex-1">{urgency.message}</span>
            </div>
            {urgency.deadline && (
              <div className="text-xs text-red-200 mt-1">
                {formatTimeLeft(urgency.deadline)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/tours/${tour.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {tour.name}
          </h3>
        </Link>

        {/* Location & Duration */}
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{tour.duration} ngày</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 ml-1">
              {tour.averageRating?.toFixed(1) || '4.5'}
            </span>
          </div>
          <span className="text-sm text-gray-500 ml-1">
            ({tour.totalReviews || 0} đánh giá)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {personalizedPrice && personalizedPrice !== tour.price && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(tour.price)}
              </div>
            )}
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(personalizedPrice || tour.discountPrice || tour.price)}
            </div>
          </div>
          {personalizedPrice && personalizedPrice < tour.price && (
            <div className="text-sm font-medium text-green-600">
              Tiết kiệm {Math.round((1 - personalizedPrice / tour.price) * 100)}%
            </div>
          )}
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-blue-600 font-medium mb-1">Tại sao phù hợp:</div>
            <div className="text-xs text-gray-600">
              {reasons.slice(0, 2).join(' • ')}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link to={`/tours/${tour.slug}`} className="block">
          <Button className="w-full">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default PersonalizedRecommendations;
