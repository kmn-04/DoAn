import React, { useState } from 'react';
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
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || 'Nguyễn Văn A',
    email: user?.email || 'user@example.com',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    bio: 'Yêu thích du lịch và khám phá những điểm đến mới.',
    emergencyContact: 'Nguyễn Thị B',
    emergencyPhone: '0987654321'
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfileData(editData);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
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
    // Simulate avatar upload
    alert('Tính năng upload avatar sẽ được cập nhật sớm!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mx-auto">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={profileData.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors"
              >
                <CameraIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData.name}</h2>
            <p className="text-gray-600 mb-4">{profileData.email}</p>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center justify-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>{profileData.phone}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>{profileData.address}</span>
              </p>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </Button>
            )}
          </Card>

          {/* Stats */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tours đã đặt</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tours hoàn thành</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đánh giá đã viết</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thành viên từ</span>
                <span className="font-semibold">2023</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết thông tin</h3>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
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
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h4>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={isEditing ? editData.gender : profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={isEditing ? editData.bio : profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    placeholder="Chia sẻ về sở thích du lịch của bạn..."
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Liên hệ khẩn cấp</h4>
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
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">Mật khẩu</h5>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối: 30 ngày trước</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Đổi mật khẩu
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">Xác thực 2 bước</h5>
                      <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản</p>
                    </div>
                    <Button variant="outline" size="sm">
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
  );
};

export default ProfilePage;
