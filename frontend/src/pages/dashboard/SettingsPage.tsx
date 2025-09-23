import React, { useState } from 'react';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/ui';

interface NotificationSettings {
  emailBookingConfirmation: boolean;
  emailPaymentReminder: boolean;
  emailTourUpdates: boolean;
  emailPromotions: boolean;
  pushBookingUpdates: boolean;
  pushPaymentReminder: boolean;
  pushTourReminder: boolean;
  smsBookingConfirmation: boolean;
  smsPaymentReminder: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showBookingHistory: boolean;
  showWishlist: boolean;
  allowDataCollection: boolean;
  allowMarketing: boolean;
}

interface AccountSettings {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'account' | 'security'>('notifications');
  const [isLoading, setIsLoading] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailBookingConfirmation: true,
    emailPaymentReminder: true,
    emailTourUpdates: true,
    emailPromotions: false,
    pushBookingUpdates: true,
    pushPaymentReminder: true,
    pushTourReminder: true,
    smsBookingConfirmation: true,
    smsPaymentReminder: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showBookingHistory: false,
    showWishlist: true,
    allowDataCollection: true,
    allowMarketing: false
  });

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    language: 'vi',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY'
  });

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountChange = (key: keyof AccountSettings, value: string) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Success notification
      const successEvent = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Cài đặt đã lưu!',
          message: 'Các thay đổi đã được cập nhật thành công.'
        }
      });
      window.dispatchEvent(successEvent);
    } catch (error) {
      // Error notification
      const errorEvent = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Lưu thất bại',
          message: 'Có lỗi xảy ra khi lưu cài đặt.'
        }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!'
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?'
      );
      
      if (doubleConfirm) {
        alert('Tính năng xóa tài khoản sẽ được cập nhật sớm!');
      }
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Thông báo', icon: BellIcon },
    { id: 'privacy', label: 'Quyền riêng tư', icon: EyeIcon },
    { id: 'account', label: 'Tài khoản', icon: Cog6ToothIcon },
    { id: 'security', label: 'Bảo mật', icon: ShieldCheckIcon }
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        </div>
        <p className="text-gray-600">Quản lý tùy chọn tài khoản và cài đặt cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt thông báo</h2>
              
              <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailBookingConfirmation', label: 'Xác nhận đặt tour', desc: 'Nhận email khi booking được xác nhận' },
                      { key: 'emailPaymentReminder', label: 'Nhắc nhở thanh toán', desc: 'Nhận email nhắc nhở khi có booking chưa thanh toán' },
                      { key: 'emailTourUpdates', label: 'Cập nhật tour', desc: 'Nhận email khi có thay đổi về tour đã đặt' },
                      { key: 'emailPromotions', label: 'Khuyến mãi & ưu đãi', desc: 'Nhận email về các chương trình khuyến mãi' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => handleNotificationChange(item.key as keyof NotificationSettings, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Thông báo đẩy</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'pushBookingUpdates', label: 'Cập nhật booking', desc: 'Nhận thông báo về trạng thái booking' },
                      { key: 'pushPaymentReminder', label: 'Nhắc nhở thanh toán', desc: 'Nhận thông báo nhắc nhở thanh toán' },
                      { key: 'pushTourReminder', label: 'Nhắc nhở tour', desc: 'Nhận thông báo trước khi tour khởi hành' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => handleNotificationChange(item.key as keyof NotificationSettings, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">SMS</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'smsBookingConfirmation', label: 'Xác nhận booking', desc: 'Nhận SMS khi booking được xác nhận' },
                      { key: 'smsPaymentReminder', label: 'Nhắc nhở thanh toán', desc: 'Nhận SMS nhắc nhở thanh toán' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={notificationSettings[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => handleNotificationChange(item.key as keyof NotificationSettings, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt quyền riêng tư</h2>
              
              <div className="space-y-6">
                {/* Profile Visibility */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Hiển thị hồ sơ</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'public', label: 'Công khai', desc: 'Mọi người có thể xem hồ sơ của bạn' },
                      { value: 'friends', label: 'Bạn bè', desc: 'Chỉ bạn bè có thể xem hồ sơ' },
                      { value: 'private', label: 'Riêng tư', desc: 'Chỉ bạn có thể xem hồ sơ' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={privacySettings.profileVisibility === option.value}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data Sharing */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Chia sẻ dữ liệu</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'showBookingHistory', label: 'Hiển thị lịch sử booking', desc: 'Cho phép người khác xem các tour bạn đã đặt' },
                      { key: 'showWishlist', label: 'Hiển thị danh sách yêu thích', desc: 'Cho phép người khác xem tour bạn yêu thích' },
                      { key: 'allowDataCollection', label: 'Cho phép thu thập dữ liệu', desc: 'Giúp cải thiện trải nghiệm dịch vụ' },
                      { key: 'allowMarketing', label: 'Cho phép sử dụng dữ liệu marketing', desc: 'Nhận đề xuất tour phù hợp với sở thích' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={privacySettings[item.key as keyof PrivacySettings] as boolean}
                          onChange={(e) => handlePrivacyChange(item.key as keyof PrivacySettings, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h2>
              
              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                    Ngôn ngữ
                  </label>
                  <select
                    value={accountSettings.language}
                    onChange={(e) => handleAccountChange('language', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền tệ
                  </label>
                  <select
                    value={accountSettings.currency}
                    onChange={(e) => handleAccountChange('currency', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VND">VND (Việt Nam Đồng)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    value={accountSettings.timezone}
                    onChange={(e) => handleAccountChange('timezone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                    <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                    <option value="Asia/Singapore">Singapore (UTC+8)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Định dạng ngày
                  </label>
                  <select
                    value={accountSettings.dateFormat}
                    onChange={(e) => handleAccountChange('dateFormat', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Bảo mật tài khoản</h2>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <KeyIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Đổi mật khẩu</h3>
                        <p className="text-sm text-gray-600">Cập nhật lần cuối: 30 ngày trước</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      Đổi mật khẩu
                    </Button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Xác thực 2 bước</h3>
                        <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      Kích hoạt
                    </Button>
                  </div>

                  {/* Login Sessions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Phiên đăng nhập</h3>
                        <p className="text-sm text-gray-600">Quản lý các thiết bị đã đăng nhập</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border-red-200">
                <div className="flex items-center space-x-2 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-900">Vùng nguy hiểm</h2>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Xóa tài khoản</h3>
                      <p className="text-sm text-red-700">
                        Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                      </p>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Xóa tài khoản
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'security' && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={saveSettings}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu cài đặt'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
