import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import tourService from '../services/tourService';
import categoryService from '../services/categoryService';
import TourFormModal from './TourFormModal';
import '../styles/components/TourManagement.css';
import '../styles/shared/ManagementCommon.css';

const TourManagement = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    const tourStatuses = [
        { value: 'DRAFT', label: 'Nháp' },
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' }
    ];

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.content || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await tourService.getTourStats();
            setStats(response);
        } catch (error) {
            console.error('Error loading tour stats:', error);
        }
    };

    const loadTours = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                size: pagination.size,
                sortBy: 'createdAt',
                sortDir: 'desc'
            };

            if (searchKeyword) params.keyword = searchKeyword;
            if (selectedStatus) params.status = selectedStatus;
            if (selectedCategory) params.categoryId = selectedCategory;

            const response = await tourService.getAllTours(params);
            setTours(response.content);
            setPagination(prev => ({
                ...prev,
                page: response.number,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages
            }));
        } catch (error) {
            setError('Lỗi khi tải danh sách tour');
            console.error('Error loading tours:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size, searchKeyword, selectedStatus, selectedCategory]);

    useEffect(() => {
        loadCategories();
        loadStats();
    }, []);

    // Load tours khi pagination thay đổi
    useEffect(() => {
        loadTours();
    }, [loadTours]);

    // Auto-trigger search khi filter thay đổi (không bao gồm pagination)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 0 })); // Reset về trang đầu khi filter
        }, 300); // Debounce 300ms để tránh gọi API quá nhiều

        return () => clearTimeout(timeoutId);
    }, [searchKeyword, selectedStatus, selectedCategory]);


    const handleEdit = (tour) => {
        setEditingTour(tour);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
            try {
                await tourService.deleteTour(id);
                loadTours();
            } catch (error) {
                alert('Lỗi khi xóa tour');
                console.error('Error deleting tour:', error);
            }
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingTour(null);
        loadTours();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleStatusChange = async (tourId, newStatus) => {
        try {
            const result = await tourService.updateTourStatus(tourId, newStatus);
            if (result.success) {
                setTours(prevTours => 
                    prevTours.map(tour => 
                        tour.id === tourId ? { ...tour, status: newStatus } : tour
                    )
                );
            } else {
                alert('Lỗi cập nhật trạng thái: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Lỗi cập nhật trạng thái');
        }
    };

    const getStatusDropdown = (tour) => {
        return (
            <select 
                value={tour.status} 
                onChange={(e) => handleStatusChange(tour.id, e.target.value)}
                className={`status-dropdown status-${tour.status.toLowerCase()}`}
            >
                <option value="DRAFT">Nháp</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
            </select>
        );
    };

    if (loading) return <div className="loading-state">Đang tải...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="tour-management">
            {/* Simple Header */}
            <div className="simple-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="page-title">Quản lý Tour</h1>
                    </div>
                    <button 
                        className="btn btn-primary add-tour-btn"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={20} />
                        Thêm Tour mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-row">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            📊
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalTours?.toLocaleString() || 0}</div>
                            <div className="stat-label">Tổng Tours</div>
                        </div>
                    </div>
                    
                    <div className="stat-card active">
                        <div className="stat-icon">
                            ✅
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.activeTours?.toLocaleString() || 0}</div>
                            <div className="stat-label">Đang hoạt động</div>
                        </div>
                    </div>
                    
                    <div className="stat-card draft">
                        <div className="stat-icon">
                            📝
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.draftTours?.toLocaleString() || 0}</div>
                            <div className="stat-label">Nháp</div>
                        </div>
                    </div>
                    
                    <div className="stat-card inactive">
                        <div className="stat-icon">
                            ⛔
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.inactiveTours?.toLocaleString() || 0}</div>
                            <div className="stat-label">Không hoạt động</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter Combined */}
            <div className="search-filter-section">
                <div className="search-filter-box">
                    <div className="search-section">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên tour..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-divider"></div>

                    <div className="filter-section">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="filter-dropdown"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {tourStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-divider"></div>

                    <div className="filter-section">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-dropdown"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="tours-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Tour</th>
                            <th>Danh mục</th>
                            <th>Địa điểm</th>
                            <th>Giá</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tours.map(tour => (
                            <tr key={tour.id}>
                                <td>
                                    <div className="tour-info">
                                        <div className="tour-title" title={tour.title}>
                                            {tour.title}
                                        </div>
                                        <div className="tour-subtitle" title={tour.shortDescription}>
                                            {tour.shortDescription || 'Chưa có mô tả'}
                                        </div>
                                        {tour.isFeatured && (
                                            <div className="featured-text">
                                                ★ Nổi bật
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="category-info">
                                        <span className="category-name">
                                            {tour.category ? tour.category.name : 'Chưa phân loại'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-info">
                                        <span className="departure-location">
                                            {tour.departureLocation || 'Chưa xác định'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="price-info">
                                        {tour.discountedPrice ? (
                                            <>
                                                <div className="discounted-price">
                                                    {formatPrice(tour.discountedPrice)}
                                                </div>
                                                <div className="original-price">
                                                    {formatPrice(tour.price)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="price">{formatPrice(tour.price)}</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="duration-info">
                                        <span className="duration">
                                            {tour.durationNights}N{tour.durationDays}Đ
                                        </span>
                                    </div>
                                </td>
                                <td>{getStatusDropdown(tour)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-icon btn-view"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            className="btn-icon btn-edit"
                                            onClick={() => handleEdit(tour)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(tour.id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <button 
                    className="pagination-btn"
                    disabled={pagination.page === 0}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Trước
                </button>
                <span>
                    Trang {pagination.page + 1} / {pagination.totalPages}
                </span>
                <button 
                    className="pagination-btn"
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Sau
                </button>
            </div>

            {showModal && (
                <TourFormModal
                    tour={editingTour}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default TourManagement;
