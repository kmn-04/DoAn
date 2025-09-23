import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui';

interface BookingResult {
  id: number;
  bookingCode: string;
  status: string;
  totalPrice: number;
  startDate: string;
  numAdults: number;
  numChildren: number;
  tour: {
    name: string;
    location: string;
  };
}

const BookingConfirmationPage: React.FC = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const location = useLocation();
  const { bookingData, customerInfo, paymentMethod, bookingResult } = location.state || {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt tour thành công!
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã tin tưởng và đặt tour với chúng tôi
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chi tiết đặt tour
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Mã booking:</span>
              <span className="font-mono font-semibold text-blue-600 text-lg">
                {bookingCode || bookingResult?.bookingCode}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Đã xác nhận
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tour Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin tour</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData?.tourName || bookingResult?.tour?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingData?.tourLocation || bookingResult?.tour?.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Ngày khởi hành</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(bookingData?.startDate || bookingResult?.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Số người tham gia</p>
                    <p className="text-sm text-gray-600">
                      {(bookingData?.adults || bookingResult?.numAdults)} người lớn
                      {(bookingData?.children || bookingResult?.numChildren) > 0 && 
                        `, ${bookingData?.children || bookingResult?.numChildren} trẻ em`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {customerInfo?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customerInfo?.fullName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{customerInfo?.email}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{customerInfo?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(bookingData?.totalPrice || bookingResult?.totalPrice || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Các bước tiếp theo</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Chúng tôi sẽ gửi email xác nhận chi tiết trong vòng 15 phút</p>
            <p>• Nhân viên sẽ liên hệ với bạn trong vòng 24h để xác nhận thông tin</p>
            <p>• Vui lòng chuẩn bị giấy tờ tùy thân trước ngày khởi hành 3 ngày</p>
            <p>• Hotline hỗ trợ 24/7: <span className="font-semibold">1900 1234</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/bookings">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              Xem booking của tôi
            </Button>
          </Link>
          <Link to="/tours">
            <Button variant="outline" className="w-full sm:w-auto px-6 py-3">
              Khám phá tour khác
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;