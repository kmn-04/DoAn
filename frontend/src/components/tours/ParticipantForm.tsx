import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserIcon } from '@heroicons/react/24/outline';

export interface Participant {
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  idNumber?: string;
  passportNumber?: string;
  nationality?: string;
  specialRequests?: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

interface ParticipantFormProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  numAdults: number;
  numChildren: number;
  numInfants: number;
  isInternational?: boolean;
  className?: string;
  currentUser?: {
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  };
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participants,
  onParticipantsChange,
  numAdults,
  numChildren,
  numInfants,
  isInternational = false,
  className = '',
  currentUser
}) => {
  const { t } = useTranslation();
  const totalParticipants = numAdults + numChildren + numInfants;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Initialize participants if empty
  React.useEffect(() => {
    if (participants.length === 0 && totalParticipants > 0) {
      const initial: Participant[] = [];
      
      // Add adults
      for (let i = 0; i < numAdults; i++) {
        // Auto-fill first adult with current user info
        if (i === 0 && currentUser) {
          initial.push({
            fullName: currentUser.name || '',
            dateOfBirth: currentUser.dateOfBirth || '',
            gender: currentUser.gender || 'MALE',
            type: 'ADULT',
            nationality: isInternational ? '' : t('booking.checkout.travelerInfo.defaultNationality'),
            email: currentUser.email || '',
            phone: currentUser.phone || ''
          });
        } else {
          initial.push({
            fullName: '',
            dateOfBirth: '',
            gender: 'MALE',
            type: 'ADULT',
            nationality: isInternational ? '' : t('booking.checkout.travelerInfo.defaultNationality')
          });
        }
      }
      
      // Add children
      for (let i = 0; i < numChildren; i++) {
        initial.push({
          fullName: '',
          dateOfBirth: '',
          gender: 'MALE',
          type: 'CHILD',
          nationality: isInternational ? '' : t('booking.checkout.travelerInfo.defaultNationality')
        });
      }
      
      // Add infants
      for (let i = 0; i < numInfants; i++) {
        initial.push({
          fullName: '',
          dateOfBirth: '',
          gender: 'MALE',
          type: 'INFANT',
          nationality: isInternational ? '' : t('booking.checkout.travelerInfo.defaultNationality')
        });
      }
      
      onParticipantsChange(initial);
    }
  }, [numAdults, numChildren, numInfants, totalParticipants, participants.length, onParticipantsChange, isInternational, currentUser, t]);

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    onParticipantsChange(updated);
  };

  const getTypeLabel = (type: Participant['type'], index: number) => {
    const typeMap = {
      ADULT: t('booking.checkout.travelerInfo.participantTypes.adult'),
      CHILD: t('booking.checkout.travelerInfo.participantTypes.child'),
      INFANT: t('booking.checkout.travelerInfo.participantTypes.infant')
    };
    
    // Count position within type
    let count = 1;
    for (let i = 0; i < index; i++) {
      if (participants[i].type === type) count++;
    }
    
    return `${typeMap[type]} ${count}`;
  };

  const isParticipantComplete = (participant: Participant) => {
    const required = participant.fullName && participant.dateOfBirth && participant.gender;
    if (isInternational) {
      return required && participant.passportNumber && participant.nationality;
    }
    return required;
  };

  return (
    <div className={className}>
      <h3 className="text-xl font-normal text-slate-900 mb-6 flex items-center tracking-tight">
        <UserIcon className="h-6 w-6 mr-3" style={{ color: '#D4AF37' }} />
        {t('booking.checkout.travelerInfo.title')}
      </h3>

      <div className="space-y-4">
        {participants.map((participant, index) => {
          const isExpanded = expandedIndex === index;
          const isComplete = isParticipantComplete(participant);

          return (
            <div
              key={index}
              className={`
                border-2 rounded-none overflow-hidden transition-all
                ${isExpanded ? 'border-slate-700' : 'border-stone-200'}
                ${isComplete && !isExpanded ? 'bg-amber-50 border-amber-300' : 'bg-white'}
              `}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`
                      w-10 h-10 rounded-none flex items-center justify-center text-white font-medium
                      ${participant.type === 'ADULT' ? 'bg-slate-900' : 
                        participant.type === 'CHILD' ? 'bg-slate-700' : 'bg-slate-600'}
                    `}
                  >
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-slate-900 tracking-tight">
                      {getTypeLabel(participant.type, index)}
                    </div>
                    {participant.fullName && (
                      <div className="text-sm text-gray-600 font-normal">{participant.fullName}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {isComplete && !isExpanded && (
                    <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>{t('booking.checkout.travelerInfo.completed')}</span>
                  )}
                  <span className="text-gray-400">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Form */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.checkout.travelerInfo.fields.fullName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participant.fullName}
                        onChange={(e) => updateParticipant(index, 'fullName', e.target.value)}
                        placeholder={t('booking.checkout.travelerInfo.placeholders.fullName')}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        required
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.checkout.travelerInfo.fields.dateOfBirth')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={participant.dateOfBirth}
                        onChange={(e) => updateParticipant(index, 'dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.checkout.travelerInfo.fields.gender')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={participant.gender}
                        onChange={(e) => updateParticipant(index, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        required
                      >
                        <option value="MALE">{t('booking.checkout.travelerInfo.genderOptions.male')}</option>
                        <option value="FEMALE">{t('booking.checkout.travelerInfo.genderOptions.female')}</option>
                        <option value="OTHER">{t('booking.checkout.travelerInfo.genderOptions.other')}</option>
                      </select>
                    </div>

                    {/* Phone (Adults only) */}
                    {participant.type === 'ADULT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('booking.checkout.travelerInfo.fields.phone')}
                        </label>
                        <input
                          type="tel"
                          value={participant.phone || ''}
                          onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                          placeholder={t('booking.checkout.travelerInfo.placeholders.phone')}
                          className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        />
                      </div>
                    )}

                    {/* Email (Adults only) */}
                    {participant.type === 'ADULT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('booking.checkout.travelerInfo.fields.email')}
                        </label>
                        <input
                          type="email"
                          value={participant.email || ''}
                          onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                          placeholder={t('booking.checkout.travelerInfo.placeholders.email')}
                          className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        />
                      </div>
                    )}

                    {/* ID Number (Domestic) or Passport (International) */}
                    {isInternational ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('booking.checkout.travelerInfo.fields.passportNumber')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={participant.passportNumber || ''}
                          onChange={(e) => updateParticipant(index, 'passportNumber', e.target.value)}
                          placeholder={t('booking.checkout.travelerInfo.placeholders.passportNumber')}
                          className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('booking.checkout.travelerInfo.fields.idNumber')}
                        </label>
                        <input
                          type="text"
                          value={participant.idNumber || ''}
                          onChange={(e) => updateParticipant(index, 'idNumber', e.target.value)}
                          placeholder={t('booking.checkout.travelerInfo.placeholders.idNumber')}
                          className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        />
                      </div>
                    )}

                    {/* Nationality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.checkout.travelerInfo.fields.nationality')} {isInternational && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={participant.nationality || ''}
                        onChange={(e) => updateParticipant(index, 'nationality', e.target.value)}
                        placeholder={t('booking.checkout.travelerInfo.placeholders.nationality')}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                        required={isInternational}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-stone-50 border border-stone-200 rounded-none p-4">
        <p className="text-sm text-slate-900 font-normal">
          {t('booking.checkout.travelerInfo.summary.title')} <strong className="font-medium">{totalParticipants}</strong> {t('booking.checkout.travelerInfo.summary.people')} 
          ({t('booking.checkout.travelerInfo.summary.adults', { count: numAdults })}
          {numChildren > 0 && `, ${t('booking.checkout.travelerInfo.summary.children', { count: numChildren })}`}
          {numInfants > 0 && `, ${t('booking.checkout.travelerInfo.summary.infants', { count: numInfants })}`})
        </p>
      </div>
    </div>
  );
};

export default ParticipantForm;
