import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  PrinterIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui';

interface BookingConfirmation {
  bookingId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  tour: {
    id: number;
    name: string;
    image: string;
    duration: string;
    location: string;
  };
  booking: {
    startDate: string;
    adults: number;
    children: number;
    totalPrice: number;
    specialRequests?: string;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  paymentMethod: string;
}

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch booking confirmation by ID
    const fetchConfirmation = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockConfirmation: BookingConfirmation = {
          bookingId: bookingId || 'BK' + Date.now(),
          status: 'confirmed',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          tour: {
            id: 1,
            name: "Hạ Long Bay - Kỳ Quan Thế Giới",
            image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
            duration: "2 ngày 1 đêm",
            location: "Quảng Ninh"
          },
          booking: {
            startDate: '2024-02-15',
            adults: 2,
            children: 1,
            totalPrice: 6200000,
            specialRequests: location.state?.bookingData?.specialRequests
          },
          customer: {
            fullName: location.state?.customerInfo?.fullName || 'Nguyễn Văn A',
            email: location.state?.customerInfo?.email || 'example@email.com',
            phone: location.state?.customerInfo?.phone || '0123456789',
            address: location.state?.customerInfo?.address || 'Hà Nội',
            emergencyContact: location.state?.customerInfo?.emergencyContact || 'Nguyễn Thị B',
            emergencyPhone: location.state?.customerInfo?.emergencyPhone || '0987654321'
          },
          paymentMethod: location.state?.paymentMethod || 'credit_card'
        };
        
        setConfirmation(mockConfirmation);
        setIsLoading(false);
      }, 1000);
    };

    fetchConfirmation();
  }, [bookingId, location.state]);

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

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Thẻ tín dụng/Ghi nợ',
      bank_transfer: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
      zalopay: 'ZaloPay'
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800' }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Xác nhận đặt tour',
        text: `Đã đặt tour ${confirmation?.tour.name} thành công!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được copy!');
    }
  };

  const handleDownloadPDF = () => {
    // In real app, generate and download PDF
    alert('Tính năng tải PDF sẽ được cập nhật sớm!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy booking</h1>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            ← Về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(confirmation.status);
  const paymentBadge = getPaymentStatusBadge(confirmation.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Đặt tour thành công!</h1>
          <p className="text-green-100 text-lg">
            Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>In</span>
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Tải PDF</span>
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>Chia sẻ</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thông tin đặt tour</h2>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentBadge.className}`}>
                    {paymentBadge.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mã đặt tour</h3>
                  <p className="text-2xl font-bold text-blue-600">{confirmation.bookingId}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ngày đặt</h3>
                  <p className="text-gray-700">{formatDate(confirmation.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Tour Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết tour</h2>
              
              <div className="flex space-x-4 mb-6">
                <img
                  src={confirmation.tour.image}
                  alt={confirmation.tour.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {confirmation.tour.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{confirmation.tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{confirmation.tour.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ngày khởi hành</h4>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">{formatDate(confirmation.booking.startDate)}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Số lượng khách</h4>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">
                      {confirmation.booking.adults} người lớn
                      {confirmation.booking.children > 0 && `, ${confirmation.booking.children} trẻ em`}
                    </span>
                  </div>
                </div>
              </div>

              {confirmation.booking.specialRequests && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu đặc biệt</h4>
                  <p className="text-gray-700">{confirmation.booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Họ tên:</span> {confirmation.customer.fullName}
                    </p>
                    <p className="text-gray-700 flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>{confirmation.customer.email}</span>
                    </p>
                    <p className="text-gray-700 flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{confirmation.customer.phone}</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Địa chỉ:</span> {confirmation.customer.address}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Liên hệ khẩn cấp</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Họ tên:</span> {confirmation.customer.emergencyContact}
                    </p>
                    <p className="text-gray-700 flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{confirmation.customer.emergencyPhone}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin thanh toán</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Phương thức thanh toán</h4>
                  <p className="text-gray-700">{getPaymentMethodLabel(confirmation.paymentMethod)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tổng tiền</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(confirmation.booking.totalPrice)}
                  </p>
                </div>
              </div>

              {confirmation.paymentStatus === 'pending' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Chờ thanh toán</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Vui lòng hoàn tất thanh toán trong vòng 24h để đảm bảo chỗ của bạn.
                        Chúng tôi sẽ gửi hướng dẫn thanh toán qua email.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bước tiếp theo</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email xác nhận đã được gửi</p>
                    <p className="text-gray-600">Kiểm tra hộp thư của bạn</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hoàn tất thanh toán</p>
                    <p className="text-gray-600">Trong vòng 24h</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nhận thông tin chi tiết</p>
                    <p className="text-gray-600">Trước 3 ngày khởi hành</p>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Hotline: 1900 1234</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">support@tourcompany.com</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Về Dashboard
                </Link>
                
                <Link
                  to="/tours"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Đặt tour khác
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
