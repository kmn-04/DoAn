import React, { useState } from 'react';
import { CalendarIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isPast, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface TourSchedule {
  id: number;
  tourId: number;
  startDate: string;
  endDate: string;
  availableSeats: number;
  bookedSeats: number;
  maxSeats: number;
  basePrice: number;
  status: 'AVAILABLE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
}

interface TourScheduleSelectorProps {
  schedules: TourSchedule[];
  selectedScheduleId?: number;
  onScheduleSelect: (schedule: TourSchedule) => void;
  basePrice: number;
  className?: string;
}

const TourScheduleSelector: React.FC<TourScheduleSelectorProps> = ({
  schedules,
  selectedScheduleId,
  onScheduleSelect,
  basePrice,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);

  // Filter and sort schedules
  const availableSchedules = schedules
    .filter(schedule => {
      // Only show AVAILABLE schedules that haven't started yet
      if (schedule.status !== 'AVAILABLE') return false;
      const startDate = parseISO(schedule.startDate);
      const threeDaysFromNow = addDays(new Date(), 3);
      return isBefore(threeDaysFromNow, startDate); // Must be at least 3 days in advance
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const displayedSchedules = showAll ? availableSchedules : availableSchedules.slice(0, 6);

  const formatScheduleDate = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (format(start, 'MM/yyyy') === format(end, 'MM/yyyy')) {
      // Same month
      return `${format(start, 'dd', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`;
    } else {
      // Different months
      return `${format(start, 'dd/MM', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`;
    }
  };

  const getAvailabilityColor = (availableSeats: number, maxSeats: number) => {
    const ratio = availableSeats / maxSeats;
    if (ratio > 0.5) return 'text-green-600';
    if (ratio > 0.2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAvailabilityText = (availableSeats: number, maxSeats: number) => {
    const ratio = availableSeats / maxSeats;
    if (ratio > 0.5) return 'Còn nhiều chỗ';
    if (ratio > 0.2) return 'Sắp hết chỗ';
    return 'Chỉ còn ít chỗ';
  };

  if (availableSchedules.length === 0) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
        <CalendarIcon className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Hiện chưa có lịch khởi hành
        </h3>
        <p className="text-gray-600">
          Vui lòng liên hệ với chúng tôi để biết thêm thông tin về lịch khởi hành sắp tới.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
        Chọn lịch khởi hành
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedSchedules.map((schedule) => {
          const isSelected = schedule.id === selectedScheduleId;
          const priceDiff = schedule.basePrice - basePrice;
          const hasPriceDiff = Math.abs(priceDiff) > 0;

          return (
            <button
              key={schedule.id}
              onClick={() => onScheduleSelect(schedule)}
              className={`
                relative text-left p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              )}

              {/* Date */}
              <div className="mb-3">
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Khởi hành
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatScheduleDate(schedule.startDate, schedule.endDate)}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm">
                  <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span className={`font-semibold ${getAvailabilityColor(schedule.availableSeats, schedule.maxSeats)}`}>
                    {getAvailabilityText(schedule.availableSeats, schedule.maxSeats)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {schedule.availableSeats}/{schedule.maxSeats} chỗ
                </span>
              </div>

              {/* Price difference */}
              {hasPriceDiff && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-sm">
                    {priceDiff > 0 ? (
                      <span className="text-orange-600">
                        +{priceDiff.toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className="text-green-600">
                        {priceDiff.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    <span className="text-gray-500 ml-1">(so với giá cơ bản)</span>
                  </div>
                </div>
              )}

              {/* Total price */}
              <div className="mt-2">
                <span className="text-xs text-gray-500">Giá: </span>
                <span className="text-lg font-bold text-blue-600">
                  {schedule.basePrice.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm text-gray-500">/người</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show more button */}
      {availableSchedules.length > 6 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            {showAll ? '↑ Thu gọn' : `↓ Xem thêm ${availableSchedules.length - 6} lịch khác`}
          </button>
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Lưu ý:</strong> Vui lòng đặt tour trước ít nhất 3 ngày so với ngày khởi hành.
          Giá có thể thay đổi tùy theo thời điểm khởi hành.
        </p>
      </div>
    </div>
  );
};

export default TourScheduleSelector;
