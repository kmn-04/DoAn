import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { bookingService, cancellationService } from '../../services';
// Temporary inline types to fix import issue
type CancellationReasonType = 'PERSONAL_EMERGENCY' | 'MEDICAL_EMERGENCY' | 'WEATHER_CONDITIONS' | 'FORCE_MAJEURE' | 'TRAVEL_RESTRICTIONS' | 'SCHEDULE_CONFLICT' | 'FINANCIAL_DIFFICULTY' | 'DISSATISFACTION' | 'DUPLICATE_BOOKING' | 'TECHNICAL_ERROR' | 'OTHER';

const CancellationReason = {
  PERSONAL_EMERGENCY: 'PERSONAL_EMERGENCY',
  MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY', 
  WEATHER_CONDITIONS: 'WEATHER_CONDITIONS',
  FORCE_MAJEURE: 'FORCE_MAJEURE',
  TRAVEL_RESTRICTIONS: 'TRAVEL_RESTRICTIONS',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
  FINANCIAL_DIFFICULTY: 'FINANCIAL_DIFFICULTY',
  DISSATISFACTION: 'DISSATISFACTION',
  DUPLICATE_BOOKING: 'DUPLICATE_BOOKING',
  TECHNICAL_ERROR: 'TECHNICAL_ERROR',
  OTHER: 'OTHER'
} as const;

interface CancellationRequest {
  bookingId: number;
  reason: string;
  reasonCategory: CancellationReasonType;
  additionalNotes?: string;
  isMedicalEmergency?: boolean;
  isWeatherRelated?: boolean;
  isForceMajeure?: boolean;
  supportingDocuments?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredRefundMethod?: string;
  customerNotes?: string;
  acknowledgesCancellationPolicy?: boolean;
  acknowledgesRefundTerms?: boolean;
  requestsExpediteProcessing?: boolean;
}


interface CancellationEvaluation {
  isEligible: boolean;
  reason: string;
  estimatedRefund: number;
  cancellationFee: number;
  processingFee: number;
  finalRefundAmount: number;
  hoursBeforeDeparture: number;
  policyName: string;
  warnings: string[];
  requirements: string[];
}

interface UserBooking {
  id: number;
  bookingCode: string;
  tourName: string;
  startDate: string;
  totalPrice: number;
  status: string;
  canCancel: boolean;
}

interface CancellationRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cancellation: any) => void;
  preselectedBookingId?: number | string;
}

export const CancellationRequestForm: React.FC<CancellationRequestFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedBookingId
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [evaluation, setEvaluation] = useState<CancellationEvaluation | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<CancellationRequest>({
    bookingId: Number(preselectedBookingId) || 0,
    reason: '',
    reasonCategory: 'OTHER',
    additionalNotes: '',
    isMedicalEmergency: false,
    isWeatherRelated: false,
    isForceMajeure: false,
    supportingDocuments: [],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    preferredRefundMethod: 'ORIGINAL_PAYMENT_METHOD',
    customerNotes: '',
    acknowledgesCancellationPolicy: false,
    acknowledgesRefundTerms: false,
    requestsExpediteProcessing: false
  });

  // Mock data for development
  const mockBookings: UserBooking[] = [
    {
      id: 1,
      bookingCode: 'BK123456',
      tourName: 'Tokyo - Kyoto - Osaka 7N6D',
      startDate: '2024-01-15',
      totalPrice: 15000000,
      status: 'Confirmed',
      canCancel: true
    },
    {
      id: 2,
      bookingCode: 'BK123457',
      tourName: 'Hạ Long Bay Adventure 3N2D',
      startDate: '2024-02-20',
      totalPrice: 3500000,
      status: 'Paid',
      canCancel: true
    },
    {
      id: 3,
      bookingCode: 'BK123458',
      tourName: 'Sapa Trekking Experience 2N1D',
      startDate: '2024-01-05',
      totalPrice: 2000000,
      status: 'Completed',
      canCancel: false
    }
  ];

  const reasonLabels = {
    [CancellationReason.PERSONAL_EMERGENCY]: 'Khẩn cấp cá nhân',
    [CancellationReason.MEDICAL_EMERGENCY]: 'Khẩn cấp y tế',
    [CancellationReason.WEATHER_CONDITIONS]: 'Điều kiện thời tiết',
    [CancellationReason.FORCE_MAJEURE]: 'Bất khả kháng',
    [CancellationReason.TRAVEL_RESTRICTIONS]: 'Hạn chế đi lại',
    [CancellationReason.SCHEDULE_CONFLICT]: 'Xung đột lịch trình',
    [CancellationReason.FINANCIAL_DIFFICULTY]: 'Khó khăn tài chính',
    [CancellationReason.DISSATISFACTION]: 'Không hài lòng',
    [CancellationReason.DUPLICATE_BOOKING]: 'Đặt trùng lặp',
    [CancellationReason.TECHNICAL_ERROR]: 'Lỗi kỹ thuật',
    [CancellationReason.OTHER]: 'Khác'
  };

  // Initialize data
  useEffect(() => {
    if (isOpen && user) {
      console.log('🔄 Initializing form - preselectedBookingId:', preselectedBookingId);
      loadUserBookings();
      if (!preselectedBookingId) {
        console.log('📝 No preselected booking - starting at step 1');
        setCurrentStep(1);
      }
    }
  }, [isOpen, user, preselectedBookingId]);

  // Handle preselected booking after bookings are loaded
  useEffect(() => {
    if (preselectedBookingId && userBookings.length > 0) {
      const booking = userBookings.find(b => b.id === Number(preselectedBookingId));
      console.log('📋 Looking for booking with ID:', Number(preselectedBookingId), 'in bookings:', userBookings.map(b => b.id));
      console.log('📋 Found preselected booking from real data:', booking);
      if (booking) {
        setSelectedBooking(booking);
        setFormData(prev => ({ ...prev, bookingId: Number(preselectedBookingId) }));
        console.log('⏭️ Skipping to step 2 for preselected booking');
        setCurrentStep(2);
      } else {
        console.log('❌ Preselected booking not found in user bookings');
        setCurrentStep(1);
      }
    }
  }, [preselectedBookingId, userBookings]);

  const loadUserBookings = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log('🔍 Loading user bookings for cancellation, user ID:', user.id);
      
      // Get real bookings from API
      const bookings = await bookingService.getBookingsByUser(user.id);
      console.log('📥 Received bookings for cancellation:', bookings);
      
      // Convert to UserBooking format and filter cancelable bookings
      const userBookings: UserBooking[] = bookings
        .filter(booking => {
          // Debug each booking's cancellation eligibility
          console.log('🔍 Checking booking for cancellation:', {
            bookingCode: booking.bookingCode,
            status: booking.status,
            startDate: booking.startDate,
            tourName: booking.tour?.name
          });
          
          // Allow cancellation for various booking statuses
          const validStatuses = ['CONFIRMED', 'PAID', 'Confirmed', 'Paid', 'PENDING', 'Pending'];
          const isValidStatus = validStatuses.includes(booking.status);
          
          // Check if booking is in the future (more lenient - allow same day)
          const bookingDate = new Date(booking.startDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day
          const isFutureOrToday = bookingDate >= today;
          
          console.log('📊 Cancellation check result:', {
            isValidStatus,
            validStatuses,
            actualStatus: booking.status,
            isFutureOrToday,
            bookingDate: bookingDate.toISOString(),
            today: today.toISOString(),
            canCancel: isValidStatus && isFutureOrToday
          });
          
          return isValidStatus && isFutureOrToday;
        })
        .map(booking => ({
          id: booking.id || Date.now(), // Use booking ID or timestamp as fallback
          bookingCode: booking.bookingCode,
          tourName: booking.tour?.name || 'Unknown Tour',
          startDate: booking.startDate,
          totalPrice: Number(booking.totalPrice),
          status: booking.status,
          canCancel: true
        }));
      
      console.log('✅ Converted user bookings for cancellation:', userBookings);
      
      // If no bookings pass the filter, show all bookings for debugging
      if (userBookings.length === 0 && bookings.length > 0) {
        console.log('⚠️ No bookings passed cancellation filter, showing all for debugging');
        const allUserBookings: UserBooking[] = bookings.map(booking => ({
          id: booking.id || Date.now(),
          bookingCode: booking.bookingCode,
          tourName: booking.tour?.name || 'Unknown Tour',
          startDate: booking.startDate,
          totalPrice: Number(booking.totalPrice),
          status: booking.status,
          canCancel: true // Allow all for debugging
        }));
        setUserBookings(allUserBookings);
      } else {
        setUserBookings(userBookings);
      }
      
    } catch (error) {
      console.error('Error loading bookings for cancellation:', error);
      // Fallback to mock data
      setUserBookings(mockBookings.filter(b => b.canCancel));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSelect = async (booking: UserBooking) => {
    setSelectedBooking(booking);
    setFormData(prev => ({ ...prev, bookingId: booking.id }));
    setCurrentStep(2);
  };

  const evaluateCancellation = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      console.log('🔍 Evaluating cancellation for booking:', selectedBooking.id);
      
      // Use real API call
      const evaluation = await cancellationService.evaluateCancellation(selectedBooking.id, formData);
      console.log('✅ Cancellation evaluation result:', evaluation);
      
      setEvaluation(evaluation);
    } catch (error) {
      console.error('❌ Error evaluating cancellation:', error);
      
      // Fallback to mock evaluation if API fails
      const mockEvaluation: CancellationEvaluation = {
        isEligible: true,
        reason: 'Cancellation allowed according to policy',
        estimatedRefund: selectedBooking.totalPrice * 0.8, // 80% refund
        cancellationFee: 50000,
        processingFee: 25000,
        finalRefundAmount: selectedBooking.totalPrice * 0.8 - 75000,
        hoursBeforeDeparture: 72,
        policyName: 'Chính sách tiêu chuẩn',
        warnings: ['Cancellation fee áp dụng', 'Processing fee áp dụng'],
        requirements: ['Yêu cầu lý do rõ ràng', 'Có thể yêu cầu giấy tờ chứng minh']
      };
      
      setEvaluation(mockEvaluation);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBooking && formData.reasonCategory && formData.reason.length >= 10) {
      // Triggering evaluation for cancellation request
      evaluateCancellation();
    }
  }, [selectedBooking, formData.reasonCategory, formData.reason]);

  const handleInputChange = (field: keyof CancellationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Convert to URLs for form data
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...(prev.supportingDocuments || []), ...fileUrls]
    }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validate submission requirements
    if (!selectedBooking || !evaluation?.isEligible) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('📤 Submitting cancellation request:', formData);
      
      // Use real API call
      const result = await cancellationService.submitCancellationRequest(formData);
      console.log('✅ Cancellation request submitted successfully:', result);
      
      // Success response from API
      const apiResponse = {
        id: result.id,
        bookingId: result.bookingId,
        status: result.status,
        message: 'Yêu cầu hủy booking đã được gửi thành công'
      };

      // Dispatch event for CancellationHistory to listen
      const cancellationEvent = new CustomEvent('cancellation-request-submitted', {
        detail: {
          bookingId: formData.bookingId,
          tourName: selectedBooking?.tourName,
          reason: formData.reason,
          reasonCategory: formData.reasonCategory,
          originalAmount: selectedBooking?.totalPrice,
          finalRefundAmount: evaluation?.estimatedRefund || 2000000,
          isEmergencyCase: formData.requestsExpediteProcessing
        }
      });
      console.log('🚀 Dispatching cancellation event:', cancellationEvent.detail);
      window.dispatchEvent(cancellationEvent);

      onSuccess(apiResponse);
      
      // Show success notification
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Gửi yêu cầu thành công!',
          message: 'Yêu cầu hủy booking của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi trong vòng 24h.',
          duration: 5000
        }
      });
      window.dispatchEvent(event);

      // Reset form and close
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Lỗi gửi yêu cầu',
          message: 'Có lỗi xảy ra khi gửi yêu cầu hủy. Vui lòng thử lại.',
          duration: 5000
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bookingId: 0,
      reason: '',
      reasonCategory: 'OTHER',
      additionalNotes: '',
      isMedicalEmergency: false,
      isWeatherRelated: false,
      isForceMajeure: false,
      supportingDocuments: [],
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      preferredRefundMethod: 'ORIGINAL_PAYMENT_METHOD',
      customerNotes: '',
      acknowledgesCancellationPolicy: false,
      acknowledgesRefundTerms: false,
      requestsExpediteProcessing: false
    });
    setSelectedBooking(null);
    setEvaluation(null);
    setUploadedFiles([]);
    setCurrentStep(1);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedBooking !== null;
      case 2:
        return formData.reasonCategory && formData.reason.length >= 10;
      case 3:
        const canProceed = formData.acknowledgesCancellationPolicy && formData.acknowledgesRefundTerms;
        // Step 3 validation: checkboxes and evaluation
        return canProceed;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    console.log('🎯 Rendering step content for currentStep:', currentStep);
    switch (currentStep) {
      case 1:
        console.log('📋 Rendering booking selection step');
        return renderBookingSelection();
      case 2:
        console.log('📝 Rendering cancellation details step');
        return renderCancellationDetails();
      case 3:
        console.log('✅ Rendering review and confirm step');
        return renderReviewAndConfirm();
      default:
        return null;
    }
  };

  const renderBookingSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chọn booking cần hủy
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : userBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Không có booking nào có thể hủy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userBookings.map((booking) => (
            <Card 
              key={booking.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedBooking?.id === booking.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleBookingSelect(booking)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.tourName}</h4>
                    <p className="text-sm text-gray-600">Mã booking: {booking.bookingCode}</p>
                    <p className="text-sm text-gray-600">
                      Khởi hành: {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {booking.totalPrice.toLocaleString('vi-VN')} ₫
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCancellationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chi tiết yêu cầu hủy
      </h3>

      {/* Selected Booking Info */}
      {selectedBooking && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <h4 className="font-semibold text-blue-900">{selectedBooking.tourName}</h4>
            <p className="text-sm text-blue-700">Mã booking: {selectedBooking.bookingCode}</p>
            <p className="text-sm text-blue-700">
              Khởi hành: {new Date(selectedBooking.startDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </Card>
      )}

      {/* Cancellation Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do hủy *
        </label>
        <select
          value={formData.reasonCategory}
          onChange={(e) => handleInputChange('reasonCategory', e.target.value as CancellationReasonType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Chọn lý do hủy</option>
          {Object.entries(reasonLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Detailed Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả chi tiết *
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => handleInputChange('reason', e.target.value)}
          placeholder="Vui lòng mô tả chi tiết lý do hủy booking..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={10}
        />
        <p className="text-xs text-gray-500 mt-1">
          Tối thiểu 10 ký tự ({formData.reason.length}/10)
        </p>
      </div>

      {/* Special Circumstances */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Trường hợp đặc biệt
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isMedicalEmergency}
              onChange={(e) => handleInputChange('isMedicalEmergency', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Khẩn cấp y tế</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isWeatherRelated}
              onChange={(e) => handleInputChange('isWeatherRelated', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Liên quan đến thời tiết</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isForceMajeure}
              onChange={(e) => handleInputChange('isForceMajeure', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Bất khả kháng</span>
          </label>
        </div>
      </div>

      {/* Supporting Documents */}
      {(formData.isMedicalEmergency || formData.isWeatherRelated || formData.isForceMajeure) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giấy tờ chứng minh
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emergency Contact */}
      {formData.isMedicalEmergency && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tên người liên hệ khẩn cấp"
            value={formData.emergencyContactName || ''}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            placeholder="Họ và tên"
          />
          <Input
            label="Số điện thoại"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            placeholder="0123456789"
          />
          <Input
            label="Mối quan hệ"
            value={formData.emergencyContactRelationship || ''}
            onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
            placeholder="Ví dụ: Vợ/chồng, con"
          />
        </div>
      )}

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú thêm
        </label>
        <textarea
          value={formData.additionalNotes || ''}
          onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
          placeholder="Thông tin bổ sung khác..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Refund Evaluation */}
      {evaluation && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <h4 className="font-semibold text-yellow-900 mb-3">Đánh giá hoàn tiền</h4>
            
            {evaluation.isEligible ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Số tiền gốc:</span>
                  <span className="font-medium">{selectedBooking?.totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền hoàn ước tính:</span>
                  <span className="font-medium text-green-600">
                    {(evaluation.estimatedRefund || 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí hủy:</span>
                  <span className="text-red-600">-{(evaluation.cancellationFee || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí xử lý:</span>
                  <span className="text-red-600">-{(evaluation.processingFee || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <hr className="border-yellow-300" />
                <div className="flex justify-between font-semibold">
                  <span>Số tiền hoàn cuối cùng:</span>
                  <span className="text-green-600">
                    {(evaluation.finalRefundAmount || 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  Chính sách: {evaluation.policyName} • {evaluation.hoursBeforeDeparture}h trước khởi hành
                </p>
                
                {evaluation.warnings && evaluation.warnings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-yellow-800">Lưu ý:</p>
                    <ul className="text-xs text-yellow-700 list-disc list-inside">
                      {evaluation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-medium">Không thể hủy booking</p>
                <p className="text-sm">{evaluation.reason}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderReviewAndConfirm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Xem lại và xác nhận
      </h3>

      {/* Summary */}
      {selectedBooking && evaluation && (
        <Card>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Thông tin booking</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Tour:</span> {selectedBooking.tourName}</p>
                <p><span className="font-medium">Mã booking:</span> {selectedBooking.bookingCode}</p>
                <p><span className="font-medium">Khởi hành:</span> {new Date(selectedBooking.startDate).toLocaleDateString('vi-VN')}</p>
                <p><span className="font-medium">Số tiền:</span> {selectedBooking.totalPrice.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Lý do hủy</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Loại:</span> {reasonLabels[formData.reasonCategory]}</p>
                <p><span className="font-medium">Chi tiết:</span> {formData.reason}</p>
                {formData.additionalNotes && (
                  <p><span className="font-medium">Ghi chú:</span> {formData.additionalNotes}</p>
                )}
              </div>
            </div>

            {(formData.isMedicalEmergency || formData.isWeatherRelated || formData.isForceMajeure) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Trường hợp đặc biệt</h4>
                <div className="text-sm text-gray-600">
                  {formData.isMedicalEmergency && <p>• Khẩn cấp y tế</p>}
                  {formData.isWeatherRelated && <p>• Liên quan đến thời tiết</p>}
                  {formData.isForceMajeure && <p>• Bất khả kháng</p>}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Hoàn tiền ước tính</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Số tiền hoàn:</span> 
                  <span className="text-green-600 font-semibold ml-1">
                    {evaluation.finalRefundAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  (Sau khi trừ phí hủy và phí xử lý)
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preferred Refund Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phương thức hoàn tiền
        </label>
        <select
          value={formData.preferredRefundMethod}
          onChange={(e) => handleInputChange('preferredRefundMethod', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ORIGINAL_PAYMENT_METHOD">Hoàn về phương thức thanh toán gốc</option>
          <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
          <option value="VOUCHER">Voucher sử dụng sau</option>
        </select>
      </div>

      {/* Customer Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú cho admin
        </label>
        <textarea
          value={formData.customerNotes || ''}
          onChange={(e) => handleInputChange('customerNotes', e.target.value)}
          placeholder="Thông tin thêm cho bộ phận xử lý..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Acknowledgments */}
      <div className="space-y-3">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.acknowledgesCancellationPolicy}
            onChange={(e) => handleInputChange('acknowledgesCancellationPolicy', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            required
          />
          <span className="ml-2 text-sm text-gray-700">
            Tôi đã đọc và hiểu <a href="#" className="text-blue-600 hover:underline">chính sách hủy booking</a> của công ty
          </span>
        </label>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.acknowledgesRefundTerms}
            onChange={(e) => handleInputChange('acknowledgesRefundTerms', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            required
          />
          <span className="ml-2 text-sm text-gray-700">
            Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">điều khoản hoàn tiền</a> và thời gian xử lý
          </span>
        </label>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.requestsExpediteProcessing}
            onChange={(e) => handleInputChange('requestsExpediteProcessing', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
          />
          <span className="ml-2 text-sm text-gray-700">
            Yêu cầu xử lý nhanh (áp dụng cho trường hợp khẩn cấp)
          </span>
        </label>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Yêu cầu hủy booking">
      <div className="px-6 py-4">

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step === 1 ? 'Chọn booking' : step === 2 ? 'Chi tiết hủy' : 'Xác nhận'}
              </span>
              {step < 3 && (
                <div className={`w-20 h-0.5 mx-4 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] mb-6">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isLoading}
              >
                Quay lại
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy bỏ
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceedToNext() || isLoading}
                loading={isLoading}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceedToNext() || isLoading || !evaluation?.isEligible}
                loading={isLoading}
variant="default"
              >
                Gửi yêu cầu hủy
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
