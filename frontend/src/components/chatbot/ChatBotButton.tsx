import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatBot from './ChatBot';

const ChatBotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all duration-300 hover:scale-110 z-50 rounded-none flex items-center justify-center group"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7" />
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse"></span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-none">
            Chat với AI trợ lý
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && <ChatBot onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatBotButton;

