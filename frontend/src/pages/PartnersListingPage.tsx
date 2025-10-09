import React, { useState, useEffect, useRef } from 'react';
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
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing to match Pagination component
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  
  // Ref to scroll to partners grid when page changes
  const partnersGridRef = useRef<HTMLDivElement>(null);

  // Removed mock data - fetching from API only

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const response = await partnerService.searchPartners({
          keyword: filters.search,
          type: filters.type,
          location: filters.location,
          minRating: filters.rating,
          page: currentPage, // Already 0-based indexing
          size: 12, // 3x4 grid
          sortBy: filters.sortBy || 'name',
          sortDirection: filters.sortOrder || 'asc'
        });
        
        const mappedPartners = response.content.map(partnerService.mapToPartner);
        setPartners(mappedPartners);
        setTotalPages(response.totalPages);
        setTotalPartners(response.totalElements);
      } catch (error) {
        console.error('Error loading partners:', error);
        // Show empty state on error
        setPartners([]);
        setTotalPages(0);
        setTotalPartners(0);
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, [filters, currentPage]);
  
  // Scroll to partners grid when page changes
  useEffect(() => {
    if (partnersGridRef.current) {
      // Get the position of the partners grid
      const yOffset = -100; // Offset to show some space above
      const element = partnersGridRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      // Smooth scroll to the partners grid
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleFiltersChange = (newFilters: PartnerFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  const averageRating = partners.length > 0 ? partners.reduce((sum, partner) => sum + partner.rating, 0) / partners.length : 0;
  const totalToursCount = partners.reduce((sum, partner) => sum + partner.totalTours, 0);
  const totalBookingsCount = partners.reduce((sum, partner) => sum + partner.totalBookings, 0);

  // Remove full-page loading to prevent page reload feel
  const isInitialLoading = loading && partners.length === 0;

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
                Mạng lưới {totalPartners} đối tác uy tín với {totalToursCount.toLocaleString()}+ tour chất lượng cao
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalPartners}+</div>
                  <div className="text-base text-blue-100">Đối tác uy tín</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalToursCount.toLocaleString()}+</div>
                  <div className="text-base text-blue-100">Tours đa dạng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{totalBookingsCount.toLocaleString()}+</div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Section - Horizontal at top */}
          <div className="mb-8">
            <PartnerFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalResults={totalPartners}
            />
          </div>

          {/* Partners Grid - 4 rows x 3 columns */}
          <div ref={partnersGridRef}>
            {isInitialLoading ? (
              <div className="py-12">
                <Loading />
              </div>
            ) : partners.length > 0 ? (
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
                  {partners.map((partner, index) => (
                    <div key={partner.id} className="stagger-animation opacity-0">
                      <PartnerCard partner={partner} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Không tìm thấy đối tác nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử điều chỉnh bộ lọc để tìm kiếm đối tác phù hợp
                </p>
              </div>
            )}
          </div>

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

        {/* Partner CTA Banner */}
        <PartnerCTABanner />
      </div>
    </>
  );
};

export default PartnersListingPage;
