import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { cancellationService } from '../../services';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Pagination from '../ui/Pagination';
import { CancellationRequestForm } from './CancellationRequestForm';
import { CancellationDetails } from './CancellationDetails';

// Inline types to fix import issues
type CancellationStatusType = 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
type RefundStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_APPLICABLE';

// UTC+7 timezone formatter for Vietnam
const formatDateVietnam = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

const CancellationStatus = {
  REQUESTED: 'REQUESTED',
  UNDER_REVIEW: 'UNDER_REVIEW', 
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
} as const;

const RefundStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NOT_APPLICABLE: 'NOT_APPLICABLE'
} as const;

interface CancellationHistoryItem {
  id: number;
  bookingId: number;
  bookingCode: string;
  tourName: string;
  reason: string;
  reasonCategory: string;
  status: CancellationStatusType;
  refundStatus: RefundStatusType;
  originalAmount: number;
  finalRefundAmount: number;
  cancelledAt: string;
  processedAt?: string;
  refundProcessedAt?: string;
  adminNotes?: string;
  hoursBeforeDeparture: number;
  policyName: string;
  isEmergencyCase: boolean;
}

interface CancellationHistoryProps {
  className?: string;
  refreshTrigger?: number; // Add refresh trigger prop
  newCancellationData?: any; // Add new cancellation data prop
}

export const CancellationHistory: React.FC<CancellationHistoryProps> = ({ className = '', refreshTrigger, newCancellationData }) => {
  const { user } = useAuth();
  const [cancellations, setCancellations] = useState<CancellationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing to match Pagination component
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCancellation, setSelectedCancellation] = useState<CancellationHistoryItem | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [newCancellations, setNewCancellations] = useState<CancellationHistoryItem[]>([]);

  const pageSize = 10;


  const statusLabels = {
    [CancellationStatus.REQUESTED]: 'Đã gửi yêu cầu',
    [CancellationStatus.UNDER_REVIEW]: 'Đang xem xét',
    [CancellationStatus.APPROVED]: 'Đã phê duyệt',
    [CancellationStatus.REJECTED]: 'Bị từ chối',
    [CancellationStatus.COMPLETED]: 'Hoàn tất'
  };

  const refundStatusLabels = {
    [RefundStatus.PENDING]: 'Chờ xử lý',
    [RefundStatus.PROCESSING]: 'Đang xử lý',
    [RefundStatus.COMPLETED]: 'Đã hoàn tiền',
    [RefundStatus.FAILED]: 'Thất bại',
    [RefundStatus.NOT_APPLICABLE]: 'Không áp dụng'
  };

  const reasonLabels: Record<string, string> = {
    'PERSONAL_EMERGENCY': 'Khẩn cấp cá nhân',
    'MEDICAL_EMERGENCY': 'Khẩn cấp y tế',
    'WEATHER_CONDITIONS': 'Điều kiện thời tiết',
    'FORCE_MAJEURE': 'Bất khả kháng',
    'TRAVEL_RESTRICTIONS': 'Hạn chế đi lại',
    'SCHEDULE_CONFLICT': 'Xung đột lịch trình',
    'FINANCIAL_DIFFICULTY': 'Khó khăn tài chính',
    'DISSATISFACTION': 'Không hài lòng',
    'DUPLICATE_BOOKING': 'Đặt trùng lặp',
    'TECHNICAL_ERROR': 'Lỗi kỹ thuật',
    'OTHER': 'Khác'
  };

  // Load cancellation history
  useEffect(() => {
    if (user) {
      loadCancellations();
    }
  }, [user, currentPage, statusFilter, searchTerm, refreshTrigger]);

  // Handle new cancellation data from parent
  useEffect(() => {
    if (newCancellationData) {
      // Create cancellation item from the data
      const cancellationItem: CancellationHistoryItem = {
        id: Date.now(),
        bookingId: newCancellationData.bookingId || 1,
        bookingCode: `BK${newCancellationData.bookingId || 1}`,
        tourName: 'Tour được hủy',
        reason: 'Yêu cầu hủy từ khách hàng',
        reasonCategory: 'PERSONAL_EMERGENCY',
        status: 'REQUESTED' as CancellationStatusType,
        refundStatus: 'PENDING' as RefundStatusType,
        originalAmount: 2500000,
        finalRefundAmount: 2000000,
        cancelledAt: new Date().toISOString(),
        hoursBeforeDeparture: 72,
        policyName: 'Standard Policy',
        isEmergencyCase: false
      };
      setNewCancellations(prev => {
        const updated = [cancellationItem, ...prev];
        return updated;
      });
    }
  }, [newCancellationData]);

  // Listen for new cancellation requests from the form
  useEffect(() => {
    const handleNewCancellation = (event: CustomEvent) => {
      const newCancellation = event.detail;
      
      // Create new cancellation item from the form data
      const cancellationItem: CancellationHistoryItem = {
        id: Date.now(), // Use timestamp as ID
        bookingId: newCancellation.bookingId,
        bookingCode: `BK${newCancellation.bookingId}`,
        tourName: newCancellation.tourName || 'Tour được chọn',
        reason: newCancellation.reason,
        reasonCategory: newCancellation.reasonCategory,
        status: 'REQUESTED' as CancellationStatusType,
        refundStatus: 'PENDING' as RefundStatusType,
        originalAmount: newCancellation.originalAmount || 2500000,
        finalRefundAmount: newCancellation.finalRefundAmount || 2000000,
        cancelledAt: new Date().toISOString(),
        hoursBeforeDeparture: 72, // Mock value
        policyName: 'Standard Policy',
        isEmergencyCase: newCancellation.isEmergencyCase || false
      };

      // Add to new cancellations list
      setNewCancellations(prev => {
        const updated = [cancellationItem, ...prev];
        return updated;
      });
    };

    // Listen for custom event from CancellationRequestForm
    window.addEventListener('cancellation-request-submitted', handleNewCancellation as EventListener);

    return () => {
      window.removeEventListener('cancellation-request-submitted', handleNewCancellation as EventListener);
    };
  }, []);

  const loadCancellations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Use real API call (currentPage is already 0-based)
      const response = await cancellationService.getUserCancellations(user.id, currentPage, pageSize);
      // Successfully loaded cancellations from API
      
      // Convert API response to CancellationHistoryItem format
      const apiCancellations = response.content.map(cancellation => ({
        id: cancellation.id,
        bookingId: cancellation.booking?.id || 0,
        bookingCode: cancellation.booking?.bookingCode || 'N/A',
        tourName: cancellation.booking?.tourName || 'Unknown Tour',
        reason: cancellation.reason,
        reasonCategory: cancellation.reasonCategory,
        status: cancellation.status as CancellationStatusType,
        refundStatus: cancellation.refundStatus as RefundStatusType,
        originalAmount: cancellation.originalAmount,
        finalRefundAmount: cancellation.finalRefundAmount,
        cancelledAt: cancellation.cancelledAt || cancellation.createdAt,
        processedAt: cancellation.processedAt,
        hoursBeforeDeparture: cancellation.hoursBeforeDeparture || 0,
        policyName: cancellation.policyName || 'Standard Policy',
        isEmergencyCase: cancellation.isEmergencyCase
      }));
      
      // Combine with new cancellations from form submissions
      let allCancellations = [...newCancellations, ...apiCancellations];
      // Combined cancellations ready for display
      
      // Apply client-side filtering if needed
      if (statusFilter && statusFilter !== 'all') {
        allCancellations = allCancellations.filter(c => c.status === statusFilter);
      }
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        allCancellations = allCancellations.filter(c => 
          c.bookingCode.toLowerCase().includes(search) ||
          c.tourName.toLowerCase().includes(search) ||
          c.reason.toLowerCase().includes(search)
        );
      }
      
      setCancellations(allCancellations);
      setTotalCount(response.totalElements + newCancellations.length);
      setTotalPages(Math.ceil((response.totalElements + newCancellations.length) / pageSize));

    } catch (error) {
      console.error('Error loading cancellations:', error);
      
      // Show empty state on error
      setCancellations([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (cancellation: CancellationHistoryItem) => {
    setSelectedCancellation(cancellation);
    setShowDetails(true);
  };

  const handleNewCancellation = () => {
    setShowRequestForm(true);
  };

  const handleCancellationSuccess = (newCancellation: any) => {
    // Refresh the list
    loadCancellations();
    
    // Show success message
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Thành công!',
        message: 'Yêu cầu hủy booking mới đã được tạo',
        duration: 5000
      }
    });
    window.dispatchEvent(event);
  };

  const getStatusColor = (status: CancellationStatusType) => {
    switch (status) {
      case CancellationStatus.REQUESTED:
        return 'bg-yellow-100 text-yellow-800';
      case CancellationStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case CancellationStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case CancellationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case CancellationStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusColor = (status: RefundStatusType) => {
    switch (status) {
      case RefundStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RefundStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case RefundStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case RefundStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case RefundStatus.NOT_APPLICABLE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử hủy booking</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi các yêu cầu hủy booking của bạn</p>
        </div>
        <Button 
          onClick={handleNewCancellation}
          className="mt-4 sm:mt-0"
          variant="primary"
        >
          + Yêu cầu hủy mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tìm kiếm"
              placeholder="Tìm theo mã booking, tên tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(0);
                }}
                className="w-full"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      {!isLoading && (
        <div className="mb-4 text-sm text-gray-600">
          Hiển thị {cancellations.length} trong tổng số {totalCount} yêu cầu hủy
        </div>
      )}

      {/* Cancellations List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      ) : cancellations.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có yêu cầu hủy nào
            </h3>
            <p className="text-gray-500 mb-4">
              Bạn chưa gửi yêu cầu hủy booking nào. Nhấn nút bên dưới để tạo yêu cầu mới.
            </p>
            <Button onClick={handleNewCancellation} variant="primary">
              Tạo yêu cầu hủy đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {cancellations.map((cancellation) => (
            <Card key={cancellation.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {cancellation.tourName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Mã booking: <span className="font-medium">{cancellation.bookingCode}</span>
                        </p>
                      </div>
                      
                      {cancellation.isEmergencyCase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Khẩn cấp
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Lý do</p>
                        <p className="text-sm font-medium text-gray-900">
                          {reasonLabels[cancellation.reasonCategory] || cancellation.reasonCategory}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày hủy</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateVietnam(cancellation.cancelledAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Số tiền gốc</p>
                        <p className="text-sm font-medium text-gray-900">
                          {cancellation.originalAmount != null 
                            ? `${cancellation.originalAmount.toLocaleString('vi-VN')} ₫`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Hoàn tiền</p>
                        <p className={`text-sm font-medium ${
                          (cancellation.finalRefundAmount != null && cancellation.finalRefundAmount > 0) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {cancellation.finalRefundAmount != null && cancellation.finalRefundAmount > 0 
                            ? `${cancellation.finalRefundAmount.toLocaleString('vi-VN')} ₫`
                            : 'Không hoàn tiền'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cancellation.status)}`}>
                        {statusLabels[cancellation.status]}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(cancellation.refundStatus)}`}>
                        {refundStatusLabels[cancellation.refundStatus]}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {cancellation.reason}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(cancellation)}
                      size="sm"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>

                {/* Processing Timeline */}
                {cancellation.processedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Xử lý: {formatDateVietnam(cancellation.processedAt)}
                      {cancellation.refundProcessedAt && (
                        <>
                          <span className="mx-2">•</span>
                          Hoàn tiền: {formatDateVietnam(cancellation.refundProcessedAt)}
                        </>
                      )}
                    </div>
                    {cancellation.adminNotes && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Ghi chú admin:</span> {cancellation.adminNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals */}
      <CancellationRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={handleCancellationSuccess}
      />

      {selectedCancellation && (
        <CancellationDetails
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          cancellation={selectedCancellation}
        />
      )}
    </div>
  );
};
