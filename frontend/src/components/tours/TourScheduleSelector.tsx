import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export interface TourSchedule {
  id: number;
  tourId: number;
  departureDate: string;
  returnDate: string;
  availableSeats: number;
  bookedSeats: number;
  adultPrice: number;
  childPrice: number;
  infantPrice?: number;
  status: string; // 'AVAILABLE', 'FULL', 'CANCELLED', etc.
  note?: string;
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'vi' ? vi : enUS;
  const [showAll, setShowAll] = useState(false);

  // Filter and sort schedules
  const availableSchedules = schedules
    .filter(schedule => {
      // Only show Available schedules that haven't started yet
      if (schedule.status !== 'AVAILABLE') return false;
      const startDate = parseISO(schedule.departureDate);
      const threeDaysFromNow = addDays(new Date(), 3);
      return isBefore(threeDaysFromNow, startDate); // Must be at least 3 days in advance
    })
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

  const displayedSchedules = showAll ? availableSchedules : availableSchedules.slice(0, 6);

  const formatScheduleDate = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (format(start, 'MM/yyyy', { locale }) === format(end, 'MM/yyyy', { locale })) {
      // Same month
      return `${format(start, 'dd', { locale })} - ${format(end, 'dd/MM/yyyy', { locale })}`;
    } else {
      // Different months
      return `${format(start, 'dd/MM', { locale })} - ${format(end, 'dd/MM/yyyy', { locale })}`;
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
    if (ratio > 0.5) return t('tours.scheduleSelector.availability.plenty');
    if (ratio > 0.2) return t('tours.scheduleSelector.availability.limited');
    return t('tours.scheduleSelector.availability.almostFull');
  };

  if (availableSchedules.length === 0) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
        <CalendarIcon className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('tours.scheduleSelector.empty.title')}
        </h3>
        <p className="text-gray-600">
          {t('tours.scheduleSelector.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
        {t('tours.scheduleSelector.title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedSchedules.map((schedule) => {
          const isSelected = schedule.id === selectedScheduleId;
          const maxSeats = schedule.availableSeats + schedule.bookedSeats;
          const priceDiff = schedule.adultPrice - basePrice;
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
                  {t('tours.scheduleSelector.departureLabel')}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatScheduleDate(schedule.departureDate, schedule.returnDate)}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm">
                  <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span className={`font-semibold ${getAvailabilityColor(schedule.availableSeats, maxSeats)}`}>
                    {getAvailabilityText(schedule.availableSeats, maxSeats)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {t('tours.scheduleSelector.availability.seats', { available: schedule.availableSeats, total: maxSeats })}
                </span>
              </div>

              {/* Price difference */}
              {hasPriceDiff && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-sm">
                    {priceDiff > 0 ? (
                      <span className="text-orange-600">
                        {`+${priceDiff.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}₫`}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        {`${priceDiff.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}₫`}
                      </span>
                    )}
                    <span className="text-gray-500 ml-1">{t('tours.scheduleSelector.priceDiffNote')}</span>
                  </div>
                </div>
              )}

              {/* Total price */}
              <div className="mt-2">
                <span className="text-xs text-gray-500">{t('tours.scheduleSelector.priceLabel')} </span>
                <span className="text-lg font-bold text-blue-600">
                  {`${schedule.adultPrice.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}₫`}
                </span>
                <span className="text-sm text-gray-500">{t('tours.scheduleSelector.perPerson')}</span>
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
            {showAll
              ? t('tours.scheduleSelector.showLess')
              : t('tours.scheduleSelector.showMore', { count: availableSchedules.length - 6 })}
          </button>
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          {t('tours.scheduleSelector.note')}
        </p>
      </div>
    </div>
  );
};

export default TourScheduleSelector;
