import React, { useState, useEffect } from 'react';
// import { Helmet } from 'react-helmet-async';
import { 
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import type { Partner, PartnerFilters } from '../types';
import PartnerCard from '../components/partners/PartnerCard';
import PartnerFiltersComponent from '../components/partners/PartnerFilters';
import { Loading, Pagination } from '../components/ui';

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
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
      website: 'https://saigontourist.net',
      phone: '028-3822-4987',
      email: 'info@saigontourist.net',
      address: 'TP. Hồ Chí Minh',
      establishedYear: 1975,
      rating: 4.8,
      totalTours: 150,
      totalBookings: 25000,
      specialties: ['Du lịch văn hóa', 'Du lịch biển', 'Du lịch luxury'],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Vietravel',
      slug: 'vietravel',
      description: 'Tập đoàn du lịch lớn nhất Việt Nam với mạng lưới chi nhánh trên toàn quốc. Cam kết mang đến những trải nghiệm du lịch tuyệt vời.',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      website: 'https://vietravel.com',
      phone: '024-3942-0888',
      email: 'info@vietravel.com',
      address: 'Hà Nội',
      establishedYear: 1995,
      rating: 4.7,
      totalTours: 200,
      totalBookings: 35000,
      specialties: ['Du lịch gia đình', 'Du lịch phiêu lưu', 'Du lịch sinh thái'],
      tours: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 3,
      name: 'TST Tourist',
      slug: 'tst-tourist',
      description: 'Công ty du lịch chuyên nghiệp với đội ngũ hướng dẫn viên giàu kinh nghiệm. Tự hào là đối tác tin cậy của hàng nghìn khách hàng.',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
      coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop',
      website: 'https://tsttourist.com',
      phone: '0236-3891-456',
      email: 'info@tsttourist.com',
      address: 'Đà Nẵng',
      establishedYear: 2005,
      rating: 4.6,
      totalTours: 80,
      totalBookings: 15000,
      specialties: ['Du lịch núi', 'Du lịch budget', 'Du lịch văn hóa'],
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
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setPartners(mockPartners);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Đối Tác Du Lịch
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Khám phá mạng lưới đối tác uy tín của chúng tôi với đa dạng tour du lịch chất lượng cao
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{totalPartners}+</div>
                <div className="text-blue-100 text-sm">Đối tác</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{totalTours.toLocaleString()}+</div>
                <div className="text-blue-100 text-sm">Tour du lịch</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{totalBookings.toLocaleString()}+</div>
                <div className="text-blue-100 text-sm">Lượt đặt tour</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{averageRating.toFixed(1)}⭐</div>
                <div className="text-blue-100 text-sm">Đánh giá trung bình</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters */}
          <PartnerFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
    </>
  );
};

export default PartnersListingPage;
