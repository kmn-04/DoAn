import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { ENV } from '../../config/environment';
import { useTranslation } from 'react-i18next';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const loginSchema = useMemo(() => z.object({
    email: z
      .string()
      .min(1, t('authErrors.emailRequired'))
      .email(t('authErrors.emailInvalid')),
    password: z
      .string()
      .min(1, t('authErrors.passwordRequired'))
      .min(6, t('authErrors.passwordMin')),
    rememberMe: z.boolean().optional(),
  }), [t]);
  
  // Get redirect path from location state
  const from =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      // Redirect admin to /admin, others to /dashboard or 'from' page
      const isAdmin = result.user?.role?.name?.toUpperCase() === 'ADMIN';
      const redirectPath = isAdmin ? '/admin' : (from !== '/login' && from !== '/' ? from : '/dashboard');
      navigate(redirectPath, { replace: true });
    }
    // Error handling is done in the useAuth hook
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center animate-fade-in">
          <div className="text-white p-3 rounded-none" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h2 className="mt-8 text-center text-4xl font-normal text-white tracking-tight animate-fade-in-up opacity-0 delay-100">
          {t('auth.loginTitle')}
        </h2>
        <p className="mt-3 text-center text-sm text-gray-300 font-normal animate-fade-in-up opacity-0 delay-200">
          {t('auth.loginSubtitle')}{' '}
          <Link
            to="/register"
            className="font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#D4AF37' }}
          >
            {t('auth.createAccountLink')}
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
          <CardContent className="py-10 px-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <Input
                {...register('email')}
                label={t('auth.email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                error={errors.email?.message}
                disabled={isLoading}
              />

              {/* Password Input */}
              <div className="relative">
                <Input
                  {...register('password')}
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  leftIcon={<LockClosedIcon className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={errors.password?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded-none focus:ring-0"
                    style={{ accentColor: '#D4AF37' }}
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 font-normal">
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#D4AF37' }}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-white rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? t('auth.loggingIn') : t('auth.login')}
              </Button>

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-normal">{t('auth.loginWith')}</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => {
                      // Redirect to backend OAuth2 endpoint
                      const apiBaseUrl = ENV.API_BASE_URL.replace('/api', '');
                      window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
                    }}
                    className="w-full border-2 border-stone-300 hover:border-slate-900 rounded-none transition-all duration-300"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t('auth.loginWithGoogle')}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="w-full border-2 border-stone-300 hover:border-slate-900 rounded-none transition-all duration-300"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    {t('auth.loginWithFacebook')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-300 font-normal animate-fade-in opacity-0 delay-400">
          <p>
            {t('auth.termsAgreement')}{' '}
            <Link to="/terms" className="hover:opacity-80 transition-opacity" style={{ color: '#D4AF37' }}>
              {t('auth.termsOfService')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link to="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: '#D4AF37' }}>
              {t('auth.privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
