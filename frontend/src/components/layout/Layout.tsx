import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true, 
  className = '' 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
