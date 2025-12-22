import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../components/ui';

const EmailVerificationPendingPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus('error');
      setResendMessage(t('auth.resendVerification.emailRequired'));
      return;
    }

    setResendStatus('loading');
    setResendMessage('');

    try {
      const response = await apiClient.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
      
      if (response.data.status === 'SUCCESS') {
        setResendStatus('success');
        setResendMessage(response.data.message || t('auth.emailVerificationPending.resendSuccess'));
      } else {
        setResendStatus('error');
        setResendMessage(response.data.message || t('auth.resendVerification.error'));
      }
    } catch (error: any) {
      setResendStatus('error');
      setResendMessage(error.response?.data?.message || t('auth.resendVerification.error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
      </div>

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 mb-8">
        <div className="flex justify-center animate-fade-in">
          <div className="text-white p-3 rounded-none" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
          <CardContent className="py-10 px-8 md:px-12">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <EnvelopeIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-normal text-gray-900 mb-2 tracking-tight">
                {t('auth.emailVerificationPending.title')}
              </h1>
              <p className="text-lg text-gray-600 font-normal">
                {t('auth.emailVerificationPending.subtitle')}
              </p>
            </div>

            {/* Email display */}
            {email && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-none">
                <p className="text-sm text-blue-800 text-center font-normal">
                  {t('auth.emailVerificationPending.emailSent')}
                </p>
                <p className="text-lg font-semibold text-center mt-1" style={{ color: '#D4AF37' }}>
                  {email}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('auth.emailVerificationPending.step1.title')}</h3>
                  <p className="text-sm text-gray-600 font-normal">
                    {t('auth.emailVerificationPending.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('auth.emailVerificationPending.step2.title')}</h3>
                  <p className="text-sm text-gray-600 font-normal">
                    {t('auth.emailVerificationPending.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('auth.emailVerificationPending.step3.title')}</h3>
                  <p className="text-sm text-gray-600 font-normal">
                    {t('auth.emailVerificationPending.step3.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-none flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-normal">
                  <strong>{t('auth.emailVerificationPending.warning')}</strong>
                </p>
              </div>
            </div>

            {/* Resend Status Messages */}
            {resendStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-none flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-800 font-medium">{t('auth.emailVerificationPending.resendSuccess')}</p>
                  <p className="text-sm text-green-700 mt-1 font-normal">{resendMessage}</p>
                </div>
              </div>
            )}

            {resendStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-none flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium">{t('auth.emailVerificationPending.resendError')}</p>
                  <p className="text-sm text-red-700 mt-1 font-normal">{resendMessage}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resendStatus === 'loading' || !email}
                className="w-full flex items-center justify-center gap-2 text-white py-3 px-6 rounded-none font-normal hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
                style={{ background: resendStatus === 'loading' || !email ? '#9ca3af' : 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                {resendStatus === 'loading' ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    {t('auth.emailVerificationPending.resendSending')}
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    {t('auth.emailVerificationPending.resendButton')}
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="block w-full text-center bg-stone-200 text-gray-800 py-3 px-6 rounded-none font-normal hover:bg-stone-300 transition-colors"
              >
                {t('auth.emailVerificationPending.alreadyVerified')}
              </Link>
            </div>

            {/* Help text */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2 font-normal">
                {t('auth.emailVerificationPending.noEmailReceived')}
              </p>
              <ul className="text-sm text-gray-500 space-y-1 font-normal">
                <li>• {t('auth.emailVerificationPending.checkSpam')}</li>
                <li>• {t('auth.emailVerificationPending.checkEmail')}</li>
                <li>• {t('auth.emailVerificationPending.waitMinutes')}</li>
                <li>• {t('auth.emailVerificationPending.tryResend')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="font-normal hover:opacity-80 transition-opacity"
            style={{ color: '#D4AF37' }}
          >
            {t('auth.emailVerificationPending.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;

