import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../services';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Tour Management System',
    siteEmail: 'admin@tourmanagement.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    enableNotifications: true,
    enableReviews: true,
    autoApproveReviews: false,
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      if (response.data.success && response.data.data) {
        const apiSettings = response.data.data;
        setSettings({
          siteName: apiSettings.siteName || 'Tour Management System',
          siteEmail: apiSettings.siteEmail || 'admin@tourmanagement.com',
          currency: apiSettings.currency || 'VND',
          timezone: apiSettings.timezone || 'Asia/Ho_Chi_Minh',
          enableNotifications: apiSettings.enableNotifications === 'true',
          enableReviews: apiSettings.enableReviews === 'true',
          autoApproveReviews: apiSettings.autoApproveReviews === 'true',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // Convert settings to API format
      const apiSettings = {
        siteName: settings.siteName,
        siteEmail: settings.siteEmail,
        currency: settings.currency,
        timezone: settings.timezone,
        enableNotifications: settings.enableNotifications.toString(),
        enableReviews: settings.enableReviews.toString(),
        autoApproveReviews: settings.autoApproveReviews.toString(),
      };

      await apiClient.put('/admin/settings', apiSettings);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white shadow rounded-lg">
        {/* General Settings */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Cài đặt chung</h3>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên website
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email liên hệ
            </label>
            <input
              type="email"
              value={settings.siteEmail}
              onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Đơn vị tiền tệ
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Múi giờ
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className="px-6 py-5 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tính năng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Bật thông báo</h4>
                <p className="text-sm text-gray-500">Cho phép gửi thông báo đến người dùng</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                className={`${
                  settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Bật đánh giá</h4>
                <p className="text-sm text-gray-500">Cho phép khách hàng đánh giá tour</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enableReviews: !settings.enableReviews })}
                className={`${
                  settings.enableReviews ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.enableReviews ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Tự động duyệt đánh giá</h4>
                <p className="text-sm text-gray-500">Đánh giá sẽ tự động được hiển thị</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, autoApproveReviews: !settings.autoApproveReviews })}
                className={`${
                  settings.autoApproveReviews ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.autoApproveReviews ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-3">
          {saveSuccess && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Đã lưu thành công!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <Cog6ToothIcon className="-ml-1 mr-2 h-5 w-5" />
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

