import React from 'react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// Inline types to fix import issues
type CancellationStatusType = 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
type RefundStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_APPLICABLE';

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

interface CancellationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  cancellation: CancellationHistoryItem;
}

export const CancellationDetails: React.FC<CancellationDetailsProps> = ({
  isOpen,
  onClose,
  cancellation
}) => {
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

  const getStatusColor = (status: CancellationStatusType) => {
    switch (status) {
      case CancellationStatus.REQUESTED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case CancellationStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case CancellationStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case CancellationStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case CancellationStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRefundStatusColor = (status: RefundStatusType) => {
    switch (status) {
      case RefundStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case RefundStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case RefundStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case RefundStatus.FAILED:
        return 'bg-red-100 text-red-800 border-red-200';
      case RefundStatus.NOT_APPLICABLE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const getStatusIcon = (status: CancellationStatusType) => {
    switch (status) {
      case CancellationStatus.REQUESTED:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case CancellationStatus.UNDER_REVIEW:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case CancellationStatus.APPROVED:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case CancellationStatus.REJECTED:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case CancellationStatus.COMPLETED:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderTimeline = () => {
    const events = [
      {
        title: 'Yêu cầu hủy đã được gửi',
        date: cancellation.cancelledAt,
        status: 'completed',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        )
      }
    ];

    if (cancellation.processedAt) {
      events.push({
        title: cancellation.status === CancellationStatus.APPROVED ? 'Yêu cầu được phê duyệt' : 'Yêu cầu bị từ chối',
        date: cancellation.processedAt,
        status: 'completed',
        icon: getStatusIcon(cancellation.status)
      });
    }

    if (cancellation.refundProcessedAt) {
      events.push({
        title: 'Hoàn tiền thành công',
        date: cancellation.refundProcessedAt,
        status: 'completed',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a2 2 0 114 0 2 2 0 01-4 0z" />
          </svg>
        )
      });
    }

    return (
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== events.length - 1 && (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                    <div className="text-white">
                      {event.icon}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title="Chi tiết yêu cầu hủy booking">
      <div className="px-6 py-4">
        {/* Status and Emergency Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cancellation.status)}`}>
              <span className="mr-2">{getStatusIcon(cancellation.status)}</span>
              {statusLabels[cancellation.status]}
            </span>
            {cancellation.isEmergencyCase && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Khẩn cấp
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin booking</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tên tour</p>
                    <p className="text-sm text-gray-900 mt-1">{cancellation.tourName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mã booking</p>
                    <p className="text-sm text-gray-900 mt-1 font-mono">{cancellation.bookingCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Số tiền gốc</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(cancellation.originalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Chính sách áp dụng</p>
                    <p className="text-sm text-gray-900 mt-1">{cancellation.policyName}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cancellation Details */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết yêu cầu hủy</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loại lý do</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {reasonLabels[cancellation.reasonCategory] || cancellation.reasonCategory}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mô tả chi tiết</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{cancellation.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Thời gian hủy</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(cancellation.cancelledAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Thời gian trước khởi hành</p>
                      <p className="text-sm text-gray-900 mt-1">{cancellation.hoursBeforeDeparture} giờ</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Admin Response */}
            {cancellation.processedAt && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi từ admin</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Trạng thái xử lý</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusColor(cancellation.status)}`}>
                          <span className="mr-2">{getStatusIcon(cancellation.status)}</span>
                          {statusLabels[cancellation.status]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Thời gian xử lý</p>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(cancellation.processedAt)}</p>
                      </div>
                    </div>

                    {cancellation.adminNotes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ghi chú từ admin</p>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{cancellation.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Refund Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hoàn tiền</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Số tiền gốc:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(cancellation.originalAmount)}</span>
                  </div>
                  
                  {cancellation.finalRefundAmount > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số tiền hoàn:</span>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(cancellation.finalRefundAmount)}</span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-2">Trạng thái hoàn tiền</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRefundStatusColor(cancellation.refundStatus)}`}>
                          {refundStatusLabels[cancellation.refundStatus]}
                        </span>
                      </div>

                      {cancellation.refundProcessedAt && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Thời gian hoàn tiền</p>
                          <p className="text-sm text-gray-900 mt-1">{formatDate(cancellation.refundProcessedAt)}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center text-red-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Không được hoàn tiền</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến trình xử lý</h3>
                {renderTimeline()}
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                <div className="space-y-3">
                  {cancellation.status === CancellationStatus.REQUESTED && (
                    <Button variant="outline" size="sm" className="w-full">
                      Chỉnh sửa yêu cầu
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Tải xuống PDF
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Gửi email cho admin
                  </Button>
                  
                  {cancellation.refundStatus === RefundStatus.COMPLETED && (
                    <Button variant="outline" size="sm" className="w-full">
                      Xem biên lai hoàn tiền
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
