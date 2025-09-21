import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';

const HeroSection: React.FC = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    startDate: '',
    duration: '',
    people: ''
  });

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search data:', searchData);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-12">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Khám Phá <span className="text-yellow-400">Việt Nam</span>
            <br />
            Cùng Chúng Tôi
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Trải nghiệm những chuyến du lịch tuyệt vời với dịch vụ chuyên nghiệp, 
            giá cả hợp lý và kỷ niệm không thể quên
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm md:text-base">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-yellow-400">500+</span>
              <span className="text-blue-100">Tour du lịch</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-yellow-400">10K+</span>
              <span className="text-blue-100">Khách hàng</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-yellow-400">5⭐</span>
              <span className="text-blue-100">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Tìm Tour Du Lịch Của Bạn
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Destination */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Điểm đến
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Chọn điểm đến..."
                    value={searchData.destination}
                    onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ngày khởi hành
                </label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.startDate}
                    onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Thời gian
                </label>
                <select
                  value={searchData.duration}
                  onChange={(e) => setSearchData({...searchData, duration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Chọn thời gian</option>
                  <option value="1-3">1-3 ngày</option>
                  <option value="4-7">4-7 ngày</option>
                  <option value="8-14">8-14 ngày</option>
                  <option value="15+">15+ ngày</option>
                </select>
              </div>

              {/* People */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số người
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={searchData.people}
                    onChange={(e) => setSearchData({...searchData, people: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Chọn số người</option>
                    <option value="1">1 người</option>
                    <option value="2">2 người</option>
                    <option value="3-5">3-5 người</option>
                    <option value="6-10">6-10 người</option>
                    <option value="10+">10+ người</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Tìm Tour</span>
              </Button>
              
              <Link
                to="/tours"
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                Xem Tất Cả Tour
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link
            to="/tours?category=beach"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
          >
            🏖️ Tour Biển
          </Link>
          <Link
            to="/tours?category=mountain"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
          >
            🏔️ Tour Núi
          </Link>
          <Link
            to="/tours?category=city"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
          >
            🏙️ Tour Thành Phố
          </Link>
          <Link
            to="/tours?category=culture"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
          >
            🏛️ Tour Văn Hóa
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
