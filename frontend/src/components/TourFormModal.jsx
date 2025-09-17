import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import tourService from '../services/tourService';
import categoryService from '../services/categoryService';
import partnerService from '../services/partnerService';
import '../styles/components/TourFormModal.css';

const TourFormModal = ({ tour, onClose }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [partners, setPartners] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        departureLocation: '',
        categoryId: '',
        targetAudience: 'FAMILY',
        durationDays: 1,
        durationNights: 0,
        price: '',
        discountedPrice: '',
        maxParticipants: 50,
        galleryImages: [],
        includedServices: '',
        excludedServices: '',
        status: 'DRAFT',
        isFeatured: false,
        itinerary: []
    });

    const targetAudienceOptions = [
        { value: 'FAMILY', label: 'Gia đình' },
        { value: 'COUPLE', label: 'Cặp đôi' },
        { value: 'SOLO', label: 'Solo' },
        { value: 'FRIENDS', label: 'Nhóm bạn' },
        { value: 'BUSINESS', label: 'Công ty' }
    ];

    const tabs = [
        { id: 'basic', label: 'Thông tin chung' },
        { id: 'itinerary', label: 'Lịch trình chi tiết' },
        { id: 'images', label: 'Hình ảnh & Dịch vụ' },
        { id: 'settings', label: 'Cài đặt' }
    ];

    useEffect(() => {
        loadCategories();
        loadPartners();
        if (tour) {
            setFormData({
                ...tour,
                categoryId: tour.category?.id || '',
                targetAudience: tour.targetAudience || 'FAMILY',
                galleryImages: tour.galleryImages || [],
                itinerary: tour.itinerary || []
            });
        }
        
        // Add body class to prevent scrolling
        document.body.classList.add('modal-open');
        
        // Cleanup function to remove body class
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [tour]);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.content || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadPartners = async () => {
        try {
            const response = await partnerService.getActivePartners();
            setPartners(response.content || []);
        } catch (error) {
            console.error('Error loading partners:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            shortDescription: '',
            description: '',
            departureLocation: '',
            categoryId: '',
            targetAudience: 'FAMILY',
            durationDays: 1,
            durationNights: 0,
            price: '',
            discountedPrice: '',
            maxParticipants: 50,
            galleryImages: [],
            includedServices: '',
            excludedServices: '',
            status: 'DRAFT',
            isFeatured: false,
            itinerary: []
        });
        setActiveTab('basic');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTargetAudienceChange = (audience) => {
        setFormData(prev => ({
            ...prev,
            targetAudience: audience
        }));
    };

    const addItineraryDay = () => {
        const newDay = {
            dayNumber: formData.itinerary.length + 1,
            title: `Ngày ${formData.itinerary.length + 1}`,
            description: '',
            partnerIds: []
        };
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, newDay]
        }));
    };

    const updateItineraryDay = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            itinerary: prev.itinerary.map((day, i) => 
                i === index ? { ...day, [field]: value } : day
            )
        }));
    };

    const removeItineraryDay = (index) => {
        setFormData(prev => ({
            ...prev,
            itinerary: prev.itinerary.filter((_, i) => i !== index)
                .map((day, i) => ({ ...day, dayNumber: i + 1 }))
        }));
    };

    const addPartnerToDay = (dayIndex, partnerId) => {
        const day = formData.itinerary[dayIndex];
        if (!day.partnerIds.includes(partnerId)) {
            updateItineraryDay(dayIndex, 'partnerIds', [...day.partnerIds, partnerId]);
        }
    };

    const removePartnerFromDay = (dayIndex, partnerId) => {
        const day = formData.itinerary[dayIndex];
        updateItineraryDay(dayIndex, 'partnerIds', 
            day.partnerIds.filter(id => id !== partnerId)
        );
    };

    const handleSubmit = async (e, action = 'save_and_close') => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (tour) {
                await tourService.updateTour(tour.id, formData);
            } else {
                await tourService.createTour(formData);
            }
            
            if (action === 'save_and_close') {
                onClose();
            } else if (action === 'save_and_new') {
                // Reset form for new tour
                resetForm();
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-toast';
                successMsg.textContent = '✅ Tour đã được lưu thành công! Bạn có thể tiếp tục thêm tour mới.';
                document.body.appendChild(successMsg);
                
                // Remove toast after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(successMsg)) {
                        document.body.removeChild(successMsg);
                    }
                }, 3000);
            }
        } catch (error) {
            alert('Lỗi khi lưu tour');
            console.error('Error saving tour:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBasicTab = () => (
        <div className="tab-content">
            <div className="form-row">
                <div className="form-group">
                    <label>Tên Tour *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Mô tả ngắn</label>
                    <textarea
                        value={formData.shortDescription}
                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                        rows="3"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Nội dung chi tiết</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="5"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Địa điểm khởi hành</label>
                    <input
                        type="text"
                        value={formData.departureLocation}
                        onChange={(e) => handleInputChange('departureLocation', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Danh mục Tour</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Đối tượng khách hàng</label>
                    <select
                        value={formData.targetAudience}
                        onChange={(e) => handleTargetAudienceChange(e.target.value)}
                    >
                        {targetAudienceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Số ngày *</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.durationDays}
                        onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Số đêm *</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.durationNights}
                        onChange={(e) => handleInputChange('durationNights', parseInt(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Giá gốc *</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Giá khuyến mãi</label>
                    <input
                        type="number"
                        value={formData.discountedPrice}
                        onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Số người tối đa</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );

    const renderItineraryTab = () => (
        <div className="tab-content">
            <div className="itinerary-header">
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={addItineraryDay}
                >
                    <Plus size={16} />
                    Thêm ngày mới
                </button>
            </div>

            <div className="itinerary-days">
                {formData.itinerary.map((day, index) => (
                    <ItineraryDayCard 
                        key={index}
                        day={day}
                        index={index}
                        partners={partners}
                        onUpdate={updateItineraryDay}
                        onRemove={removeItineraryDay}
                        onAddPartner={addPartnerToDay}
                        onRemovePartner={removePartnerFromDay}
                    />
                ))}
            </div>
        </div>
    );

    const renderImagesTab = () => (
        <div className="tab-content">
            <div className="form-group">
                <label>Gallery (URL hình ảnh)</label>
                <div className="gallery-input">
                    <input
                        type="text"
                        placeholder="Nhập URL hình ảnh"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const url = e.target.value.trim();
                                if (url) {
                                    handleInputChange('galleryImages', [...formData.galleryImages, url]);
                                    e.target.value = '';
                                }
                            }
                        }}
                    />
                </div>
                <div className="gallery-preview">
                    {formData.galleryImages.map((url, index) => (
                        <div key={index} className="gallery-item">
                            <img src={url} alt={`Gallery ${index + 1}`} />
                            <button
                                type="button"
                                className="remove-image"
                                onClick={() => {
                                    const newImages = formData.galleryImages.filter((_, i) => i !== index);
                                    handleInputChange('galleryImages', newImages);
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Dịch vụ bao gồm</label>
                <textarea
                    value={formData.includedServices}
                    onChange={(e) => handleInputChange('includedServices', e.target.value)}
                    rows="4"
                />
            </div>

            <div className="form-group">
                <label>Dịch vụ không bao gồm</label>
                <textarea
                    value={formData.excludedServices}
                    onChange={(e) => handleInputChange('excludedServices', e.target.value)}
                    rows="4"
                />
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="tab-content">
            <div className="form-row">
                <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                        <option value="DRAFT">Nháp</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        />
                        Tour nổi bật
                    </label>
                </div>
            </div>
        </div>
    );

    // Debug: Check tour value
    console.log('TourFormModal - tour value:', tour);
    console.log('TourFormModal - should show "Lưu & Thêm mới" button:', !tour);

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content tour-form-modal">
                <div className="modal-header">
                    <h2>{tour ? 'Chỉnh sửa Tour' : 'Thêm Tour mới'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="modal-body">
                        {activeTab === 'basic' && renderBasicTab()}
                        {activeTab === 'itinerary' && renderItineraryTab()}
                        {activeTab === 'images' && renderImagesTab()}
                        {activeTab === 'settings' && renderSettingsTab()}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={(e) => {
                                const currentFormData = { ...formData, status: 'INACTIVE' };
                                setFormData(currentFormData);
                                handleSubmit(e, 'save_and_close');
                            }}
                            disabled={loading}
                        >
                            Lưu & Tạm dừng
                        </button>
                        
                        {!tour && (
                            <button 
                                type="button" 
                                className="btn btn-success"
                                onClick={(e) => handleSubmit(e, 'save_and_new')}
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu & Thêm mới'}
                            </button>
                        )}
                        
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu & Thoát'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ItineraryDayCard = ({ day, index, partners, onUpdate, onRemove, onAddPartner, onRemovePartner }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showPartnerSelect, setShowPartnerSelect] = useState({ hotel: false, restaurant: false, transport: false });

    const partnersByType = {
        hotel: partners.filter(p => p.type === 'HOTEL'),
        restaurant: partners.filter(p => p.type === 'RESTAURANT'),
        transport: partners.filter(p => p.type === 'TRANSPORT')
    };

    const getSelectedPartners = (type) => {
        return partnersByType[type].filter(p => day.partnerIds.includes(p.id));
    };

    const togglePartnerSelect = (type) => {
        setShowPartnerSelect(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    return (
        <div className="itinerary-day-card">
            <div className="day-header">
                <div className="day-title-section">
                    <input
                        type="text"
                        value={day.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        className="day-title-input"
                    />
                    <button
                        type="button"
                        className="expand-button"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
                <button
                    type="button"
                    className="btn-icon btn-delete"
                    onClick={() => onRemove(index)}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {isExpanded && (
                <div className="day-content">
                    <div className="form-group">
                        <label>Mô tả hoạt động</label>
                        <textarea
                            value={day.description}
                            onChange={(e) => onUpdate(index, 'description', e.target.value)}
                            rows="3"
                        />
                    </div>

                    <div className="partners-section">
                        <h4>Dịch vụ & Đối tác trong ngày</h4>
                        
                        {['hotel', 'restaurant', 'transport'].map(type => (
                            <div key={type} className="partner-type-section">
                                <div className="partner-type-header">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => togglePartnerSelect(type)}
                                    >
                                        <Plus size={16} />
                                        Thêm {type === 'hotel' ? 'khách sạn' : type === 'restaurant' ? 'nhà hàng' : 'phương tiện'}
                                    </button>
                                </div>

                                {showPartnerSelect[type] && (
                                    <div className="partner-select">
                                        <select
                                            onChange={(e) => {
                                                const partnerId = parseInt(e.target.value);
                                                if (partnerId) {
                                                    onAddPartner(index, partnerId);
                                                    setShowPartnerSelect(prev => ({ ...prev, [type]: false }));
                                                }
                                            }}
                                        >
                                            <option value="">Chọn đối tác</option>
                                            {partnersByType[type].map(partner => (
                                                <option key={partner.id} value={partner.id}>
                                                    {partner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="selected-partners">
                                    {getSelectedPartners(type).map(partner => (
                                        <div key={partner.id} className="partner-tag">
                                            <span>{partner.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => onRemovePartner(index, partner.id)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourFormModal;
