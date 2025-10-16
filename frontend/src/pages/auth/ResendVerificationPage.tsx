import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ResendVerificationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Vui lòng nhập địa chỉ email.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await apiClient.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
      
      if (response.data.status === 'SUCCESS') {
        setStatus('success');
        setMessage(response.data.message || 'Email xác thực đã được gửi lại!');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Không thể gửi email xác thực.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Có lỗi xảy ra. Vui lòng thử lại sau.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gửi lại email xác thực
            </h2>
            <p className="text-gray-600">
              Nhập email của bạn để nhận lại link xác thực
            </p>
          </div>

          {/* Success Message */}
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Thành công!</p>
                <p className="text-green-700 text-sm mt-1">{message}</p>
                <p className="text-green-600 text-sm mt-2">
                  Vui lòng kiểm tra hộp thư (kể cả thư rác) của bạn.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Lỗi!</p>
                <p className="text-red-700 text-sm mt-1">{message}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                'Gửi email xác thực'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Lưu ý:</strong> Link xác thực có hiệu lực trong 24 giờ.
              Nếu không nhận được email, vui lòng kiểm tra thư mục spam.
            </p>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
            <Link
              to="/auth/register"
              className="block text-gray-600 hover:text-gray-700"
            >
              Chưa có tài khoản? Đăng ký
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;

