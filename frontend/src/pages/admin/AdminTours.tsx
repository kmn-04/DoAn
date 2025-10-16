import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon as StarOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';
import ImageUpload from '../../components/admin/ImageUpload';

interface Tour {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  tourType?: string;
  departureLocation?: string;
  destination?: string;
  price: number;
  salePrice?: number;
  childPrice?: number;
  duration: string;
  minPeople?: number;
  maxPeople?: number;
  minGroupSize?: number;
  maxGroupSize?: number;
  region?: string;
  suitableFor?: string | string[]; // Can be string from backend or array from form
  mainImage?: string;
  images?: string[];
  overview: string;
  highlights: string;
  included: string;
  excluded: string;
  includedServices?: string[];
  excludedServices?: string[];
  importantNotes: string;
  cancellationPolicy: string;
  difficulty: string;
  location: string;
  categoryId: number;
  categoryName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isFeatured: boolean; // Backend returns isFeatured, not featured
  itineraries?: Itinerary[];
}

interface Category {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
  type: string;
}

interface PartnerInfo {
  id: number;
  name: string;
  type: string;
  address?: string;
  rating?: number;
}

interface Itinerary {
  dayNumber: number;
  title: string;
  description: string;
  location: string;
  activities?: string[] | string;
  meals: string;
  accommodation: string;
  accommodationPartnerId?: number;
  mealsPartnerId?: number;
  accommodationPartner?: PartnerInfo;
  mealsPartner?: PartnerInfo;
}

interface TourFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  tourType: string;
  departureLocation: string;
  destination: string;
  price?: number;
  salePrice?: number;
  childPrice?: number;
  duration: string;
  minPeople: number;
  maxPeople: number;
  region?: string;
  suitableFor: string[]; // Array of suitable for options
  mainImage?: string;
  images: string[]; // Array of image URLs
  overview: string;
  highlights: string;
  included: string;
  excluded: string;
  importantNotes: string;
  cancellationPolicy: string;
  difficulty: string;
  location?: string;
  categoryId: number;
  status: 'ACTIVE' | 'INACTIVE';
  featured: boolean;
  itineraries: Itinerary[];
}

const AdminTours: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats - GLOBAL (not affected by filters/pagination)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0
  });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [viewingTour, setViewingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState<TourFormData>({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    tourType: 'DOMESTIC',
    departureLocation: '',
    destination: '',
    price: undefined,
    salePrice: undefined,
    childPrice: undefined,
    duration: '',
    minPeople: 1,
    maxPeople: 20,
    region: '',
    suitableFor: [],
    mainImage: '',
    images: [],
    overview: '',
    highlights: '',
    included: '',
    excluded: '',
    importantNotes: '',
    cancellationPolicy: '',
    difficulty: 'Easy',
    location: undefined,
    categoryId: 0,
    status: 'ACTIVE',
    featured: false,
    itineraries: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCategoriesAndPartners();
    fetchGlobalStats();
  }, []);
  
  const fetchGlobalStats = async () => {
    try {
      const [totalRes, activeRes, inactiveRes, featuredRes] = await Promise.all([
        apiClient.get('/admin/tours/count'),
        apiClient.get('/admin/tours/count/active'),
        apiClient.get('/admin/tours/count/inactive'),
        apiClient.get('/admin/tours/count/featured')
      ]);
      
      setStats({
        total: totalRes.data.data || 0,
        active: activeRes.data.data || 0,
        inactive: inactiveRes.data.data || 0,
        featured: featuredRes.data.data || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTours(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, featuredFilter, categoryFilter, priceFilter, sortBy, sortDirection]);

  useEffect(() => {
    fetchCategoriesAndPartners();
  }, []);

  const fetchCategoriesAndPartners = async () => {
    try {
      const [catResponse, partResponse] = await Promise.all([
        apiClient.get('/categories/active'),
        apiClient.get('/partners')
      ]);
      setCategories(catResponse.data.data || []);
      // Partners API returns List<PartnerResponse> directly in data field
      setPartners(partResponse.data.data || []);
      console.log('Loaded partners:', partResponse.data.data?.length || 0);
    } catch (error) {
      console.error('Error fetching categories/partners:', error);
    }
  };

  const fetchTours = async (page: number) => {
    try {
      setLoading(true);
      
      // Build query params with filters
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: sortBy,
        sortDir: sortDirection
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter === 'featured' ? 'true' : 'false');
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      if (priceFilter !== 'all') {
        if (priceFilter === 'low') {
          params.append('maxPrice', '5000000');
        } else if (priceFilter === 'medium') {
          params.append('minPrice', '5000000');
          params.append('maxPrice', '15000000');
        } else if (priceFilter === 'high') {
          params.append('minPrice', '15000000');
        }
      }
      
      const response = await apiClient.get(`/admin/tours?${params.toString()}`);
      
      const tours = response.data.data?.content || [];
      
      // Debug: Log first tour to check data structure
      if (tours.length > 0) {




      }
      
      setTours(tours);
      setTotalPages(response.data.data?.totalPages || 0);
      setTotalElements(response.data.data?.totalElements || 0);
      
      // Backend already filtered, so totalElements is the accurate filtered count
      setFilteredCount(response.data.data?.totalElements || 0);
      
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const openCreateModal = () => {
    setEditingTour(null);
    setFormData({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      tourType: 'DOMESTIC',
      departureLocation: '',
      destination: '',
      price: 0,
      salePrice: undefined,
      childPrice: undefined,
      duration: '',
      minPeople: 1,
      maxPeople: 20,
      region: '',
      suitableFor: [],
      mainImage: '',
      images: [],
      overview: '',
      highlights: '',
      included: '',
      excluded: '',
      importantNotes: '',
      cancellationPolicy: '',
      difficulty: 'Easy',
      location: undefined,
      categoryId: categories[0]?.id || 0,
      status: 'ACTIVE',
      featured: false,
      itineraries: []
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Auto-generate itineraries when duration changes
  const handleDurationChange = (newDuration: string) => {
    const days = parseInt(newDuration) || 0;
    
    if (days > 0 && days <= 30) {
      const newItineraries: Itinerary[] = [];
      for (let i = 1; i <= days; i++) {
        newItineraries.push({
          dayNumber: i,
          title: `Ngày ${i}`,
          description: '',
          location: '',
          meals: '',
          accommodation: '',
          accommodationPartnerId: 0,
          mealsPartnerId: 0
        });
      }
      
      setFormData(prev => ({
        ...prev,
        duration: newDuration,
        itineraries: newItineraries
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        duration: newDuration
      }));
    }
  };

  const updateItinerary = (index: number, field: keyof Itinerary, value: string) => {
    setFormData(prev => ({
      ...prev,
      itineraries: prev.itineraries.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    
    // Extract images URLs from TourImageRequest objects if needed
    // IMPORTANT: Exclude primary image (isPrimary = true) from additional images
    let imageUrls: string[] = [];
    if (tour.images) {
      if (Array.isArray(tour.images)) {
        imageUrls = tour.images
          .filter(img => {
            // If it's an object, check isPrimary flag
            if (typeof img === 'object' && img !== null) {
              return !(img as any).isPrimary; // Exclude primary images
            }
            return true; // Keep strings
          })
          .map(img => {
            // If it's an object with imageUrl property, extract it
            if (typeof img === 'object' && img !== null && 'imageUrl' in img) {
              return (img as any).imageUrl;
            }
            // Otherwise, assume it's already a string
            return typeof img === 'string' ? img : '';
          })
          .filter(url => url); // Remove empty strings
      }
    }


    
    setFormData({
      name: tour.name || '',
      slug: tour.slug || '',
      shortDescription: tour.shortDescription || '',
      description: tour.description || '',
      tourType: tour.tourType || 'DOMESTIC',
      departureLocation: tour.departureLocation || '',
      destination: tour.destination || '',
      price: tour.price,
      salePrice: tour.salePrice,
      childPrice: tour.childPrice,
      duration: tour.duration || '',
      minPeople: tour.minPeople || tour.minGroupSize || 1,
      maxPeople: tour.maxPeople || tour.maxGroupSize || 20,
      region: tour.region || '',
      suitableFor: Array.isArray(tour.suitableFor) 
        ? tour.suitableFor 
        : (tour.suitableFor ? tour.suitableFor.split(',').map(s => s.trim()) : []),
      mainImage: tour.mainImage || '',
      images: imageUrls,
      overview: tour.description || '', // "Tổng quan" = description (mô tả đầy đủ)
      highlights: Array.isArray(tour.highlights) ? tour.highlights.join('\n') : (tour.highlights || ''),
      included: Array.isArray(tour.includedServices) ? tour.includedServices.join('\n') : (tour.included || ''),
      excluded: Array.isArray(tour.excludedServices) ? tour.excludedServices.join('\n') : (tour.excluded || ''),
      importantNotes: tour.importantNotes || (tour as any).note || '',
      cancellationPolicy: tour.cancellationPolicy || '',
      difficulty: tour.difficulty || 'Easy',
      location: tour.location || '',
      categoryId: tour.category?.id || tour.categoryId || 0,
      status: tour.status || 'ACTIVE',
      featured: tour.isFeatured || false,
      // Map itineraries with partner IDs
      itineraries: (tour.itineraries || []).map(itin => ({
        ...itin,
        accommodationPartnerId: itin.accommodationPartner?.id || itin.accommodationPartnerId || 0,
        mealsPartnerId: itin.mealsPartner?.id || itin.mealsPartnerId || 0
      }))
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (tour: Tour) => {
    setViewingTour(tour);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingTour(null);
    setViewingTour(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên tour là bắt buộc';
    }
    if (!formData.shortDescription.trim()) {
      errors.shortDescription = 'Mô tả ngắn là bắt buộc';
    }
    if (!formData.tourType) {
      errors.tourType = 'Loại tour là bắt buộc';
    }
    if (!formData.departureLocation.trim()) {
      errors.departureLocation = 'Điểm khởi hành là bắt buộc';
    }
    if (!formData.destination.trim()) {
      errors.destination = 'Điểm đến là bắt buộc';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }
    if (!formData.duration || (typeof formData.duration === 'string' && !formData.duration.trim())) {
      errors.duration = 'Thời gian là bắt buộc';
    }
    if (formData.minPeople < 1) {
      errors.minPeople = 'Số người tối thiểu phải >= 1';
    }
    if (formData.maxPeople < 1) {
      errors.maxPeople = 'Số người tối đa phải >= 1';
    }
    if (formData.minPeople > formData.maxPeople) {
      errors.minPeople = 'Số người tối thiểu không được lớn hơn số người tối đa';
    }
    if (formData.categoryId === 0) {
      errors.categoryId = 'Vui lòng chọn danh mục';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Transform form data to match backend expectations
      const tourData = {
        name: formData.name,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        description: formData.description,
        tourType: formData.tourType,
        departureLocation: formData.departureLocation,
        destination: formData.destination,
        location: formData.location || formData.destination,
        // Convert duration to integer
        duration: parseInt(formData.duration) || 1,
        // Pricing
        price: formData.price ? Number(formData.price) : 0,
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        childPrice: formData.childPrice ? Number(formData.childPrice) : null,
        // People counts
        minPeople: Number(formData.minPeople),
        maxPeople: Number(formData.maxPeople),
        // Category and status
        categoryId: Number(formData.categoryId),
        status: formData.status,
        isFeatured: Boolean(formData.featured),
        difficulty: formData.difficulty,
        // Text fields
        overview: formData.overview || null,
        note: formData.importantNotes || null, // Backend uses 'note' not 'importantNotes'
        cancellationPolicy: formData.cancellationPolicy || null,
        // Convert string fields to List<String> for backend
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        includedServices: formData.included ? formData.included.split('\n').filter(i => i.trim()) : [],
        excludedServices: formData.excluded ? formData.excluded.split('\n').filter(e => e.trim()) : [],
        // New fields
        region: formData.region || null,
        suitableFor: formData.suitableFor.length > 0 ? formData.suitableFor.join(', ') : null,
        mainImage: formData.mainImage || null,
        // Transform images: convert string[] to TourImageRequest[]
        // NOTE: All images in formData.images are ADDITIONAL images (NOT primary)
        // IMPORTANT: Remove mainImage from additional images if user accidentally added it
        images: formData.images
          .filter(url => url !== formData.mainImage) // Remove mainImage from additional images
          .map((url) => ({
            imageUrl: url,
            caption: null,
            isPrimary: false  // ← Ảnh bổ sung KHÔNG BAO GIỜ là primary!
          })),
        // Transform itineraries: convert 0 to null for partner IDs
        itineraries: formData.itineraries.map(itin => ({
          ...itin,
          accommodationPartnerId: itin.accommodationPartnerId && itin.accommodationPartnerId > 0 ? itin.accommodationPartnerId : null,
          mealsPartnerId: itin.mealsPartnerId && itin.mealsPartnerId > 0 ? itin.mealsPartnerId : null,
        })),
      };
      
      if (editingTour) {
        await apiClient.put(`/admin/tours/${editingTour.id}`, tourData);
        alert('Cập nhật tour thành công!');
      } else {
        const response = await apiClient.post('/admin/tours', tourData);

        alert('Thêm mới tour thành công!');
      }
      
      closeModal();
      // Refresh tours list to get the latest data with all images loaded
      await fetchTours(currentPage);
    } catch (error) {
      console.error('Error saving tour:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Show confirmation dialog
    const tour = tours.find(t => t.id === id);
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa tour "${tour?.name || id}"?\n\n` +
      `⚠️ Lưu ý: Tour sẽ bị xóa vĩnh viễn và không thể khôi phục!\n` +
      `(Nếu tour có booking, bạn không thể xóa. Hãy đặt trạng thái "Inactive" thay vì xóa)`
    );
    
    if (!confirmed) {
      return; // User clicked "Hủy"
    }

    try {
      setLoading(true);
      await apiClient.delete(`/admin/tours/${id}`);
      await Promise.all([
        fetchTours(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('Error deleting tour:', error);
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.response?.data?.error || 
                          'Không thể xóa tour';
      alert(`❌ Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      setLoading(true);
      console.log(`🔄 Updating tour ${id} status to: ${newStatus}`);
      
      const response = await apiClient.patch(`/admin/tours/${id}/status?status=${newStatus}`);
      console.log('✅ Status update response:', response.data);
      
      // Update local state immediately for instant UI feedback
      setTours(prevTours => 
        prevTours.map(tour => 
          tour.id === id ? { ...tour, status: newStatus } : tour
        )
      );
      
      // Then refresh from server to ensure sync
      await Promise.all([
        fetchTours(currentPage),
        fetchGlobalStats()
      ]);
      
      console.log('✅ Tours reloaded');
    } catch (error) {
      console.error('❌ Error updating status:', error);
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const errorMsg = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Không thể cập nhật trạng thái';
      alert(errorMsg);
      // Reload on error to revert optimistic update
      await fetchTours(currentPage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/tours/${id}/featured?featured=${!currentFeatured}`);
      // Refresh both tours list and global stats
      await Promise.all([
        fetchTours(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('Error toggling featured:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý tour du lịch</h1>
          <button onClick={openCreateModal} className="admin-btn-primary">
            <PlusIcon className="h-5 w-5" />
            Thêm tour
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng tour</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đang hoạt động</p>
                <p className="admin-stat-value">{stats.active}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Ngừng hoạt động</p>
                <p className="admin-stat-value">{stats.inactive}</p>
              </div>
              <div className="admin-stat-icon bg-gray-100">
                <XCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Nổi bật</p>
                <p className="admin-stat-value">{stats.featured}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <StarSolid className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || featuredFilter !== 'all' || categoryFilter !== 'all' || priceFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> tour
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Danh mục</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-label">Giá</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="low">&lt; 5 triệu</option>
                <option value="medium">5 - 15 triệu</option>
                <option value="high">&gt; 15 triệu</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDirection(dir as 'asc' | 'desc');
                }}
                className="admin-select"
              >
                <option value="id-asc">Mặc định</option>
                <option value="price-asc">Giá thấp - cao</option>
                <option value="price-desc">Giá cao - thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Tên tour</th>
                <th className="admin-table-th">Địa điểm</th>
                <th className="admin-table-th">Giá</th>
                <th className="admin-table-th">Thời gian</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Nổi bật</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="admin-loading">
                    <div className="admin-spinner">
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="admin-table-row">
                    <td className="admin-table-td">{tour.id}</td>
                    <td className="admin-table-td font-medium">{tour.name}</td>
                    <td className="admin-table-td">{tour.destination || tour.location}</td>
                    <td className="admin-table-td font-semibold text-blue-600">{formatPrice(tour.price)}</td>
                    <td className="admin-table-td">{tour.duration}</td>
                    <td className="admin-table-td">
                      <select
                        key={`status-${tour.id}-${tour.status}`}
                        value={tour.status}
                        onChange={(e) => handleStatusChange(tour.id, e.target.value as 'ACTIVE' | 'INACTIVE')}
                        className={
                          tour.status === 'ACTIVE'
                            ? 'admin-table-select-active'
                            : 'admin-table-select-inactive'
                        }
                        disabled={loading}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <button
                        onClick={() => handleToggleFeatured(tour.id, tour.isFeatured)}
                        className="focus:outline-none"
                        title={tour.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      >
                        {tour.isFeatured ? (
                          <StarSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarOutline className="h-5 w-5 text-gray-300 hover:text-yellow-500" />
                        )}
                      </button>
                    </td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(tour)}
                          className="admin-icon-btn-view"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(tour)}
                          className="admin-icon-btn-edit"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id)}
                          className="admin-icon-btn-delete"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {tours.length} / {totalElements} tour
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingTour && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-4xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết tour</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin cơ bản</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">ID</p>
                        <p className="admin-view-value">{viewingTour.id}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tên tour</p>
                        <p className="admin-view-value">{viewingTour.name}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Slug</p>
                        <p className="admin-view-value text-sm text-gray-600">{viewingTour.slug}</p>
                      </div>
                      <div className="admin-view-item col-span-2">
                        <p className="admin-view-label">📍 Địa điểm</p>
                        <p className="admin-view-value text-blue-600">
                          {viewingTour.location}
                          {viewingTour.destination && viewingTour.destination !== viewingTour.location && (
                            <span className="text-gray-600"> → {viewingTour.destination}</span>
                          )}
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giá gốc</p>
                        <p className="admin-view-value text-blue-600 font-semibold">{formatPrice(viewingTour.price)}</p>
                      </div>
                      {viewingTour.salePrice && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">Giá khuyến mãi</p>
                          <p className="admin-view-value text-red-600 font-semibold">{formatPrice(viewingTour.salePrice)}</p>
                        </div>
                      )}
                      {viewingTour.childPrice && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">Giá trẻ em</p>
                          <p className="admin-view-value text-green-600 font-semibold">{formatPrice(viewingTour.childPrice)}</p>
                        </div>
                      )}
                      <div className="admin-view-item">
                        <p className="admin-view-label">Thời gian</p>
                        <p className="admin-view-value">{viewingTour.duration} ngày</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Số người tối thiểu</p>
                        <p className="admin-view-value">{viewingTour.minPeople || viewingTour.minGroupSize || 1} người</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Số người tối đa</p>
                        <p className="admin-view-value">{viewingTour.maxPeople || viewingTour.maxGroupSize || 'Không giới hạn'} người</p>
                      </div>
                      {viewingTour.region && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">Khu vực</p>
                          <p className="admin-view-value">
                            <span className="admin-badge-blue">{viewingTour.region}</span>
                          </p>
                        </div>
                      )}
                      {viewingTour.suitableFor && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">Phù hợp cho</p>
                          <p className="admin-view-value text-sm">{viewingTour.suitableFor}</p>
                        </div>
                      )}
                      <div className="admin-view-item">
                        <p className="admin-view-label">Độ khó</p>
                        <p className="admin-view-value">
                          <span className="admin-badge-blue">{viewingTour.difficulty || 'Trung bình'}</span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái</p>
                        <p className="admin-view-value">
                          <span className={viewingTour.status === 'ACTIVE' ? 'admin-badge-green' : 'admin-badge-gray'}>
                            {viewingTour.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Nổi bật</p>
                        <p className="admin-view-value">
                          {viewingTour.isFeatured ? (
                            <span className="admin-badge-yellow">Có</span>
                          ) : (
                            <span className="admin-badge-gray">Không</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  {(viewingTour.mainImage || (viewingTour.images && viewingTour.images.length > 0)) && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">
                        Hình ảnh ({(viewingTour.mainImage ? 1 : 0) + (viewingTour.images?.length || 0)})
                      </h4>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {/* Main image first */}
                        {viewingTour.mainImage && (
                          <div className="relative aspect-square rounded overflow-hidden border border-gray-200">
                            <img
                              src={viewingTour.mainImage}
                              alt="Tour main"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                              Chính
                            </span>
                          </div>
                        )}
                        {/* Additional images */}
                        {viewingTour.images && viewingTour.images.map((image: any, index: number) => {
                          const imageUrl = typeof image === 'string' ? image : image.imageUrl;
                          return (
                            <div key={index} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                              <img
                                src={imageUrl}
                                alt={`Tour ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Mô tả</h4>
                    <p className="text-sm text-gray-700">{viewingTour.description || 'Chưa có mô tả'}</p>
                  </div>

                  {/* Overview */}
                  {viewingTour.overview && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Tổng quan</h4>
                      <p className="text-sm text-gray-700">{viewingTour.overview}</p>
                    </div>
                  )}

                  {/* Highlights */}
                  {viewingTour.highlights && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Điểm nổi bật</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{viewingTour.highlights}</p>
                    </div>
                  )}

                  {/* Included/Excluded */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Bao gồm & Không bao gồm</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-green-600 font-semibold mb-2">✓ Bao gồm</p>
                        {viewingTour.includedServices && viewingTour.includedServices.length > 0 ? (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {viewingTour.includedServices.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Chưa cập nhật</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-red-600 font-semibold mb-2">✗ Không bao gồm</p>
                        {viewingTour.excludedServices && viewingTour.excludedServices.length > 0 ? (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {viewingTour.excludedServices.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">✗</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Chưa cập nhật</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Display */}
                  {viewingTour.itineraries && viewingTour.itineraries.length > 0 && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">📅 Lịch trình chi tiết</h4>
                      <div className="space-y-4">
                        {viewingTour.itineraries.map((day, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                {day.dayNumber}
                              </span>
                              <h5 className="font-semibold text-gray-900">{day.title}</h5>
                            </div>
                            
                            {day.location && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">📍 Địa điểm:</span> {day.location}
                              </p>
                            )}
                            
                            {day.description && (
                              <div className="text-sm text-gray-700 mb-3">
                                <span className="font-medium">📝 Mô tả:</span>
                                <p className="mt-1 whitespace-pre-line">{day.description}</p>
                              </div>
                            )}
                            
                            {day.activities && day.activities.length > 0 && (
                              <div className="text-sm text-gray-700 mb-3">
                                <span className="font-medium">🎯 Hoạt động chi tiết:</span>
                                <div className="mt-1 whitespace-pre-line">
                                  {Array.isArray(day.activities) 
                                    ? day.activities.join('\n')
                                    : day.activities
                                  }
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {(day.accommodation || day.accommodationPartner) && (
                                <div className="bg-white p-2 rounded border">
                                  <span className="font-medium text-gray-600">🏨 Khách sạn:</span>
                                  {day.accommodationPartner ? (
                                    <div className="mt-1">
                                      <p className="text-gray-900 font-semibold">{day.accommodationPartner.name}</p>
                                      {day.accommodationPartner.address && (
                                        <p className="text-gray-600 text-xs mt-0.5">📍 {day.accommodationPartner.address}</p>
                                      )}
                                      {day.accommodationPartner.rating && (
                                        <p className="text-yellow-600 text-xs mt-0.5">⭐ {day.accommodationPartner.rating}/5</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-800 mt-1">{day.accommodation}</p>
                                  )}
                                </div>
                              )}
                              {(day.meals || day.mealsPartner) && (
                                <div className="bg-white p-2 rounded border">
                                  <span className="font-medium text-gray-600">🍽️ Nhà hàng:</span>
                                  {day.mealsPartner ? (
                                    <div className="mt-1">
                                      <p className="text-gray-900 font-semibold">{day.mealsPartner.name}</p>
                                      {day.mealsPartner.address && (
                                        <p className="text-gray-600 text-xs mt-0.5">📍 {day.mealsPartner.address}</p>
                                      )}
                                      {day.mealsPartner.rating && (
                                        <p className="text-yellow-600 text-xs mt-0.5">⭐ {day.mealsPartner.rating}/5</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-800 mt-1">{day.meals}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Notes */}
                  {viewingTour.importantNotes && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Lưu ý quan trọng</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{viewingTour.importantNotes}</p>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {viewingTour.cancellationPolicy && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Chính sách hủy</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{viewingTour.cancellationPolicy}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => { closeModal(); openEditModal(viewingTour); }} className="admin-btn-primary">
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-4xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {editingTour ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-6">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Thông tin cơ bản</h4>
                      
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="admin-label">
                          Tên tour <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setFormData({ ...formData, name, slug: generateSlug(name) });
                          }}
                          className={`admin-input ${formErrors.name ? 'admin-input-error' : ''}`}
                          placeholder="Nhập tên tour"
                        />
                        {formErrors.name && <p className="admin-error-text">{formErrors.name}</p>}
                      </div>

                      {/* Slug (auto-generated) */}
                      <div>
                        <label htmlFor="slug" className="admin-label">Slug (tự động)</label>
                        <input
                          type="text"
                          id="slug"
                          value={formData.slug}
                          className="admin-input bg-gray-50"
                          disabled
                        />
                        <p className="admin-helper-text">Được tạo tự động từ tên tour</p>
                      </div>

                      {/* Short Description */}
                      <div>
                        <label htmlFor="shortDescription" className="admin-label">
                          Mô tả ngắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="shortDescription"
                          value={formData.shortDescription}
                          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                          className={`admin-input ${formErrors.shortDescription ? 'admin-input-error' : ''}`}
                          rows={2}
                          placeholder="Mô tả ngắn gọn về tour (tối đa 500 ký tự)"
                          maxLength={500}
                        />
                        {formErrors.shortDescription && <p className="admin-error-text">{formErrors.shortDescription}</p>}
                      </div>

                      {/* Tour Type, Departure, Destination */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="tourType" className="admin-label">
                            Loại tour <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="tourType"
                            value={formData.tourType}
                            onChange={(e) => {
                              // Reset region khi đổi loại tour
                              setFormData({ 
                                ...formData, 
                                tourType: e.target.value,
                                region: '' // Reset về empty để user chọn lại
                              });
                            }}
                            className={`admin-select ${formErrors.tourType ? 'admin-input-error' : ''}`}
                          >
                            <option value="DOMESTIC">Trong nước</option>
                            <option value="INTERNATIONAL">Ngoài nước</option>
                          </select>
                          {formErrors.tourType && <p className="admin-error-text">{formErrors.tourType}</p>}
                        </div>
                        <div>
                          <label htmlFor="departureLocation" className="admin-label">
                            Điểm khởi hành <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="departureLocation"
                            value={formData.departureLocation}
                            onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                            className={`admin-input ${formErrors.departureLocation ? 'admin-input-error' : ''}`}
                            placeholder="Hà Nội"
                          />
                          {formErrors.departureLocation && <p className="admin-error-text">{formErrors.departureLocation}</p>}
                        </div>
                        <div>
                          <label htmlFor="destination" className="admin-label">
                            Điểm đến <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="destination"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className={`admin-input ${formErrors.destination ? 'admin-input-error' : ''}`}
                            placeholder="Đà Nẵng"
                          />
                          {formErrors.destination && <p className="admin-error-text">{formErrors.destination}</p>}
                        </div>
                      </div>

                      {/* Duration, Min/Max People */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="duration" className="admin-label">
                            Thời gian <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="duration"
                            value={formData.duration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            className={`admin-input ${formErrors.duration ? 'admin-input-error' : ''}`}
                            placeholder="3"
                          />
                          {formErrors.duration && <p className="admin-error-text">{formErrors.duration}</p>}
                        </div>
                        <div>
                          <label htmlFor="minPeople" className="admin-label">
                            Số người tối thiểu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="minPeople"
                            value={formData.minPeople}
                            onChange={(e) => setFormData({ ...formData, minPeople: parseInt(e.target.value) || 1 })}
                            className={`admin-input ${formErrors.minPeople ? 'admin-input-error' : ''}`}
                            min="1"
                            placeholder="1"
                          />
                          {formErrors.minPeople && <p className="admin-error-text">{formErrors.minPeople}</p>}
                        </div>
                        <div>
                          <label htmlFor="maxPeople" className="admin-label">
                            Số người tối đa <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="maxPeople"
                            value={formData.maxPeople}
                            onChange={(e) => setFormData({ ...formData, maxPeople: parseInt(e.target.value) || 1 })}
                            className={`admin-input ${formErrors.maxPeople ? 'admin-input-error' : ''}`}
                            min="1"
                            placeholder="20"
                          />
                          {formErrors.maxPeople && <p className="admin-error-text">{formErrors.maxPeople}</p>}
                        </div>
                      </div>

                      {/* Price, Difficulty */}
                      {/* Pricing Section */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="price" className="admin-label">
                            Giá gốc (VNĐ) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="price"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                            className={`admin-input ${formErrors.price ? 'admin-input-error' : ''}`}
                            min="0"
                            step="1"
                            placeholder="5000000"
                          />
                          {formErrors.price && <p className="admin-error-text">{formErrors.price}</p>}
                        </div>
                        <div>
                          <label htmlFor="salePrice" className="admin-label">
                            Giá khuyến mãi (VNĐ)
                          </label>
                          <input
                            type="number"
                            id="salePrice"
                            value={formData.salePrice || ''}
                            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || undefined })}
                            className="admin-input"
                            min="0"
                            step="1"
                            placeholder="4500000"
                          />
                        </div>
                        <div>
                          <label htmlFor="childPrice" className="admin-label">
                            Giá trẻ em (VNĐ)
                          </label>
                          <input
                            type="number"
                            id="childPrice"
                            value={formData.childPrice || ''}
                            onChange={(e) => setFormData({ ...formData, childPrice: parseFloat(e.target.value) || undefined })}
                            className="admin-input"
                            min="0"
                            step="1"
                            placeholder="2500000"
                          />
                        </div>
                      </div>

                      {/* Region & Difficulty */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="region" className="admin-label">
                            Khu vực
                          </label>
                          <select
                            id="region"
                            value={formData.region || ''}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="admin-select"
                          >
                            <option value="">-- Chọn khu vực --</option>
                            {formData.tourType === 'DOMESTIC' ? (
                              <>
                                <option value="Miền Bắc">Miền Bắc</option>
                                <option value="Miền Trung">Miền Trung</option>
                                <option value="Miền Nam">Miền Nam</option>
                              </>
                            ) : (
                              <>
                                <option value="Châu Á">Châu Á</option>
                                <option value="Châu Âu">Châu Âu</option>
                                <option value="Châu Mỹ">Châu Mỹ</option>
                                <option value="Châu Úc">Châu Úc</option>
                                <option value="Châu Phi">Châu Phi</option>
                              </>
                            )}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.tourType === 'DOMESTIC' 
                              ? '📍 Khu vực trong nước' 
                              : '🌍 Châu lục quốc tế'
                            }
                          </p>
                        </div>
                        <div>
                          <label htmlFor="difficulty" className="admin-label">Độ khó</label>
                          <select
                            id="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="admin-select"
                          >
                            <option value="Easy">Dễ</option>
                            <option value="Medium">Trung bình</option>
                            <option value="Hard">Khó</option>
                          </select>
                        </div>
                      </div>

                      {/* Suitable For - Checkbox Group */}
                      <div>
                        <label className="admin-label">
                          Phù hợp cho
                        </label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {[
                            'Gia đình',
                            'Cặp đôi',
                            'Nhóm bạn',
                            'Du lịch một mình',
                            'Người cao tuổi',
                            'Trẻ em',
                          ].map((option) => (
                            <label
                              key={option}
                              className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.suitableFor.includes(option)}
                                onChange={(e) => {
                                  const newSuitableFor = e.target.checked
                                    ? [...formData.suitableFor, option]
                                    : formData.suitableFor.filter(s => s !== option);
                                  setFormData({ ...formData, suitableFor: newSuitableFor });
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                        {formData.suitableFor.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Đã chọn: {formData.suitableFor.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label htmlFor="categoryId" className="admin-label">
                          Danh mục <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="categoryId"
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                          className={`admin-select ${formErrors.categoryId ? 'admin-input-error' : ''}`}
                        >
                          <option value="0">-- Chọn danh mục --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {formErrors.categoryId && <p className="admin-error-text">{formErrors.categoryId}</p>}
                      </div>

                      {/* Image Upload Section */}
                      <div className="border-t pt-4">
                        <ImageUpload
                          label="Ảnh chính"
                          value={formData.mainImage}
                          onChange={(url) => setFormData({ ...formData, mainImage: url as string })}
                          multiple={false}
                          required={true}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <ImageUpload
                          label="Ảnh bổ sung (tối đa 10 ảnh)"
                          value={formData.images}
                          onChange={(urls) => setFormData({ ...formData, images: urls as string[] })}
                          multiple={true}
                          maxFiles={10}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="admin-label">Mô tả ngắn</label>
                        <textarea
                          id="description"
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="admin-textarea"
                          placeholder="Mô tả ngắn gọn về tour"
                        />
                      </div>
                    </div>

                    {/* Section 2: Details */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Chi tiết tour</h4>
                      
                      {/* Overview */}
                      <div>
                        <label htmlFor="overview" className="admin-label">Tổng quan</label>
                        <textarea
                          id="overview"
                          rows={3}
                          value={formData.overview}
                          onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                          className="admin-textarea"
                          placeholder="Tổng quan về tour..."
                        />
                      </div>

                      {/* Highlights */}
                      <div>
                        <label htmlFor="highlights" className="admin-label">Điểm nổi bật</label>
                        <textarea
                          id="highlights"
                          rows={3}
                          value={formData.highlights}
                          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                          className="admin-textarea"
                          placeholder="Các điểm nổi bật của tour (mỗi dòng 1 điểm)..."
                        />
                      </div>

                      {/* Included */}
                      <div>
                        <label htmlFor="included" className="admin-label">Bao gồm</label>
                        <textarea
                          id="included"
                          rows={3}
                          value={formData.included}
                          onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                          className="admin-textarea"
                          placeholder="Những gì được bao gồm trong tour..."
                        />
                      </div>

                      {/* Excluded */}
                      <div>
                        <label htmlFor="excluded" className="admin-label">Không bao gồm</label>
                        <textarea
                          id="excluded"
                          rows={3}
                          value={formData.excluded}
                          onChange={(e) => setFormData({ ...formData, excluded: e.target.value })}
                          className="admin-textarea"
                          placeholder="Những gì không bao gồm trong tour..."
                        />
                      </div>

                      {/* Important Notes */}
                      <div>
                        <label htmlFor="importantNotes" className="admin-label">Lưu ý quan trọng</label>
                        <textarea
                          id="importantNotes"
                          rows={3}
                          value={formData.importantNotes}
                          onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
                          className="admin-textarea"
                          placeholder="Các lưu ý quan trọng cho khách hàng..."
                        />
                      </div>

                      {/* Cancellation Policy */}
                      <div>
                        <label htmlFor="cancellationPolicy" className="admin-label">Chính sách hủy</label>
                        <textarea
                          id="cancellationPolicy"
                          rows={3}
                          value={formData.cancellationPolicy}
                          onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                          className="admin-textarea"
                          placeholder="Chính sách hủy tour..."
                        />
                      </div>

                      {/* Itinerary Section */}
                      {formData.itineraries.length > 0 && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">
                            📅 Lịch trình chi tiết ({formData.itineraries.length} ngày)
                          </h3>
                          <div className="space-y-6">
                            {formData.itineraries.map((itinerary, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm mr-2">
                                    {itinerary.dayNumber}
                                  </span>
                                  Ngày {itinerary.dayNumber}
                                </h4>
                                
                                <div className="grid grid-cols-1 gap-3">
                                  {/* Title */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Tiêu đề
                                    </label>
                                    <input
                                      type="text"
                                      value={itinerary.title}
                                      onChange={(e) => updateItinerary(index, 'title', e.target.value)}
                                      className="admin-input text-sm"
                                      placeholder={`Ngày ${itinerary.dayNumber}: Điểm đến chính`}
                                    />
                                  </div>

                                  {/* Location */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Địa điểm
                                    </label>
                                    <input
                                      type="text"
                                      value={itinerary.location}
                                      onChange={(e) => updateItinerary(index, 'location', e.target.value)}
                                      className="admin-input text-sm"
                                      placeholder="Hà Nội, Vịnh Hạ Long, ..."
                                    />
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      📝 Mô tả chi tiết hoạt động trong ngày
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={itinerary.description}
                                      onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                                      className="admin-textarea text-sm"
                                      placeholder="VD: Sáng: Tham quan vịnh Hạ Long, du thuyền ngắm cảnh. Trưa: Dùng bữa trên thuyền với hải sản tươi sống. Chiều: Khám phá hang động Thiên Cung, bơi lội tại bãi tắm..."
                                    />
                                  </div>

                                  {/* Partner Selections */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🏨 Khách sạn
                                      </label>
                                      <select
                                        value={itinerary.accommodationPartnerId || 0}
                                        onChange={(e) => {
                                          const newItineraries = [...formData.itineraries];
                                          newItineraries[index] = {
                                            ...newItineraries[index],
                                            accommodationPartnerId: parseInt(e.target.value)
                                          };
                                          setFormData({ ...formData, itineraries: newItineraries });
                                        }}
                                        className="admin-select text-sm"
                                      >
                                        <option value="0">-- Chọn khách sạn --</option>
                                        {partners.filter(p => p.type === 'HOTEL').map(partner => (
                                          <option key={partner.id} value={partner.id}>{partner.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🍽️ Nhà hàng
                                      </label>
                                      <select
                                        value={itinerary.mealsPartnerId || 0}
                                        onChange={(e) => {
                                          const newItineraries = [...formData.itineraries];
                                          newItineraries[index] = {
                                            ...newItineraries[index],
                                            mealsPartnerId: parseInt(e.target.value)
                                          };
                                          setFormData({ ...formData, itineraries: newItineraries });
                                        }}
                                        className="admin-select text-sm"
                                      >
                                        <option value="0">-- Chọn nhà hàng --</option>
                                        {partners.filter(p => p.type === 'RESTAURANT').map(partner => (
                                          <option key={partner.id} value={partner.id}>{partner.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Status */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Trạng thái</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="status" className="admin-label">Trạng thái</label>
                          <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                            className="admin-select"
                          >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                          </select>
                        </div>
                        <div>
                          <label className="admin-label">Nổi bật</label>
                          <label className="flex items-center space-x-3 mt-2">
                            <input
                              type="checkbox"
                              checked={formData.featured}
                              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                              className="admin-checkbox"
                            />
                            <span className="text-sm text-gray-700">Hiển thị nổi bật</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    {loading ? 'Đang lưu...' : (editingTour ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTours;
