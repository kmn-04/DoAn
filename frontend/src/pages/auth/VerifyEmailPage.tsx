import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../components/ui';

const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verifyEmail.invalidToken'));
      return;
    }

    // Only verify once
    let didCancel = false;
    
    const verify = async () => {
      if (didCancel) return;
      await verifyEmail();
    };

    verify();

    return () => {
      didCancel = true;
    };
  }, [token]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [status, countdown, navigate]);

  const verifyEmail = async () => {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      
      // Backend trả về ApiResponse với field 'success'
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.data || response.data.message || t('auth.verifyEmail.success'));
      } else {
        setStatus('error');
        setMessage(response.data.error || response.data.message || t('auth.verifyEmail.error'));
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        t('auth.verifyEmail.error')
      );
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
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-8">
        <div className="flex justify-center animate-fade-in">
          <div className="text-white p-3 rounded-none" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
          <CardContent className="py-10 px-8">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                  <ArrowPathIcon className="h-16 w-16 text-white animate-spin" />
                </div>
                <h2 className="text-3xl font-normal text-gray-900 mb-2 tracking-tight">
                  {t('auth.verifyEmail.loading')}
                </h2>
                <p className="text-gray-600 font-normal">
                  {t('auth.verifyEmail.loadingMessage')}
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-6 bg-green-100">
                  <CheckCircleIcon className="h-20 w-20 text-green-600 mx-auto" />
                </div>
                <h2 className="text-3xl font-normal text-gray-900 mb-3 tracking-tight">
                  {t('auth.verifyEmail.success')}
                </h2>
                <p className="text-gray-600 mb-6 font-normal">
                  {message}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-none p-4 mb-6">
                  <p className="text-green-800 text-sm font-normal">
                    {t('auth.verifyEmail.redirectMessage')}{' '}
                    <span className="font-bold text-lg" style={{ color: '#D4AF37' }}>{countdown}</span> {t('auth.verifyEmail.seconds')}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block w-full text-white py-3 px-6 rounded-none font-normal hover:opacity-90 transition-all shadow-md"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  {t('auth.verifyEmail.loginNow')}
                </Link>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-6 bg-red-100">
                  <XCircleIcon className="h-20 w-20 text-red-600 mx-auto" />
                </div>
                <h2 className="text-3xl font-normal text-gray-900 mb-3 tracking-tight">
                  {t('auth.verifyEmail.error')}
                </h2>
                <p className="text-gray-600 mb-6 font-normal">
                  {message}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-none p-4 mb-6">
                  <p className="text-red-800 text-sm font-normal">
                    {t('auth.verifyEmail.expiredLink')}
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/auth/resend-verification"
                    className="block w-full text-white py-3 px-6 rounded-none font-normal hover:opacity-90 transition-all shadow-md"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    {t('auth.verifyEmail.resendVerification')}
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block w-full bg-stone-200 text-gray-800 py-3 px-6 rounded-none font-normal hover:bg-stone-300 transition-colors"
                  >
                    {t('auth.verifyEmail.registerAgain')}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="font-normal hover:opacity-80 transition-opacity"
            style={{ color: '#D4AF37' }}
          >
            {t('auth.verifyEmail.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

