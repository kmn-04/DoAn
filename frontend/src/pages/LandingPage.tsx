import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import FeaturedTours from '../components/sections/FeaturedTours';
import HotDeals from '../components/sections/HotDeals';
import BrowseByCategory from '../components/sections/BrowseByCategory';
import PopularDestinations from '../components/sections/PopularDestinations';
import { PersonalizedRecommendations } from '../components/recommendations';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Auto-sliding banner */}
      <HeroSection />
      
      {/* Featured Tours - Best tours carousel */}
      <FeaturedTours />
      
      {/* Hot Deals - Promotions with countdown */}
      <HotDeals />
      
      {/* Browse by Category - Tour categories grid */}
      <BrowseByCategory />
      
      {/* Popular Destinations - Top destinations */}
      <PopularDestinations />
      
      {/* Personalized Recommendations - AI-powered suggestions */}
      <PersonalizedRecommendations />
    </div>
  );
};

export default LandingPage;
