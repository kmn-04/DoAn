import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number; // Max number of page buttons to show
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages - 2, currentPage + 1);
      
      // Adjust if near the beginning
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 2, 3);
      }
      
      // Adjust if near the end
      if (currentPage >= totalPages - 3) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 1) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in-scale">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2.5 rounded-none border border-stone-300 bg-white text-slate-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-300 hover:scale-105 active:scale-95 hover:border-slate-700 font-normal"
        title="Trang trước"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400 font-normal"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                min-w-[44px] px-4 py-2.5 rounded-none border transition-all duration-300 font-medium tracking-wide
                hover:scale-105 active:scale-95
                ${isActive
                  ? 'text-white border-slate-900 cursor-default shadow-lg'
                  : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50 hover:border-slate-700'
                }
              `}
              style={isActive ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
            >
              {pageNum + 1}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2.5 rounded-none border border-stone-300 bg-white text-slate-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-300 hover:scale-105 active:scale-95 hover:border-slate-700 font-normal"
        title="Trang sau"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
