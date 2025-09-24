import React, { useState, useEffect } from 'react';
// import { Helmet } from 'react-helmet-async';
import { 
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import type { Partner, PartnerFilters } from '../types';
import PartnerCard from '../components/partners/PartnerCard';
import PartnerFiltersComponent from '../components/partners/PartnerFilters';
import PartnerCTABanner from '../components/partners/PartnerCTABanner';
import { Loading, Pagination } from '../components/ui';
import partnerService from '../services/partnerService';

const PartnersListingPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PartnerFilters>({
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data - Replace with API call
  const mockPartners: Partner[] = [
    {
      id: 1,
      name: 'Saigon Tourist',
      slug: 'saigon-tourist',
      description: 'Công ty du lịch hàng đầu Việt Nam với hơn 30 năm kinh nghiệm trong ngành du lịch. Chuyên cung cấp các tour trong nước và quốc tế.',
      type: 'TourOperator' as const,
      website: 'https://saigontourist.net',
      phone: '028-3822-4987',
      email: 'info@saigontourist.net',
      address: 'TP. Hồ Chí Minh',
      establishedYear: 1975,
      rating: 4.8,
      totalReviews: 2500,
      totalTours: 150,
      totalBookings: 25000,
      specialties: ['Du lịch văn hóa', 'Du lịch biển', 'Du lịch luxury'],
      images: [
        {
          id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800',
          imageType: 'cover',
          displayOrder: 0,
          altText: 'Saigon Tourist - Văn phòng trung tâm'
        },
        {
          id: 2,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
          imageType: 'logo',
          displayOrder: 0,
          altText: 'Logo Saigon Tourist'
        },
        {
          id: 3,
          imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
          imageType: 'gallery',
          displayOrder: 1,
          altText: 'Tour Hạ Long Bay'
        },
        {
          id: 4,
          imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600',
          imageType: 'gallery',
          displayOrder: 2,
          altText: 'Tour Sapa'
        }
      ],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Vietravel',
      slug: 'vietravel',
      description: 'Tập đoàn du lịch lớn nhất Việt Nam với mạng lưới chi nhánh trên toàn quốc. Cam kết mang đến những trải nghiệm du lịch tuyệt vời.',
      type: 'TourOperator' as const,
      website: 'https://vietravel.com',
      phone: '024-3942-0888',
      email: 'info@vietravel.com',
      address: 'Hà Nội',
      establishedYear: 1995,
      rating: 4.7,
      totalReviews: 3200,
      totalTours: 200,
      totalBookings: 35000,
      specialties: ['Du lịch gia đình', 'Du lịch phiêu lưu', 'Du lịch sinh thái'],
      images: [
        {
          id: 5,
          imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
          imageType: 'cover',
          displayOrder: 0,
          altText: 'Vietravel - Trụ sở chính'
        },
        {
          id: 6,
          imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',
          imageType: 'logo',
          displayOrder: 0,
          altText: 'Logo Vietravel'
        },
        {
          id: 7,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
          imageType: 'gallery',
          displayOrder: 1,
          altText: 'Tour Hội An'
        },
        {
          id: 8,
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
          imageType: 'gallery',
          displayOrder: 2,
          altText: 'Tour Mũi Né'
        },
        {
          id: 9,
          imageUrl: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600',
          imageType: 'gallery',
          displayOrder: 3,
          altText: 'Tour Cần Thơ'
        }
      ],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 3,
      name: 'TST Tourist',
      slug: 'tst-tourist',
      description: 'Công ty du lịch chuyên nghiệp với đội ngũ hướng dẫn viên giàu kinh nghiệm. Tự hào là đối tác tin cậy của hàng nghìn khách hàng.',
      type: 'TourOperator' as const,
      website: 'https://tsttourist.com',
      phone: '0236-3891-456',
      email: 'info@tsttourist.com',
      address: 'Đà Nẵng',
      establishedYear: 2005,
      rating: 4.6,
      totalReviews: 1800,
      totalTours: 80,
      totalBookings: 15000,
      specialties: ['Du lịch núi', 'Du lịch budget', 'Du lịch văn hóa'],
      images: [
        {
          id: 10,
          imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          imageType: 'cover',
          displayOrder: 0,
          altText: 'TST Tourist - Văn phòng Đà Nẵng'
        },
        {
          id: 11,
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          imageType: 'logo',
          displayOrder: 0,
          altText: 'Logo TST Tourist'
        },
        {
          id: 12,
          imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
          imageType: 'gallery',
          displayOrder: 1,
          altText: 'Tour Phong Nha'
        },
        {
          id: 13,
          imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600',
          imageType: 'gallery',
          displayOrder: 2,
          altText: 'Trekking Sapa'
        }
      ],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 4,
      name: 'Flamingo Travel',
      slug: 'flamingo-travel',
      description: 'Đơn vị lữ hành quốc tế chuyên tổ chức các tour cao cấp và dịch vụ du lịch VIP. Mang đến trải nghiệm đẳng cấp cho khách hàng.',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
      website: 'https://flamingotravel.vn',
      phone: '0297-3826-789',
      email: 'booking@flamingotravel.vn',
      address: 'Phú Quốc',
      establishedYear: 2010,
      rating: 4.9,
      totalTours: 60,
      totalBookings: 8000,
      specialties: ['Du lịch luxury', 'Du lịch biển', 'Du lịch gia đình'],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const response = await partnerService.getAllPartners({
          page: currentPage - 1, // API uses 0-based indexing
          size: 20,
          sortBy: filters.sortBy || 'name',
          sortDirection: filters.sortOrder || 'asc'
        });
        
        const mappedPartners = response.content.map(partnerService.mapToPartner);
        setPartners(mappedPartners);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error loading partners:', error);
        // Fallback to mock data
        setPartners(mockPartners);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters: PartnerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  const totalPartners = partners.length;
  const averageRating = partners.reduce((sum, partner) => sum + partner.rating, 0) / partners.length;
  const totalTours = partners.reduce((sum, partner) => sum + partner.totalTours, 0);
  const totalBookings = partners.reduce((sum, partner) => sum + partner.totalBookings, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 lg:h-[500px] bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&h=800&fit=crop"
              alt="Đối tác du lịch"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/60"></div>
          </div>
          
          {/* Content Overlay */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="flex items-center justify-center mb-6">
                <BuildingOffice2Icon className="h-16 w-16 mr-4 opacity-90" />
                <h1 className="text-4xl md:text-6xl font-bold">Đối Tác Du Lịch</h1>
              </div>
              <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
                Mạng lưới {totalPartners} đối tác uy tín với {totalTours.toLocaleString()}+ tour chất lượng cao
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalPartners}+</div>
                  <div className="text-base text-blue-100">Đối tác uy tín</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalTours.toLocaleString()}+</div>
                  <div className="text-base text-blue-100">Tours đa dạng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalBookings.toLocaleString()}+</div>
                  <div className="text-base text-blue-100">Lượt đặt tour</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{averageRating.toFixed(1)}⭐</div>
                  <div className="text-base text-blue-100">Đánh giá trung bình</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <PartnerFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 mt-8 lg:mt-0">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tất cả đối tác ({totalPartners})
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Khám phá các đối tác du lịch uy tín của chúng tôi
                  </p>
                </div>
              </div>

              {/* Partners Grid */}
              {partners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
                  {partners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Không tìm thấy đối tác nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thử điều chỉnh bộ lọc để tìm kiếm đối tác phù hợp
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Partner CTA Banner */}
        <PartnerCTABanner />
      </div>
    </>
  );
};

export default PartnersListingPage;
