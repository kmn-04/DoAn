import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResponsive, touchTargets } from '../../utils/responsive';
import { 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../notifications';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout, getUserInitials } = useAuth();
  const location = useLocation();
  const responsive = useResponsive();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const tourDropdownRef = useRef<HTMLDivElement>(null);
  const tourDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (tourDropdownRef.current && !tourDropdownRef.current.contains(event.target as Node)) {
        setIsTourDropdownOpen(false);
      }
    };

    if (isUserMenuOpen || isTourDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isTourDropdownOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tourDropdownTimerRef.current) {
        clearTimeout(tourDropdownTimerRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    logout(); // This calls the logout from useAuth hook
    setIsUserMenuOpen(false);
  };

  const handleTourDropdownEnter = () => {
    if (tourDropdownTimerRef.current) {
      clearTimeout(tourDropdownTimerRef.current);
    }
    setIsTourDropdownOpen(true);
  };

  const handleTourDropdownLeave = () => {
    tourDropdownTimerRef.current = setTimeout(() => {
      setIsTourDropdownOpen(false);
    }, 200); // 200ms delay
  };

  // Tour categories for dropdown
  const tourCategories = [
    { name: 'Tour Trong Nước', href: '/tours?tourType=domestic' },
    { name: 'Tour Quốc Tế', href: '/tours?tourType=international' },
    { name: 'Tour Châu Á', href: '/tours?continent=Asia' },
    { name: 'Tour Châu Âu', href: '/tours?continent=Europe' },
    { name: 'Tour Châu Mỹ', href: '/tours?continent=America' },
    { name: 'Tour Châu Phi', href: '/tours?continent=Africa' },
    { name: 'Tour Châu Đại Dương', href: '/tours?continent=Oceania' },
  ];

  const navigation = [
    { name: 'Trang chủ', href: '/dashboard', current: location.pathname === '/dashboard' },
    { 
      name: 'Tour du lịch', 
      href: '/tours', 
      current: location.pathname === '/tours',
      hasDropdown: true
    },
    { name: 'Đối tác', href: '/partners', current: location.pathname === '/partners' || location.pathname.startsWith('/partners/') },
    { name: 'Về chúng tôi', href: '/about', current: location.pathname === '/about' },
    { name: 'Liên hệ', href: '/contact', current: location.pathname === '/contact' },
  ];

  // ✅ UPDATED: Clean user navigation - cancellation history is now integrated into booking page
  const userNavigation = [
    { name: 'Hồ sơ cá nhân', href: '/profile', icon: UserCircleIcon },
    { name: 'Booking của tôi', href: '/bookings', icon: ShoppingBagIcon },
    { name: 'Tour yêu thích', href: '/wishlist', icon: HeartIcon },
    { name: 'Cài đặt', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Admin-only navigation item
  // Debug: Log user role
  const adminNavigation = user?.role?.name?.toUpperCase() === 'ADMIN' 
    ? [{ name: 'Quay lại Admin', href: '/admin', icon: ShieldCheckIcon }] 
    : [];
  return (
    <header className="bg-white shadow-lg relative z-50">
      {/* Top Row: Logo + Search + Hotline */}
      <div className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                  <h1 className="text-xl font-bold text-blue-700">TourBooking</h1>
                  <p className="text-xs text-gray-600">Khám phá vẻ đẹp thế giới</p>
              </div>
            </Link>
          </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* Hotline */}
            <div className="hidden lg:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <div className="font-medium">Hotline</div>
                <div className="font-bold">(+84) 868.541.104</div>
              </div>
            </div>

            {/* Mobile Search Icon */}
            <button 
              className={`md:hidden p-3 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors ${touchTargets.button}`}
              aria-label="Tìm kiếm"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation + User Menu */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    ref={tourDropdownRef}
                    onMouseEnter={handleTourDropdownEnter}
                    onMouseLeave={handleTourDropdownLeave}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.current
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isTourDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </Link>
                    
                    {/* Tour Categories Dropdown */}
                    {isTourDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-2">
                          {tourCategories.map((category) => (
                            <Link
                              key={category.name}
                              to={category.href}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setIsTourDropdownOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                          <div className="border-t mt-2 pt-2">
                            <Link
                              to="/tours"
                              className="block px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => setIsTourDropdownOpen(false)}
                            >
                              Xem tất cả tour
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
              );
            })}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* ✅ NotificationCenter (kept in header for quick access) */}
                <NotificationCenter />
                
                {/* Authenticated User Menu */}
                <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-white">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* ✅ FIXED: User dropdown positioning - removed inline styles */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    {/* Admin Panel link (if admin) */}
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                    {/* User navigation */}
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              // Guest Actions
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className={`md:hidden inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors ${touchTargets.button}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchTargets.input}`}
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            {navigation.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                        item.current
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Link>
                    
                    {/* Mobile Tour Categories */}
                    <div className="ml-4 mt-1 space-y-1">
                      {tourCategories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.href}
                          className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              
              return (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.current
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
              );
            })}

            {/* Mobile Auth Actions */}
            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t">
                <div className="flex items-center px-3 space-x-3">
                  <Link
                    to="/login"
                    className="block text-center flex-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click overlay to close menus */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;