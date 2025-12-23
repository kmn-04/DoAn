import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  XMarkIcon,
  TicketIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Button, Pagination, TourCardSkeleton } from '../../components/ui';
import { wishlistService, partnerService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import type { WishlistItem } from '../../services/wishlistService';
import type { PartnerResponse } from '../../services/partnerService';
import { toast } from 'react-hot-toast';

type TabType = 'tours' | 'partners';

const WishlistPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tours');
  
  // Tours state
  const [tours, setTours] = useState<WishlistItem[]>([]);
  const [filteredTours, setFilteredTours] = useState<WishlistItem[]>([]);
  
  // Partners state
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<PartnerResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'newest'
  });

  const itemsPerPage = 6;

  // Fetch tours
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const wishlistItems = await wishlistService.getUserWishlist(user.id);
        setTours(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error(t('wishlist.toast.loadError'));
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'tours') {
      fetchWishlist();
    }
  }, [user?.id, activeTab]);

  // Fetch partners
  useEffect(() => {
    const fetchFavoritePartners = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const favoriteIds = await partnerService.getUserFavorites();
        
        if (favoriteIds.length === 0) {
          setPartners([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch all partners and filter by favorite IDs
        const allPartners = await partnerService.getAllPartners();
        const favoritePartners = allPartners.filter(p => favoriteIds.includes(p.id));
        setPartners(favoritePartners);
      } catch (error) {
        console.error('Error fetching favorite partners:', error);
        toast.error(t('wishlist.toast.loadError'));
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'partners') {
      fetchFavoritePartners();
    }
  }, [user?.id, activeTab]);

  // Filter tours
  useEffect(() => {
    if (activeTab !== 'tours') return;
    
    let filtered = [...tours];

    if (filters.search) {
      filtered = filtered.filter(tour => 
        tour.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(tour => tour.category === filters.category);
    }

    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    }

    setFilteredTours(filtered);
    setCurrentPage(0);
  }, [filters, tours, activeTab]);

  // Filter partners
  useEffect(() => {
    if (activeTab !== 'partners') return;
    
    let filtered = [...partners];

    if (filters.search) {
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        partner.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        partner.address?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    switch (filters.sortBy) {
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order (newest first based on when added to favorites)
        break;
    }

    setFilteredPartners(filtered);
    setCurrentPage(0);
  }, [filters, partners, activeTab]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFromWishlist = async (tourId: number, tourName: string) => {
    const confirmed = window.confirm(t('wishlist.toast.removeConfirm', { name: tourName }));
    
    if (confirmed && user?.id) {
      try {
        await wishlistService.removeFromWishlist(user.id, tourId);
        setTours(prev => prev.filter(tour => tour.id !== tourId));
        toast.success(t('wishlist.toast.removeSuccess', { name: tourName }));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error(t('wishlist.toast.removeError'));
      }
    }
  };

  const handleRemovePartner = async (partnerId: number, partnerName: string) => {
    const confirmed = window.confirm(t('wishlist.toast.removeConfirm', { name: partnerName }));
    
    if (confirmed) {
      try {
        await partnerService.removeFromFavorites(partnerId);
        setPartners(prev => prev.filter(p => p.id !== partnerId));
        toast.success(t('wishlist.toast.removePartnerSuccess'));
      } catch (error) {
        console.error('Error removing partner from favorites:', error);
        toast.error(t('wishlist.toast.removePartnerError'));
      }
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', sortBy: 'newest' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination
  const currentItems = activeTab === 'tours' ? filteredTours : filteredPartners;
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItemsPage = currentItems.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 animate-pulse">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="w-40 h-10 bg-gray-200 rounded"></div>
            <div className="w-40 h-10 bg-gray-200 rounded"></div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TourCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-2">
            <HeartSolidIcon className="h-8 w-8" style={{ color: '#D4AF37' }} />
            <h1 className="text-3xl font-normal text-slate-900 tracking-tight">{t('wishlist.title')}</h1>
          </div>
          <p className="text-gray-600 font-normal">
            {t('wishlist.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-stone-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tours')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'tours'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('wishlist.tabs.tours')} ({tours.length})
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'partners'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('wishlist.tabs.partners')} ({partners.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-white border border-stone-200 rounded-none animate-fade-in-up opacity-0 delay-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-xl font-medium text-slate-900 flex items-center tracking-tight">
              <FunnelIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
              {t('wishlist.filters.title')}
            </h2>
            
            <div className="text-sm font-normal" style={{ color: '#D4AF37' }}>
              {t('wishlist.filters.showing', { display: currentItems.length, total: activeTab === 'tours' ? tours.length : partners.length })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="text"
                placeholder={activeTab === 'tours' ? t('wishlist.filters.searchPlaceholder') : t('wishlist.filters.searchPlaceholderPartners')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
              />
            </div>

            {/* Category Filter (only for tours) */}
            {activeTab === 'tours' && (
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
              >
                <option value="all">{t('wishlist.filters.category.all')}</option>
                <option value="beach">{t('wishlist.filters.category.beach')}</option>
                <option value="mountain">{t('wishlist.filters.category.mountain')}</option>
                <option value="city">{t('wishlist.filters.category.city')}</option>
                <option value="culture">{t('wishlist.filters.category.culture')}</option>
              </select>
            )}

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
            >
              {activeTab === 'tours' ? (
                <>
                  <option value="newest">{t('wishlist.filters.sort.newest')}</option>
                  <option value="oldest">{t('wishlist.filters.sort.oldest')}</option>
                  <option value="price-low">{t('wishlist.filters.sort.priceLow')}</option>
                  <option value="price-high">{t('wishlist.filters.sort.priceHigh')}</option>
                  <option value="rating">{t('wishlist.filters.sort.rating')}</option>
                </>
              ) : (
                <>
                  <option value="newest">{t('wishlist.filters.sort.newest')}</option>
                  <option value="nameAsc">{t('wishlist.filters.sort.nameAsc')}</option>
                  <option value="nameDesc">{t('wishlist.filters.sort.nameDesc')}</option>
                  <option value="rating">{t('wishlist.filters.sort.rating')}</option>
                </>
              )}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
            >
              {t('wishlist.filters.clearFilters')}
            </Button>
          </div>
        </Card>

        {/* Content Grid */}
        {currentItemsPage.length > 0 ? (
          <>
            {activeTab === 'tours' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                {currentItemsPage.map((tour) => (
                  <Card key={tour.id} className="overflow-hidden bg-white border border-stone-200 rounded-none hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative">
                      <Link to={`/tours/${tour.slug}`} className="group">
                        <img
                          src={tour.image}
                          alt={tour.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(tour.id, tour.name)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-none hover:bg-white transition-colors group border border-stone-200"
                        title={t('wishlist.tour.removeTitle')}
                      >
                        <XMarkIcon className="h-4 w-4 text-slate-600 group-hover:text-red-500 transition-colors duration-300" />
                      </button>

                      {tour.originalPrice && (
                        <div className="absolute top-3 left-3 text-white px-2 py-1 rounded-none text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                          -{Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <Link to={`/tours/${tour.slug}`}>
                        <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight transition-colors line-clamp-2 min-h-[3.5rem]">
                          {tour.name}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] font-normal">
                        {tour.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4 min-h-[3rem]">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                          <span className="font-normal">{tour.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                          <span className="font-normal">{tour.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                          <span className="font-normal">{t('wishlist.tour.maxPeople', { count: tour.maxPeople })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4 min-h-[1.5rem]">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 fill-current" style={{ color: '#D4AF37' }} />
                          <span className="font-medium text-sm text-slate-900">{tour.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-normal">{t('wishlist.tour.reviews', { count: tour.reviewCount })}</span>
                      </div>

                      <div className="flex-1"></div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {tour.originalPrice && (
                            <span className="text-xs text-gray-400 line-through font-normal">
                              {formatPrice(tour.originalPrice)}
                            </span>
                          )}
                          <span className="text-xl font-normal" style={{ color: '#D4AF37' }}>
                            {formatPrice(tour.price)}
                          </span>
                        </div>

                        <Link
                          to={`/tours/${tour.slug}`}
                          className="text-white px-4 py-2 rounded-none text-sm font-medium transition-all duration-300 hover:opacity-90 tracking-wide" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                        >
                          {t('wishlist.tour.viewDetails')}
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-200">
                        <p className="text-xs text-gray-500 font-normal">
                          {t('wishlist.tour.addedDate', { date: formatDate(tour.addedDate) })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                {currentItemsPage.map((partner) => (
                  <Card key={partner.id} className="overflow-hidden bg-white border border-stone-200 rounded-none hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative">
                      <Link to={`/partners/${partner.slug}`} className="group">
                        <div className="aspect-video overflow-hidden">
                          {partner.images && partner.images.length > 0 ? (
                            <img
                              src={partner.images.find(img => img.imageType === 'cover')?.imageUrl || partner.images[0]?.imageUrl || ''}
                              alt={partner.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                              <span className="text-gray-400 text-sm font-normal">{t('partners.card.missingImage')}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => handleRemovePartner(partner.id, partner.name)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-none hover:bg-white transition-colors group border border-stone-200"
                        title={t('wishlist.partner.removeTitle')}
                      >
                        <XMarkIcon className="h-4 w-4 text-slate-600 group-hover:text-red-500 transition-colors duration-300" />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <Link to={`/partners/${partner.slug}`}>
                        <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight transition-colors line-clamp-2 min-h-[3.5rem]">
                          {partner.name}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] font-normal">
                        {partner.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4 min-h-[3rem]">
                        <div className="flex items-center space-x-1">
                          <TicketIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                          <span className="font-normal">{partner.totalTours || 0} {t('wishlist.partner.tours')}</span>
                        </div>
                        {partner.establishedYear && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                            <span className="font-normal">{t('partners.card.fromLabel')} {partner.establishedYear}</span>
                          </div>
                        )}
                        {partner.address && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                            <span className="font-normal truncate">{partner.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-4 min-h-[1.5rem]">
                        <div className="flex items-center space-x-1">
                          <StarIconSolid className="h-4 w-4 fill-current" style={{ color: '#D4AF37' }} />
                          <span className="font-medium text-sm text-slate-900">{(partner.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-normal">({partner.totalReviews || 0} {t('partners.card.reviews')})</span>
                      </div>

                      <div className="flex-1"></div>

                      <Link
                        to={`/partners/${partner.slug}`}
                        className="w-full text-white px-4 py-2 rounded-none text-sm font-medium text-center transition-all duration-300 hover:opacity-90 tracking-wide" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                      >
                        {t('wishlist.partner.viewDetails')}
                      </Link>
                    </div>
                  </Card>
                ))}
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
          </>
        ) : (
          <Card className="p-12 text-center bg-white border border-stone-200 rounded-none">
            <HeartIcon className="mx-auto h-16 w-16 mb-4" style={{ color: '#D4AF37' }} />
            <h3 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
              {filters.search || filters.category !== 'all'
                ? t('wishlist.empty.noResults')
                : activeTab === 'tours' ? t('wishlist.empty.noWishlist') : t('wishlist.empty.noPartners')
              }
            </h3>
            <p className="text-gray-600 mb-6 font-normal">
              {filters.search || filters.category !== 'all'
                ? t('wishlist.empty.noResultsDescription')
                : activeTab === 'tours' ? t('wishlist.empty.noWishlistDescription') : t('wishlist.empty.noPartnersDescription')
              }
            </p>
            <div className="flex justify-center space-x-4">
              {(filters.search || filters.category !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none">
                  {t('wishlist.filters.clearFilters')}
                </Button>
              )}
              <Link to={activeTab === 'tours' ? '/tours' : '/partners'}>
                <Button className="text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                  {activeTab === 'tours' ? t('wishlist.empty.exploreTours') : t('wishlist.empty.explorePartners')}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
