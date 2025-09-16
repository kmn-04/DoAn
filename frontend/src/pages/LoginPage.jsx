import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import socialAuthService from '../services/socialAuthService';
import '../styles/pages/LoginPage.css';

const LoginPage = ({ onSwitchToRegister, onLoginSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Hiển thị thông báo từ verification page hoặc register page
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, emailOrPhone: location.state.email }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(
        formData.emailOrPhone,
        formData.password
      );
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      onLoginSuccess(response);
    } catch (err) {
      console.error('Login error:', err);
      
      // Kiểm tra xem có phải lỗi cần email verification không
      if (err.requiresVerification) {
        setError(err.message);
        // Hiển thị nút chuyển tới verification
        setTimeout(() => {
          if (window.confirm('Bạn có muốn chuyển tới trang xác minh email ngay bây giờ?')) {
            navigate('/verify-email', { 
              state: { 
                email: err.email,
                message: 'Vui lòng xác minh email để có thể đăng nhập' 
              } 
            });
          }
        }, 2000);
      } else {
        setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');

    try {
      let socialData;
      
      // Real social login
      if (provider === 'google') {
        socialData = await socialAuthService.signInWithGoogle();
      } else if (provider === 'facebook') {
        // Facebook still in demo mode (you can setup later)
        socialData = await socialAuthService.demoSocialLogin(provider);
      } else {
        throw new Error('Unsupported provider');
      }

      // Send social data to backend for authentication
      const response = await authService.socialLogin(socialData);
      onLoginSuccess(response);
      
    } catch (err) {
      console.error('Social login error:', err);
      setError(err.message || `Có lỗi xảy ra khi đăng nhập bằng ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Chào mừng trở lại, Lữ khách!</h1>
          <p className="login-subtitle">
            Đăng nhập để tiếp tục quản lý những chuyến đi đã lưu và khám phá các điểm đến mới.
          </p>
        </div>

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email hoặc số điện thoại</label>
            <input
              type="text"
              name="emailOrPhone"
              className="form-input"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              placeholder="Nhập email hoặc số điện thoại"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input password-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu"
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

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="forgot-password">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Đang đăng nhập...' : 'Tiếp tục hành trình'}
          </button>
        </form>

        <div className="social-login">
          <div className="social-divider">--- Hoặc đăng nhập với ---</div>
          <div className="social-buttons">
            <button 
              className="social-button google"
              onClick={() => handleSocialLogin('google')}
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
              onClick={() => handleSocialLogin('facebook')}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="auth-switch">
          Người bạn mới?{' '}
          <span className="auth-switch-link" onClick={onSwitchToRegister}>
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
