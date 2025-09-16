import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import socialAuthService from '../services/socialAuthService';
import '../styles/pages/RegisterPage.css';

const RegisterPage = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'USER',
    agreeTerms: false,
    subscribeNewsletter: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, agreeTerms, subscribeNewsletter, ...registerData } = formData;
      // Tự động tạo username từ email
      const username = formData.email.split('@')[0] + '_' + Date.now();
      const finalData = { ...registerData, username };
      const response = await authService.register(finalData);
      
      // Kiểm tra xem có cần email verification không
      if (response.requiresVerification === 'true') {
        setSuccess('Đăng ký thành công! Chuyển đến trang xác minh email...');
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { 
              email: response.email,
              message: response.message 
            } 
          });
        }, 2000);
      } else {
        setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    setLoading(true);
    setError('');

    try {
      let socialData;
      
      // Real social registration
      if (provider === 'google') {
        socialData = await socialAuthService.signInWithGoogle();
      } else if (provider === 'facebook') {
        // Facebook still in demo mode (you can setup later)
        socialData = await socialAuthService.demoSocialLogin(provider);
      } else {
        throw new Error('Unsupported provider');
      }

      // Send social data to backend for registration/authentication
      const response = await authService.socialLogin(socialData);
      
      setSuccess('Đăng ký thành công! Chuyển đến dashboard...');
      
      // Redirect to dashboard instead of login page for social registration
      setTimeout(() => {
        window.location.reload(); // This will trigger authentication check
      }, 2000);
      
    } catch (err) {
      console.error('Social register error:', err);
      setError(err.message || `Có lỗi xảy ra khi đăng ký bằng ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Một tài khoản, vạn trải nghiệm đang chờ!</h1>
          <p className="register-subtitle">
            Tạo tài khoản để lưu lại những tour yêu thích, nhận ưu đãi độc quyền và quản lý booking dễ dàng hơn bao giờ hết.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input password-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-input password-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              Tôi đồng ý với <a href="#" className="link"> Điều khoản dịch vụ </a> và <a href="#" className="link"> Chính sách bảo mật </a>
            </label>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Đang tạo tài khoản...' : 'Bắt đầu khám phá'}
          </button>
        </form>

        <div className="social-login">
          <div className="social-divider">--- Hoặc đăng ký nhanh với ---</div>
          <div className="social-buttons">
            <button 
              className="social-button google"
              onClick={() => handleSocialRegister('google')}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              className="social-button facebook"
              onClick={() => handleSocialRegister('facebook')}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="auth-switch">
          Đã là thành viên?{' '}
          <span className="auth-switch-link" onClick={onSwitchToLogin}>
            Đăng nhập ngay
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
