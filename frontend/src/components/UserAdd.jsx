import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import Icons from './Icons';
import '../styles/components/UserAdd.css';

const UserAdd = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    avatar: '',
    fullName: '',
    email: '',
    password: '',
    role: 'USER',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle chọn file ảnh
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Vui lòng chọn file ảnh hợp lệ'
        }));
        return;
      }

      // Kiểm tra file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Kích thước file không được vượt quá 5MB'
        }));
        return;
      }

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Xóa lỗi
      if (errors.avatar) {
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  // Handle click vào vùng upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data for API
      const apiData = {
        username: formData.email.split('@')[0], // Generate username from email
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        role: formData.role,
        isActive: formData.status === 'active',
        avatarUrl: formData.avatar
      };
      
      await userService.createUser(apiData);
      alert('Tạo người dùng thành công!');
      navigate('/users'); // Quay về trang quản lý user
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hủy bỏ
  const handleCancel = () => {
    navigate('/users');
  };

  // Tạo avatar placeholder
  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (formData.fullName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=6366f1&color=fff&size=120`;
    }
    return `https://ui-avatars.com/api/?name=User&background=e5e7eb&color=6b7280&size=120`;
  };

  return (
    <div className="user-add-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title">
              <h1>Thêm mới người dùng</h1>
            </div>
          </div>
          <div className="header-right">
            <button className="back-btn" onClick={handleCancel} type="button">
              {Icons.ArrowLeft && Icons.ArrowLeft()}
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="page-content">
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-container">
            {/* Avatar Upload */}
            <div className="avatar-upload-container">
              <div 
                className={`avatar-upload-area ${errors.avatar ? 'error' : ''}`}
                onClick={handleAvatarClick}
              >
                <img 
                  src={getAvatarSrc()} 
                  alt="Avatar preview" 
                  className="avatar-preview"
                />
                <div className="upload-overlay">
                  {Icons.Camera && Icons.Camera()}
                  <span>Tải lên ảnh</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="avatar-input"
              />
              {errors.avatar && (
                <div className="error-message">{errors.avatar}</div>
              )}
              <div className="upload-hint">
                Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
              </div>
            </div>

            {/* Basic Information */}
            <div className="form-fields">
              {/* Họ và tên */}
              <div className="form-group">
                <label className="form-label required">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                />
                {errors.fullName && (
                  <div className="error-message">{errors.fullName}</div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label required">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="form-group">
                <label className="form-label required">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
                <div className="input-hint">
                  Mật khẩu phải có ít nhất 8 ký tự
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="form-fields">
              {/* Vai trò */}
              <div className="form-group">
                <label className="form-label required">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="USER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        status: e.target.checked ? 'active' : 'inactive'
                      }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${formData.status}`}>
                    {formData.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                Đang lưu...
              </>
            ) : (
              <>
                Thêm mới
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserAdd;
