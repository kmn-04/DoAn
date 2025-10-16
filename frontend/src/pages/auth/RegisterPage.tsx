import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được quá 50 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .min(10, 'Số điện thoại phải có ít nhất 10 chữ số')
    .max(15, 'Số điện thoại không được quá 15 chữ số')
    .regex(
      /^[0-9+\-\s()]*$/,
      'Số điện thoại chỉ được chứa số và ký tự +, -, (, )'
    )
    .refine(
      (val) => val.replace(/[^0-9]/g, '').length >= 10,
      'Số điện thoại phải có ít nhất 10 chữ số'
    ),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Xác nhận mật khẩu là bắt buộc'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Bạn phải đồng ý với điều khoản dịch vụ'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  }
);

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    
    if (result.success) {
      // Redirect to email verification pending page with email
      navigate('/auth/verification-pending', { 
        replace: true,
        state: { email: data.email }
      });
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
          Tạo tài khoản TourBooking
        </h2>
        <p className="mt-3 text-center text-sm text-gray-300 font-normal animate-fade-in-up opacity-0 delay-200">
          Hoặc{' '}
          <Link
            to="/login"
            className="font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#D4AF37' }}
          >
            đăng nhập với tài khoản có sẵn
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white border border-stone-200 rounded-none shadow-2xl animate-fade-in-up opacity-0 delay-300">
          <CardContent className="py-10 px-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Name Input */}
              <Input
                {...register('name')}
                label="Họ và tên"
                type="text"
                placeholder="Nhập họ và tên của bạn"
                leftIcon={<UserIcon className="h-4 w-4" />}
                error={errors.name?.message}
                disabled={isLoading}
              />

              {/* Email Input */}
              <Input
                {...register('email')}
                label="Email"
                type="email"
                placeholder="Nhập email của bạn"
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                error={errors.email?.message}
                disabled={isLoading}
              />

              {/* Phone Input */}
              <Input
                {...register('phone')}
                label="Số điện thoại"
                type="tel"
                placeholder="Nhập số điện thoại (VD: 0912345678)"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
                error={errors.phone?.message}
                disabled={isLoading}
                required
              />

              {/* Password Input */}
              <div className="relative">
                <Input
                  {...register('password')}
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600">Độ mạnh mật khẩu:</div>
                    <div className="flex space-x-1">
                      <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1 flex-1 rounded ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1 flex-1 rounded ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <Input
                {...register('confirmPassword')}
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                leftIcon={<LockClosedIcon className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                disabled={isLoading}
              />

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('acceptTerms')}
                    id="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded-none focus:ring-0"
                    style={{ accentColor: '#D4AF37' }}
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-terms" className="text-slate-900 font-normal">
                    Tôi đồng ý với{' '}
                    <Link to="/terms" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#D4AF37' }}>
                      Điều khoản dịch vụ
                    </Link>{' '}
                    và{' '}
                    <Link to="/privacy" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#D4AF37' }}>
                      Chính sách bảo mật
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600 font-normal">{errors.acceptTerms.message}</p>
                  )}
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
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-normal">Hoặc đăng ký với</span>
                  </div>
                </div>

                {/* Social Register Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
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
                    Google
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
                    Facebook
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
