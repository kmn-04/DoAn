import { useState } from 'react';
import Sidebar from './Navigation';
import '../styles/components/Layout.css';

const Layout = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar 
        onLogout={onLogout} 
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
