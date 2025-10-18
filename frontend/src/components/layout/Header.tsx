import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../notifications';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout, getUserInitials } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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
    { name: 'Điểm thưởng', href: '/loyalty', icon: SparklesIcon },
    { name: 'Tour yêu thích', href: '/wishlist', icon: HeartIcon },
  ];

  // Admin-only navigation item
  // Debug: Log user role
  const adminNavigation = user?.role?.name?.toUpperCase() === 'ADMIN' 
    ? [{ name: 'Quay lại Admin', href: '/admin', icon: ShieldCheckIcon }] 
    : [];
  return (
    <header className="bg-white shadow-sm border-b border-stone-200 relative z-50">
      {/* Top Row: Logo + Search + Hotline */}
      <div className="bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white p-2 rounded-none mr-3 group-hover:from-yellow-500 group-hover:to-yellow-600 transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                  <h1 className="text-xl font-semibold text-white tracking-wide">TourBooking</h1>
                  <p className="text-xs text-gray-300 font-normal tracking-wider">Khám phá vẻ đẹp thế giới</p>
              </div>
            </Link>
          </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn muốn đi đâu?"
                  className="block w-full pl-12 pr-3 py-2.5 border border-slate-700 rounded-none leading-5 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:border-[#D4AF37] font-normal text-sm"
                />
                <button type="submit" className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <div className="text-white p-2 rounded-none transition-all shadow-md hover:opacity-90" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </div>
                </button>
              </div>
            </form>

            {/* Hotline */}
            <div className="hidden lg:flex items-center space-x-3 text-white px-5 py-2.5 rounded-none transition-all border shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)', borderColor: '#C5A028' }}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <div className="font-normal text-xs tracking-wide">Hotline</div>
                <div className="font-semibold tracking-wider">(+84) 868.541.104</div>
              </div>
            </div>

            {/* Mobile Search Icon */}
            <button 
              className="md:hidden p-3 text-gray-300 hover:text-white hover:bg-slate-800 rounded-none transition-colors"
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
          <nav className="hidden md:flex space-x-1">
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
                      className={`flex items-center space-x-1 px-4 py-2 rounded-none text-base font-medium tracking-wide transition-all ${
                        item.current
                          ? 'text-slate-900 bg-stone-100 border-b-2'
                          : 'text-gray-700 hover:text-slate-900 hover:bg-stone-50'
                      }`}
                      style={item.current ? { borderBottomColor: '#D4AF37' } : {}}
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
                      <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-none shadow-lg border border-stone-200 z-50">
                        <div className="py-1">
                          {tourCategories.map((category) => (
                            <Link
                              key={category.name}
                              to={category.href}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 hover:text-slate-900 transition-colors font-normal"
                              onClick={() => setIsTourDropdownOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                          <div className="border-t border-stone-200 mt-1 pt-1">
                            <Link
                              to="/tours"
                              className="block px-4 py-3 text-sm font-medium hover:bg-stone-50 transition-colors"
                              style={{ color: '#D4AF37' }}
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
                className={`px-4 py-2 rounded-none text-base font-medium tracking-wide transition-all ${
                  item.current
                    ? 'text-slate-900 bg-stone-100 border-b-2'
                    : 'text-gray-700 hover:text-slate-900 hover:bg-stone-50'
                }`}
                style={item.current ? { borderBottomColor: '#D4AF37' } : {}}
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
                  className="flex items-center space-x-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[#D4AF37]"
                >
                  <div className="h-9 w-9 rounded-none bg-slate-900 border flex items-center justify-center" style={{ borderColor: '#D4AF37' }}>
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="h-9 w-9 rounded-none object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium tracking-wider" style={{ color: '#D4AF37' }}>
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-slate-900 font-medium tracking-wide">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* ✅ FIXED: User dropdown positioning - removed inline styles */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-none shadow-lg py-1 border border-stone-200 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-stone-200">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-gray-500 font-normal text-xs">{user?.email}</p>
                    </div>
                    {/* Admin Panel link (if admin) */}
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-2.5 text-sm text-white bg-slate-900 hover:bg-slate-800 font-medium"
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
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 hover:text-slate-900 font-normal"
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
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 hover:text-slate-900 border-t border-stone-200 text-left font-normal"
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
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-slate-900 px-4 py-2 rounded-none text-base font-medium tracking-wide transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-none text-sm font-medium tracking-wider transition-all border border-slate-900"
                  style={{ '--hover-border-color': '#D4AF37' } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4AF37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0f172a'}
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors min-h-[48px] min-w-[48px]"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
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