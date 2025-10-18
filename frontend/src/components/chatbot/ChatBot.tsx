import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatBotProps {
  onClose: () => void;
}

const ChatBot = ({ onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của Tour Booking System. Tôi có thể giúp bạn tìm kiếm tour du lịch, tư vấn về điểm đến, hoặc hỗ trợ đặt tour. Bạn cần tôi giúp gì?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Tạo session khi mount
  useEffect(() => {
    createSession();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = async () => {
    try {
      console.log('🔄 Creating chatbot session...');
      const response = await fetch('http://localhost:5000/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      console.log('✅ Session created:', data.session_id);
    } catch (error) {
      console.error('❌ Error creating session:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Không thể kết nối với chatbot server. Vui lòng kiểm tra:<br/>1. Chatbot server đang chạy (port 5000)<br/>2. Backend Spring Boot đang chạy (port 8080)',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (!sessionId) {
      console.error('❌ No session ID available');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Phiên làm việc chưa sẵn sàng. Vui lòng tải lại trang.',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      console.log('📤 Sending message:', queryText);
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          session_id: sessionId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Tạo message placeholder
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                assistantMessage += parsed.chunk;
                // Update last message
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white border border-stone-300 shadow-2xl flex flex-col z-50 rounded-none">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h3 className="font-semibold text-sm">AI Travel Assistant</h3>
            <p className="text-xs text-stone-300">Trợ lý tư vấn du lịch</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-stone-300 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-stone-200 text-slate-900 markdown-content'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\n/g, '<br/>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-[#D4AF37] hover:underline font-medium">$1 →</a>')
              }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 px-4 py-2.5 text-sm text-slate-900">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-stone-500">Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-stone-300 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-stone-300 text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:border-slate-700 focus:ring-0 rounded-none disabled:bg-stone-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors rounded-none"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-2 text-center">
          AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};

export default ChatBot;

// Add global styles for markdown content
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .markdown-content strong {
      font-weight: 600;
      color: #0f172a;
    }
    .markdown-content ul, .markdown-content ol {
      margin-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .markdown-content li {
      margin-bottom: 0.25rem;
    }
    .markdown-content p {
      margin-bottom: 0.5rem;
    }
  `;
  document.head.appendChild(style);
}

