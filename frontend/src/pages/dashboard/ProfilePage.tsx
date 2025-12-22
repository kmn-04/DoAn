import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { userService, reviewService } from '../../services';
import type { UserUpdateRequest } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { ProfileSkeleton } from '../../components/ui/Skeleton';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bio: string;
}

interface UserStats {
  totalBookings: number;
  completedBookings: number;
  totalReviews: number;
  memberSince: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
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
    bio: ''
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalBookings: 0,
    completedBookings: 0,
    totalReviews: 0,
    memberSince: ''
  });

  const [avatarKey, setAvatarKey] = useState(0); // Force re-render avatar
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [objectUrlToCleanup, setObjectUrlToCleanup] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
          bio: '' // Default since not in API
        };
        
        setProfileData(profileData);
        setEditData(profileData);
        setCurrentAvatarUrl(userProfile.avatarUrl || null);
        
        // DON'T update auth store here - it causes infinite loop
        // Auth store will be updated after avatar upload in handleAvatarUpload()
        
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
            bio: ''
          };
          
          setProfileData(fallbackData);
          setEditData(fallbackData);
          setCurrentAvatarUrl(user.avatarUrl || null);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []); // Run only once on mount

  // Load user statistics
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user?.id) return;
      
      try {
        // Get user's booking count
        const bookings = await userService.getUserBookings(user.id);
        const totalBookings = bookings.length;
        // Backend returns confirmationStatus in UPPERCASE (e.g., "COMPLETED")
        const completedBookings = bookings.filter(b => 
          b.confirmationStatus === 'COMPLETED' || b.status?.toUpperCase() === 'COMPLETED'
        ).length;
        
        // Get user's review count from API
        const reviews = await reviewService.getMyReviews();
        const totalReviews = reviews.length;
        
        // Get member since date
        const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2023';
        
        setUserStats({
          totalBookings,
          completedBookings,
          totalReviews,
          memberSince
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    loadUserStats();
  }, [user?.id]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlToCleanup) {
        URL.revokeObjectURL(objectUrlToCleanup);
      }
    };
  }, [objectUrlToCleanup]);

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
      newErrors.name = t('profile.errors.nameRequired');
    }

    if (!editData.phone.trim()) {
      newErrors.phone = t('profile.errors.phoneRequired');
    } else if (!/^[0-9]{10,11}$/.test(editData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('profile.errors.phoneInvalid');
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
      
      toast.success(t('profile.errors.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.errors.updateError'));
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
          toast.error(t('profile.avatar.tooLarge'));
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(t('profile.avatar.invalidType'));
          return;
        }

        try {
          setIsUploadingAvatar(true);
          
          // Cleanup previous object URL if exists
          if (objectUrlToCleanup) {
            URL.revokeObjectURL(objectUrlToCleanup);
          }
          
          // Create object URL for immediate preview
          const objectUrl = URL.createObjectURL(file);
          setObjectUrlToCleanup(objectUrl);
          
          // Update local avatar state immediately for preview
          setCurrentAvatarUrl(objectUrl);
          
          // Force avatar re-render
          setAvatarKey(prev => prev + 1);
          
          // Upload file to server first
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            // Upload image to get URL
            const uploadResponse = await fetch('http://localhost:8080/api/upload/avatar', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image');
            }
            
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.data; // API returns { success: true, data: "url" }
            
            // Now update profile with image URL
            const updateRequest: UserUpdateRequest = {
              name: profileData.name,
              phone: profileData.phone || undefined,
              address: profileData.address || undefined,
              dateOfBirth: profileData.dateOfBirth || undefined,
              avatarUrl: imageUrl
            };
            
            await userService.updateProfile(updateRequest);
            
            // Update auth store with new URL
            if (updateUser) {
              updateUser({ avatarUrl: imageUrl });
            }
            
            toast.success(t('profile.avatar.success'));
            
          } catch (error) {
            console.error('Error updating profile with avatar:', error);
            toast.error(t('profile.avatar.error'));
          } finally {
            setIsUploadingAvatar(false);
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.error(t('profile.avatar.uploadError'));
          setIsUploadingAvatar(false);
        }
      }
    };
    input.click();
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
    // Reset form when opening modal
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handlePasswordInputChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = t('profile.errors.passwordRequired');
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = t('profile.errors.newPasswordRequired');
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = t('profile.errors.newPasswordMin');
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('profile.errors.confirmRequired');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('profile.errors.confirmMismatch');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = t('profile.errors.samePassword');
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      toast.success(t('profile.errors.changeSuccess'));
      setShowChangePasswordModal(false);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      
      // Handle specific error messages
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.status === 400) {
        toast.error(t('profile.errors.currentIncorrect'));
      } else {
        toast.error(t('profile.errors.changeError'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1">
              <ProfileSkeleton />
            </div>
            
            {/* Right Column Skeleton */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
                
                {/* Form Skeleton */}
                <div className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
          <h1 className="text-3xl font-normal text-slate-900 mb-2 tracking-tight">{t('profile.title')}</h1>
          <p className="text-gray-600 font-normal">{t('profile.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 text-center bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-none flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                {(currentAvatarUrl || user?.avatarUrl) ? (
                  <img 
                    key={avatarKey}
                    src={currentAvatarUrl || user?.avatarUrl} 
                    alt={profileData.name}
                    className="w-32 h-32 rounded-none object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 bg-white border-2 rounded-none p-2 hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: '#D4AF37' }}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#D4AF37' }}></div>
                ) : (
                  <CameraIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                )}
              </button>
            </div>

            <h2 className="text-2xl font-medium text-slate-900 mb-1 tracking-tight">{profileData.name}</h2>
              <p className="text-gray-600 mb-6 font-normal">{profileData.email}</p>
            
            <div className="text-sm text-gray-600 space-y-3 border-t border-stone-200 pt-4">
              <p className="flex items-center justify-center space-x-2">
                <PhoneIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="font-normal">{profileData.phone || t('profile.details.notUpdated')}</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <MapPinIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="font-normal">{profileData.address || t('profile.details.notUpdated')}</span>
              </p>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {t('profile.edit')}
              </Button>
            )}
          </Card>

            {/* Stats */}
            <Card className="p-6 bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0 delay-100">
              <h3 className="text-xl font-medium text-slate-900 mb-6 tracking-tight">{t('profile.stats.title')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">{t('profile.stats.totalBookings')}</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>{userStats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">{t('profile.stats.completedTours')}</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>{userStats.completedBookings}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <span className="text-gray-600 font-normal">{t('profile.stats.reviewsWritten')}</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>{userStats.totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-normal">{t('profile.stats.memberSince')}</span>
                  <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>{userStats.memberSince}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white border border-stone-200 rounded-none hover:border-slate-700 transition-all duration-300 animate-fade-in-up opacity-0 delay-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-normal text-slate-900 tracking-tight">{t('profile.details.title')}</h3>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    {t('profile.cancel')}
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('profile.saving')}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        {t('profile.saveChanges')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-slate-900 mb-6 tracking-tight text-lg">{t('profile.details.personalInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('profile.details.fullName')}
                    value={isEditing ? editData.name : profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label={t('profile.details.email')}
                    type="email"
                    value={profileData.email}
                    disabled={true}
                    className="bg-stone-100 cursor-not-allowed"
                  />
                  
                  <Input
                    label={t('profile.details.phone')}
                    value={isEditing ? editData.phone : profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label={t('profile.details.dateOfBirth')}
                    type="date"
                    value={isEditing ? editData.dateOfBirth : profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label={t('profile.details.address')}
                      value={isEditing ? editData.address : profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                      {t('profile.details.gender')}
                    </label>
                    <select
                      value={isEditing ? editData.gender : profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 disabled:bg-stone-50 disabled:cursor-not-allowed font-normal transition-all duration-300"
                    >
                      <option value="male">{t('profile.details.genderOptions.male')}</option>
                      <option value="female">{t('profile.details.genderOptions.female')}</option>
                      <option value="other">{t('profile.details.genderOptions.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    {t('profile.details.bio')}
                  </label>
                  <textarea
                    value={isEditing ? editData.bio : profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 disabled:bg-stone-50 disabled:cursor-not-allowed resize-none font-normal transition-all duration-300"
                    placeholder={t('profile.details.bioPlaceholder')}
                  />
                </div>
              </div>


              {/* Account Security */}
              <div className="border-t border-stone-200 pt-6">
                <h4 className="font-medium text-slate-900 mb-6 tracking-tight text-lg">{t('profile.security.title')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-none border border-stone-200">
                    <div>
                      <h5 className="font-medium text-slate-900 tracking-tight">{t('profile.security.password.title')}</h5>
                      <p className="text-sm text-gray-600 font-normal">{t('profile.security.password.lastUpdated')}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleChangePassword}
                      className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
                    >
                      {t('profile.security.password.change')}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-none border border-stone-200">
                    <div>
                      <h5 className="font-medium text-slate-900 tracking-tight">{t('profile.security.twoFactor.title')}</h5>
                      <p className="text-sm text-gray-600 font-normal">{t('profile.security.twoFactor.description')}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none">
                      {t('profile.security.twoFactor.activate')}
                    </Button>
                  </div>
                </div>
              </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-medium text-slate-900 mb-6 tracking-tight">{t('profile.password.title')}</h3>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    {t('profile.password.current')}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      className={`w-full border rounded-none px-3 py-2 pr-10 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300 ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-stone-300'
                      }`}
                      placeholder={t('profile.password.currentPlaceholder')}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    {t('profile.password.new')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={`w-full border rounded-none px-3 py-2 pr-10 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300 ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-stone-300'
                      }`}
                      placeholder={t('profile.password.newPlaceholder')}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    {t('profile.password.confirm')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className={`w-full border rounded-none px-3 py-2 pr-10 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300 ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-stone-300'
                      }`}
                      placeholder={t('profile.password.confirmPlaceholder')}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={isChangingPassword}
                  className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none disabled:opacity-50"
                >
                  {t('profile.cancel')}
                </Button>
                
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="text-white rounded-none hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  {isChangingPassword ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('profile.password.changing')}</span>
                    </div>
                  ) : (
                    t('profile.password.change')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
