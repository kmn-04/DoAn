import React, { useState } from 'react';
import { UserIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

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
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participants,
  onParticipantsChange,
  numAdults,
  numChildren,
  numInfants,
  isInternational = false,
  className = ''
}) => {
  const totalParticipants = numAdults + numChildren + numInfants;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Initialize participants if empty
  React.useEffect(() => {
    if (participants.length === 0 && totalParticipants > 0) {
      const initial: Participant[] = [];
      
      // Add adults
      for (let i = 0; i < numAdults; i++) {
        initial.push({
          fullName: '',
          dateOfBirth: '',
          gender: 'MALE',
          type: 'ADULT',
          nationality: isInternational ? '' : 'Việt Nam'
        });
      }
      
      // Add children
      for (let i = 0; i < numChildren; i++) {
        initial.push({
          fullName: '',
          dateOfBirth: '',
          gender: 'MALE',
          type: 'CHILD',
          nationality: isInternational ? '' : 'Việt Nam'
        });
      }
      
      // Add infants
      for (let i = 0; i < numInfants; i++) {
        initial.push({
          fullName: '',
          dateOfBirth: '',
          gender: 'MALE',
          type: 'INFANT',
          nationality: isInternational ? '' : 'Việt Nam'
        });
      }
      
      onParticipantsChange(initial);
    }
  }, [numAdults, numChildren, numInfants, totalParticipants, participants.length, onParticipantsChange, isInternational]);

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    onParticipantsChange(updated);
  };

  const getTypeLabel = (type: Participant['type'], index: number) => {
    const typeMap = {
      ADULT: 'Người lớn',
      CHILD: 'Trẻ em',
      INFANT: 'Em bé'
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
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
        Thông tin hành khách
      </h3>

      <div className="space-y-4">
        {participants.map((participant, index) => {
          const isExpanded = expandedIndex === index;
          const isComplete = isParticipantComplete(participant);

          return (
            <div
              key={index}
              className={`
                border-2 rounded-lg overflow-hidden transition-all
                ${isExpanded ? 'border-blue-400' : 'border-gray-200'}
                ${isComplete && !isExpanded ? 'bg-green-50 border-green-300' : 'bg-white'}
              `}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${participant.type === 'ADULT' ? 'bg-blue-600' : 
                      participant.type === 'CHILD' ? 'bg-purple-600' : 'bg-pink-600'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {getTypeLabel(participant.type, index)}
                    </div>
                    {participant.fullName && (
                      <div className="text-sm text-gray-600">{participant.fullName}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isComplete && !isExpanded && (
                    <span className="text-green-600 text-sm font-medium">✓ Hoàn thành</span>
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
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participant.fullName}
                        onChange={(e) => updateParticipant(index, 'fullName', e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={participant.dateOfBirth}
                        onChange={(e) => updateParticipant(index, 'dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={participant.gender}
                        onChange={(e) => updateParticipant(index, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                    {/* Phone (Adults only) */}
                    {participant.type === 'ADULT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={participant.phone || ''}
                          onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                          placeholder="0901234567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Email (Adults only) */}
                    {participant.type === 'ADULT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={participant.email || ''}
                          onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* ID Number (Domestic) or Passport (International) */}
                    {isInternational ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số hộ chiếu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={participant.passportNumber || ''}
                          onChange={(e) => updateParticipant(index, 'passportNumber', e.target.value)}
                          placeholder="A1234567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CMND/CCCD
                        </label>
                        <input
                          type="text"
                          value={participant.idNumber || ''}
                          onChange={(e) => updateParticipant(index, 'idNumber', e.target.value)}
                          placeholder="001234567890"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Nationality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quốc tịch {isInternational && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={participant.nationality || ''}
                        onChange={(e) => updateParticipant(index, 'nationality', e.target.value)}
                        placeholder="Việt Nam"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={isInternational}
                      />
                    </div>

                    {/* Special Requests */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yêu cầu đặc biệt
                      </label>
                      <textarea
                        value={participant.specialRequests || ''}
                        onChange={(e) => updateParticipant(index, 'specialRequests', e.target.value)}
                        placeholder="Ăn chay, dị ứng, nhu cầu hỗ trợ đặc biệt..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          📋 Tổng số hành khách: <strong>{totalParticipants}</strong> người 
          ({numAdults} người lớn
          {numChildren > 0 && `, ${numChildren} trẻ em`}
          {numInfants > 0 && `, ${numInfants} em bé`})
        </p>
      </div>
    </div>
  );
};

export default ParticipantForm;
