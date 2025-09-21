import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import FeaturedTours from '../components/sections/FeaturedTours';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Tours */}
      <FeaturedTours />
      
      {/* TODO: Add more sections */}
      {/* - Popular Categories Grid */}
      {/* - Customer Testimonials */}
      {/* - Newsletter Signup */}
      {/* - CTA Sections */}
    </div>
  );
};

export default LandingPage;
