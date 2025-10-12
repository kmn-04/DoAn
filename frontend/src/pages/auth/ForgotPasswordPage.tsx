import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import authService from '../../services/authService';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      
      setIsSubmitted(true);
      showToast.success(
        'Email đã được gửi!', 
        'Vui lòng kiểm tra email để đặt lại mật khẩu'
      );
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      showToast.error(
        'Có lỗi xảy ra', 
        error.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}></div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-none" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-8 text-center text-4xl font-normal text-white tracking-tight animate-fade-in-up opacity-0 delay-100">
              Email đã được gửi
            </h2>
            <p className="mt-3 text-center text-sm text-gray-300 font-normal animate-fade-in-up opacity-0 delay-200">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
              <span className="font-medium" style={{ color: '#D4AF37' }}>{getValues('email')}</span>
            </p>
          </div>

          <div className="mt-10">
            <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
              <CardContent className="py-10 px-8 text-center">
                <div className="space-y-4">
                  <p className="text-sm text-slate-900 font-normal">
                    Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật khẩu của bạn.
                  </p>
                  <p className="text-xs text-gray-500 font-normal">
                    Không nhận được email? Kiểm tra thư mục spam hoặc thử gửi lại sau 5 phút.
                  </p>
                  
                  <div className="flex flex-col space-y-3 mt-6">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="w-full border-2 border-stone-300 hover:border-slate-900 rounded-none transition-all duration-300"
                    >
                      Gửi lại email
                    </Button>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 rounded-none">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Quay lại đăng nhập
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
          Quên mật khẩu?
        </h2>
        <p className="mt-3 text-center text-sm text-gray-300 font-normal animate-fade-in-up opacity-0 delay-200">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
          <CardContent className="py-10 px-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <Input
                {...register('email')}
                label="Email"
                type="email"
                placeholder="Nhập email của bạn"
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                error={errors.email?.message}
                disabled={isLoading}
                autoFocus
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-white rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#D4AF37' }}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center animate-fade-in opacity-0 delay-400">
          <p className="text-xs text-gray-300 font-normal">
            Bạn nhớ mật khẩu rồi?{' '}
            <Link to="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#D4AF37' }}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
