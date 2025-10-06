import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  CalendarDaysIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RectangleStackIcon,
  StarIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Bảng điều khiển', href: '/admin', icon: HomeIcon },
      ]
    },
    {
      title: 'QUẢN LÝ NỘI DUNG',
      items: [
        { name: 'Tour du lịch', href: '/admin/tours', icon: MapIcon },
        { name: 'Danh mục', href: '/admin/categories', icon: RectangleStackIcon },
      ]
    },
    {
      title: 'QUẢN LÝ ĐƠN HÀNG',
      items: [
        { name: 'Đặt tour', href: '/admin/bookings', icon: CalendarDaysIcon },
        { name: 'Đánh giá', href: '/admin/reviews', icon: StarIcon },
      ]
    },
    {
      title: 'QUẢN LÝ KHÁCH HÀNG',
      items: [
        { name: 'Người dùng', href: '/admin/users', icon: UsersIcon },
        { name: 'Đối tác', href: '/admin/partners', icon: BuildingOffice2Icon },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { name: 'Khuyến mãi', href: '/admin/promotions', icon: TagIcon },
        { name: 'Thông báo', href: '/admin/notifications', icon: BellIcon },
      ]
    },
    {
      title: 'HỖ TRỢ',
      items: [
        { name: 'Liên hệ', href: '/admin/contacts', icon: EnvelopeIcon },
      ]
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { name: 'Thống kê', href: '/admin/statistics', icon: PresentationChartBarIcon },
        { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        style={{ width: sidebarCollapsed ? '80px' : '256px' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className={`text-xl font-bold text-blue-600 transition-opacity ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            {sidebarCollapsed ? 'AP' : 'Admin Panel'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 pt-6 pb-0 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Admin Navigation Groups */}
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex === navigationGroups.length - 1 ? '' : 'mb-4'}>
              {/* Group Title */}
              {!sidebarCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      } ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
                      title={sidebarCollapsed ? item.name : ''}
                    >
                      <item.icon
                        className={`${sidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        } ${sidebarCollapsed ? '' : 'mr-3'}`}
                      />
                      <span className={`transition-opacity ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse button - Desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-md transition-colors z-50"
        >
          {sidebarCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar footer - Admin info & actions */}
        <div className={`absolute bottom-0 border-t border-gray-200 bg-gray-50 p-3 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col space-y-2' : 'justify-between'}`}>
            {/* Admin info - Left side */}
            <div className="flex items-center">
              <UserCircleIcon className={`${sidebarCollapsed ? 'h-8 w-8' : 'h-10 w-10'} text-gray-400`} />
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role?.name}</p>
                </div>
              )}
            </div>
            
            {/* Action buttons - Right side */}
            <div className={`flex ${sidebarCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
              {/* Back to Dashboard button */}
              <Link
                to="/dashboard"
                className="p-2 text-gray-600 hover:bg-white hover:text-blue-600 rounded-lg transition-all"
                title="Quay về Dashboard"
              >
                <ChartBarIcon className="h-5 w-5" />
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} w-full`}>
        {/* Mobile menu button - fixed position */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md text-gray-500 hover:text-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Page content */}
        <main className="min-h-screen bg-gray-100 overflow-x-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

