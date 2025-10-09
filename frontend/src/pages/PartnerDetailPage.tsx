import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { Helmet } from 'react-helmet-async';
import {
  StarIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TicketIcon,
  ChevronLeftIcon,
  BuildingOffice2Icon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { partnerService } from '../services';
import type { PartnerResponse } from '../services/partnerService';
import { TourCard } from '../components/tours';
import { Loading, Button, Card, ImageCarousel } from '../components/ui';
import ImageGallery from '../components/ui/ImageGallery';

const PartnerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<PartnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'reviews'>('overview');

  useEffect(() => {
    const fetchPartner = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const data = await partnerService.getPartnerBySlug(slug);
        setPartner(data);
      } catch (error) {
        console.error('Error fetching partner:', error);
        setPartner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [slug]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= Math.floor(rating) ? (
            <StarIconSolid className="h-5 w-5 fill-current" style={{ color: '#D4AF37' }} />
          ) : (
            <StarIcon className="h-5 w-5 text-white/30" />
          )}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">Không tìm thấy đối tác</h1>
          <p className="text-gray-600 mb-6 font-normal">Đối tác bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/partners">
            <button className="inline-flex items-center bg-slate-900 text-white px-6 py-3 rounded-none hover:bg-slate-800 transition-all duration-300 text-sm font-medium tracking-wide border border-slate-900 hover:shadow-lg"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
              }}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Quay lại danh sách đối tác
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-stone-50">
        {/* Back Button */}
        <div className="bg-white border-b border-stone-200 animate-fade-in opacity-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Link 
              to="/partners"
              className="inline-flex items-center text-sm text-slate-700 hover:text-slate-900 transition-colors group font-normal tracking-wide"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Quay lại danh sách đối tác
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative animate-fade-in-up opacity-0 delay-100">
          {/* Cover Image */}
          <div className="aspect-[3/1] overflow-hidden">
            {partner.images && partner.images.length > 0 ? (
              <img
                src={partner.images.find(img => img.imageType === 'cover')?.imageUrl || partner.images[0]?.imageUrl}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                <BuildingOffice2Icon className="h-24 w-24 text-gray-500" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70" />
          
          {/* Partner Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 animate-fade-in opacity-0 delay-300">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end space-x-6">
                <div className="w-28 h-28 rounded-none bg-white p-2 shadow-2xl border-2" style={{ borderColor: '#D4AF37' }}>
                  {partner.images?.find(img => img.imageType === 'logo') ? (
                    <img
                      src={partner.images.find(img => img.imageType === 'logo')?.imageUrl}
                      alt={`${partner.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                      <BuildingOffice2Icon className="h-10 w-10 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="text-white flex-1">
                  <h1 className="text-4xl md:text-5xl font-normal mb-3 tracking-tight">{partner.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/95">
                    <div className="flex items-center space-x-1.5">
                      {renderStars(partner.rating || 0)}
                      <span className="ml-2 font-medium text-lg">{(partner.rating || 0).toFixed(1)}</span>
                      <span className="text-sm font-normal">({partner.totalReviews || 0} đánh giá)</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
                      <span className="font-normal">Từ {partner.establishedYear || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
                      <span className="font-normal">{partner.totalTours || 0} tours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white border border-stone-200 rounded-none mb-8 animate-fade-in opacity-0 delay-500">
                <div className="flex space-x-0">
                  {[
                    { key: 'overview', label: 'Tổng quan' },
                    { key: 'tours', label: `Tours (${partner.tours?.length || 0})` },
                    { key: 'reviews', label: 'Đánh giá' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as 'overview' | 'tours' | 'reviews')}
                      className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-300 tracking-wide ${
                        activeTab === tab.key
                          ? 'text-white shadow-sm'
                          : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                      }`}
                      style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Image Gallery with Navigation */}
                  {partner.images && partner.images.length > 0 && (
                    <div className="bg-white border border-stone-200 rounded-none p-6 animate-fade-in-up opacity-0 delay-200">
                      <h3 className="text-xl font-medium mb-6 text-slate-900 tracking-tight">Hình ảnh đối tác</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-96 lg:h-[500px]">
                        {/* Main Image with Navigation */}
                        <div className="lg:col-span-3 relative group cursor-pointer overflow-hidden rounded-none">
                          <ImageCarousel
                            images={partner.images}
                            alt={partner.name}
                            className="w-full h-full rounded-none overflow-hidden"
                            imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            showCounter={true}
                            showNavigation={true}
                          />
                        </div>
                        
                        {/* Thumbnail Grid - GIỐNG TOUR */}
                        <div className="hidden lg:block space-y-3">
                          {partner.images.filter(img => img.imageType === 'gallery' || img.imageType === 'cover')
                            .slice(1, 5).map((image, index) => (
                            <div
                              key={image.id}
                              className="relative cursor-pointer group overflow-hidden rounded-none"
                            >
                              <img
                                src={image.imageUrl}
                                alt={image.altText || `${partner.name} - Thumbnail ${index + 2}`}
                                className="w-full h-[120px] object-cover rounded-none group-hover:scale-110 transition-transform duration-300"
                              />
                              {index === 3 && partner.images.length > 5 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-none">
                                  <span className="text-white font-medium text-sm">
                                    +{partner.images.length - 5} ảnh
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white border border-stone-200 rounded-none p-6 animate-fade-in-up opacity-0 delay-300">
                    <h3 className="text-xl font-medium text-slate-900 mb-4 tracking-tight">Giới thiệu</h3>
                    <p className="text-gray-700 leading-relaxed font-normal text-base">{partner.description}</p>
                  </div>

                  {/* Specialties */}
                  {partner.specialties && partner.specialties.length > 0 && (
                    <div className="bg-white border border-stone-200 rounded-none p-6 animate-fade-in-up opacity-0 delay-400">
                      <h3 className="text-xl font-medium text-slate-900 mb-4 tracking-tight">Chuyên môn</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-block bg-stone-100 text-slate-700 px-4 py-2 rounded-none text-sm font-normal border border-stone-200"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-stone-200 rounded-none p-5 text-center hover:shadow-lg transition-all duration-300 group animate-fade-in-up opacity-0 delay-500">
                      <div className="text-3xl font-normal mb-1 transition-all duration-300" style={{ color: '#D4AF37' }}>{partner.totalTours || 0}</div>
                      <div className="text-sm text-gray-600 font-normal tracking-wide">Tours</div>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-none p-5 text-center hover:shadow-lg transition-all duration-300 group animate-fade-in-up opacity-0 delay-600">
                      <div className="text-3xl font-normal mb-1 transition-all duration-300" style={{ color: '#D4AF37' }}>{(partner.totalBookings || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600 font-normal tracking-wide">Lượt đặt</div>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-none p-5 text-center hover:shadow-lg transition-all duration-300 group animate-fade-in-up opacity-0 delay-700">
                      <div className="text-3xl font-normal mb-1 transition-all duration-300" style={{ color: '#D4AF37' }}>{(partner.rating || 0).toFixed(1)}</div>
                      <div className="text-sm text-gray-600 font-normal tracking-wide">Đánh giá</div>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-none p-5 text-center hover:shadow-lg transition-all duration-300 group animate-fade-in-up opacity-0 delay-800">
                      <div className="text-3xl font-normal mb-1 transition-all duration-300" style={{ color: '#D4AF37' }}>{partner.establishedYear ? new Date().getFullYear() - partner.establishedYear : 'N/A'}</div>
                      <div className="text-sm text-gray-600 font-normal tracking-wide">Năm kinh nghiệm</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tours' && (
                <div className="space-y-6">
                  {partner.tours && partner.tours.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {partner.tours.map((tour, index) => (
                        <div key={tour.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 100}ms` }}>
                          <TourCard 
                            tour={{
                              ...tour,
                              name: tour.title,
                              reviewCount: tour.totalReviews,
                              maxPeople: tour.maxGroupSize,
                              image: tour.images[0] || '',
                              category: tour.category.name
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-stone-200 rounded-none text-center py-16 px-6">
                      <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
                        Chưa có tour nào
                      </h3>
                      <p className="text-gray-600 font-normal">
                        Đối tác này chưa có tour du lịch nào được đăng tải.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-none text-center py-16 px-6">
                    <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
                      Đánh giá sẽ sớm có mặt
                    </h3>
                    <p className="text-gray-600 font-normal">
                      Tính năng đánh giá đối tác đang được phát triển.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white border border-stone-200 rounded-none p-6 animate-fade-in opacity-0 delay-500 sticky top-24">
                <h3 className="text-lg font-medium text-slate-900 mb-5 tracking-tight">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  {partner.address && (
                    <div className="flex items-start group">
                      <MapPinIcon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0 transition-colors" style={{ color: '#D4AF37' }} />
                      <span className="text-sm text-gray-700 font-normal leading-relaxed">{partner.address}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center group">
                      <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0 transition-colors" style={{ color: '#D4AF37' }} />
                      <a href={`tel:${partner.phone}`} className="text-sm text-slate-700 hover:text-slate-900 font-normal transition-colors">
                        {partner.phone}
                      </a>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center group">
                      <EnvelopeIcon className="h-5 w-5 mr-3 flex-shrink-0 transition-colors" style={{ color: '#D4AF37' }} />
                      <a href={`mailto:${partner.email}`} className="text-sm text-slate-700 hover:text-slate-900 font-normal transition-colors">
                        {partner.email}
                      </a>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center group">
                      <GlobeAltIcon className="h-5 w-5 mr-3 flex-shrink-0 transition-colors" style={{ color: '#D4AF37' }} />
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-slate-700 hover:text-slate-900 font-normal transition-colors"
                      >
                        Website chính thức
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white border border-stone-200 rounded-none p-6 animate-fade-in opacity-0 delay-600">
                <h3 className="text-lg font-medium text-slate-900 mb-5 tracking-tight">Thống kê nhanh</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-sm text-gray-600 font-normal">Đánh giá trung bình</span>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 mr-1" style={{ color: '#D4AF37' }} />
                      <span className="text-sm font-medium text-slate-900">{(partner.rating || 0).toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-sm text-gray-600 font-normal">Tổng số tours</span>
                    <span className="text-sm font-medium text-slate-900">{partner.totalTours || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-sm text-gray-600 font-normal">Lượt đặt tour</span>
                    <span className="text-sm font-medium text-slate-900">{(partner.totalBookings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 font-normal">Thành lập</span>
                    <span className="text-sm font-medium text-slate-900">{partner.establishedYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-stone-100 border border-stone-200 rounded-none p-6 animate-fade-in opacity-0 delay-700">
                <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">Quan tâm đến đối tác này?</h3>
                <p className="text-sm text-gray-700 mb-5 font-normal leading-relaxed">
                  Khám phá các tour du lịch tuyệt vời từ {partner.name}
                </p>
                <button 
                  className="w-full bg-slate-900 text-white px-6 py-3 rounded-none hover:bg-slate-800 transition-all duration-300 text-sm font-medium tracking-wide border border-slate-900 hover:shadow-lg"
                  onClick={() => setActiveTab('tours')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e293b';
                  }}
                >
                  Xem tất cả tours
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerDetailPage;

