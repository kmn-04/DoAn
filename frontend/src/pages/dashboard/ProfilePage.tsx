import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services';
import type { UserUpdateRequest } from '../../services/userService';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bio: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    bio: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile data from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const userProfile = await userService.getProfile();
        
        const profileData: ProfileData = {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          gender: 'male', // Default since not in API
          bio: '', // Default since not in API
          emergencyContact: '', // Default since not in API
          emergencyPhone: '' // Default since not in API
        };
        
        setProfileData(profileData);
        setEditData(profileData);
        
      } catch (error) {
        console.error('Error loading profile:', error);
        
        // Fallback to user from auth store
        if (user) {
          const fallbackData: ProfileData = {
            name: user.name || '',
            email: user.email || '',
            phone: '',
            address: '',
            dateOfBirth: '',
            gender: 'male',
            bio: '',
            emergencyContact: '',
            emergencyPhone: ''
          };
          
          setProfileData(fallbackData);
          setEditData(fallbackData);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!editData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!editData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(editData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare update request
      const updateRequest: UserUpdateRequest = {
        name: editData.name,
        phone: editData.phone || undefined,
        address: editData.address || undefined,
        dateOfBirth: editData.dateOfBirth || undefined
      };

      // Call backend API
      const updatedUser = await userService.updateProfile(updateRequest);
      
      // Update local state
      setProfileData(editData);
      setIsEditing(false);
      
      // Update auth store with new user data
      if (updateUser) {
        updateUser({
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address
        });
      }
      
      // Success notification
      const successEvent = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Cập nhật thành công!',
          message: 'Thông tin cá nhân đã được lưu.'
        }
      });
      window.dispatchEvent(successEvent);
    } catch (error) {
      // Error notification  
      const errorEvent = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Cập nhật thất bại',
          message: 'Có lỗi xảy ra, vui lòng thử lại.'
        }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setErrors({});
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          const errorEvent = new CustomEvent('show-toast', {
            detail: {
              type: 'error',
              title: 'File quá lớn',
              message: 'Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB.'
            }
          });
          window.dispatchEvent(errorEvent);
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          const errorEvent = new CustomEvent('show-toast', {
            detail: {
              type: 'error',
              title: 'File không hợp lệ',
              message: 'Vui lòng chọn file ảnh (JPG, PNG, GIF).'
            }
          });
          window.dispatchEvent(errorEvent);
          return;
        }

        try {
          setIsLoading(true);
          
          // Upload avatar
          const avatarUrl = await userService.uploadAvatar(file);
          
          // Update profile with new avatar
          const updateRequest: UserUpdateRequest = {
            name: profileData.name,
            phone: profileData.phone || undefined,
            address: profileData.address || undefined,
            dateOfBirth: profileData.dateOfBirth || undefined,
            avatarUrl: avatarUrl
          };
          
          await userService.updateProfile(updateRequest);
          
          // Update auth store
          if (updateUser) {
            updateUser({ avatarUrl: avatarUrl });
          }
          
          const successEvent = new CustomEvent('show-toast', {
            detail: {
              type: 'success',
              title: 'Upload thành công!',
              message: 'Ảnh đại diện đã được cập nhật.'
            }
          });
          window.dispatchEvent(successEvent);
          
        } catch (error) {
          const errorEvent = new CustomEvent('show-toast', {
            detail: {
              type: 'error',
              title: 'Upload thất bại',
              message: 'Có lỗi xảy ra khi upload ảnh.'
            }
          });
          window.dispatchEvent(errorEvent);
        } finally {
          setIsLoading(false);
        }
      }
    };
    input.click();
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-200 rounded-lg h-80"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-lg h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-normal text-slate-900 mb-2 tracking-tight">Thông tin cá nhân</h1>
          <p className="text-gray-600 font-normal">Quản lý thông tin tài khoản và cài đặt cá nhân của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 text-center bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-none flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={profileData.name}
                    className="w-32 h-32 rounded-none object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-0 right-0 bg-white border-2 rounded-none p-2 hover:bg-stone-100 transition-colors" style={{ borderColor: '#D4AF37' }}
              >
                <CameraIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
              </button>
            </div>

            <h2 className="text-2xl font-medium text-slate-900 mb-1 tracking-tight">{profileData.name}</h2>
            <p className="text-gray-600 mb-6 font-normal">{profileData.email}</p>
            
            <div className="text-sm text-gray-600 space-y-3 border-t border-stone-200 pt-4">
              <p className="flex items-center justify-center space-x-2">
                <PhoneIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="font-normal">{profileData.phone || 'Chưa cập nhật'}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <MapPinIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="font-normal">{profileData.address || 'Chưa cập nhật'}</span>
              </p>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </Button>
            )}
          </Card>

            {/* Stats */}
            <Card className="p-6 bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0 delay-100">
              <h3 className="text-xl font-medium text-slate-900 mb-6 tracking-tight">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">Tours đã đặt</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>8</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">Tours hoàn thành</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>5</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">Đánh giá đã viết</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-normal">Thành viên từ</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>2023</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0 delay-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-normal text-slate-900 tracking-tight">Chi tiết thông tin</h3>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-slate-900 mb-6 tracking-tight text-lg">Thông tin cá nhân</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Họ và tên *"
                    value={isEditing ? editData.name : profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Email *"
                    type="email"
                    value={isEditing ? editData.email : profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Số điện thoại *"
                    value={isEditing ? editData.phone : profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Ngày sinh"
                    type="date"
                    value={isEditing ? editData.dateOfBirth : profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Địa chỉ"
                      value={isEditing ? editData.address : profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                      Giới tính
                    </label>
                    <select
                      value={isEditing ? editData.gender : profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 disabled:bg-stone-50 disabled:cursor-not-allowed font-normal transition-all duration-300"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={isEditing ? editData.bio : profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 disabled:bg-stone-50 disabled:cursor-not-allowed resize-none font-normal transition-all duration-300"
                    placeholder="Chia sẻ về sở thích du lịch của bạn..."
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-medium text-slate-900 mb-6 tracking-tight text-lg">Liên hệ khẩn cấp</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tên người liên hệ"
                    value={isEditing ? editData.emergencyContact : profileData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Số điện thoại"
                    value={isEditing ? editData.emergencyPhone : profileData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Account Security */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-medium text-slate-900 mb-6 tracking-tight text-lg">Bảo mật tài khoản</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-none border border-stone-200">
                    <div>
                      <h5 className="font-medium text-slate-900 tracking-tight">Mật khẩu</h5>
                      <p className="text-sm text-gray-600 font-normal">Cập nhật lần cuối: 30 ngày trước</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none">
                      Đổi mật khẩu
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-none border border-stone-200">
                    <div>
                      <h5 className="font-medium text-slate-900 tracking-tight">Xác thực 2 bước</h5>
                      <p className="text-sm text-gray-600 font-normal">Tăng cường bảo mật cho tài khoản</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none">
                      Kích hoạt
                    </Button>
                  </div>
                </div>
              </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
