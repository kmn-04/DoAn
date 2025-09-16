import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import Icons from './Icons';
import '../styles/components/Sidebar.css';

const Sidebar = ({ onLogout, isMobileOpen, onCloseMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'Dashboard', roles: ['ADMIN', 'STAFF', 'USER'] },
    { path: '/users', label: 'Người dùng', icon: 'Users', roles: ['ADMIN'] },
    { path: '/categories', label: 'Danh mục', icon: 'Categories', roles: ['ADMIN', 'STAFF'] },
    { path: '/tours', label: 'Tours', icon: 'Tours', roles: ['ADMIN', 'STAFF'] },
    { path: '/partners', label: 'Đối tác', icon: 'Partners', roles: ['ADMIN'] },
    { path: '/bookings', label: 'Bookings', icon: 'Bookings', roles: ['ADMIN', 'STAFF'] },
    { path: '/reviews', label: 'Reviews', icon: 'Reviews', roles: ['ADMIN', 'STAFF'] },
    { path: '/contacts', label: 'Liên hệ', icon: 'Contacts', roles: ['ADMIN', 'STAFF'] },
    { path: '/payments', label: 'Thanh toán', icon: 'Payments', roles: ['ADMIN'] },
    { path: '/invoices', label: 'Hóa đơn', icon: 'Invoices', roles: ['ADMIN', 'STAFF'] },
    { path: '/promotions', label: 'Khuyến mãi', icon: 'Promotions', roles: ['ADMIN', 'STAFF'] },
    { path: '/reports', label: 'Thống kê & Báo cáo', icon: 'Reports', roles: ['ADMIN'] },
  ];

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">🏠</span>
          {!isCollapsed && <span className="brand-text">TourDu</span>}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <span className={`toggle-icon ${isCollapsed ? 'rotated' : ''}`}>
            {isCollapsed ? '▶' : '◀'}
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {visibleItems.map(item => (
            <li key={item.path} className="nav-item">
              <button
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">
                  {Icons[item.icon] && Icons[item.icon]()}
                </span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {location.pathname === item.path && (
                  <div className="active-indicator"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="sidebar-footer">
        <div className="user-section" ref={userMenuRef}>
          <div 
            className={`user-info ${showUserMenu ? 'active' : ''}`}
            onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`}
              alt={user?.fullName}
              className="user-avatar"
            />
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-role">Admin</span>
              </div>
            )}
            {!isCollapsed && (
              <button className="user-menu-toggle">
                <span className="menu-dots">⋮</span>
              </button>
            )}
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && !isCollapsed && (
            <div className="user-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                Profile
              </button>
              <button 
                className="dropdown-item logout"
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}

          {/* Logout button for collapsed state */}
          {isCollapsed && (
            <button 
              className="logout-btn collapsed-logout" 
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <span className="logout-icon">🚪</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
