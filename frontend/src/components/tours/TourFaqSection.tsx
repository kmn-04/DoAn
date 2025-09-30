import React, { useState } from 'react';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export interface TourFaq {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
}

interface TourFaqSectionProps {
  faqs: TourFaq[];
  className?: string;
}

const TourFaqSection: React.FC<TourFaqSectionProps> = ({ faqs, className = '' }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Sort by display order
  const sortedFaqs = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);

  const toggleFaq = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={className}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <QuestionMarkCircleIcon className="h-7 w-7 mr-2 text-blue-600" />
        Câu hỏi thường gặp
      </h3>

      <div className="space-y-3">
        {sortedFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;

          return (
            <div
              key={faq.id}
              className={`
                border rounded-lg overflow-hidden transition-all
                ${isExpanded ? 'border-blue-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              {/* Question */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-5 py-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    {faq.question}
                  </h4>
                </div>
                <ChevronDownIcon
                  className={`
                    h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200
                    ${isExpanded ? 'transform rotate-180' : ''}
                  `}
                />
              </button>

              {/* Answer */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isExpanded ? 'max-h-96' : 'max-h-0'}
                `}
              >
                <div className="px-5 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Bạn có câu hỏi khác?</strong> Hãy liên hệ với chúng tôi qua hotline{' '}
          <a href="tel:1900xxxx" className="font-semibold underline hover:text-blue-900">
            1900 xxxx
          </a>
          {' '}hoặc email{' '}
          <a href="mailto:support@example.com" className="font-semibold underline hover:text-blue-900">
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default TourFaqSection;
