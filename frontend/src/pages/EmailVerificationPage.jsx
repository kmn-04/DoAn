import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/pages/EmailVerificationPage.css';

const EmailVerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Lấy email từ state hoặc local storage
        const emailFromState = location.state?.email;
        const emailFromStorage = localStorage.getItem('verificationEmail');
        
        if (emailFromState) {
            setEmail(emailFromState);
            localStorage.setItem('verificationEmail', emailFromState);
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            // Nếu không có email, redirect về register
            navigate('/register');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        // Countdown timer
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!verificationCode.trim() || verificationCode.length !== 6) {
            setMessage('Vui lòng nhập đầy đủ 6 chữ số');
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await authService.verifyEmail(email, verificationCode);
            
            if (response.verified) {
                setMessage('Email đã được xác minh thành công! Đang chuyển tới trang đăng nhập...');
                setIsError(false);
                
                // Xóa email khỏi localStorage
                localStorage.removeItem('verificationEmail');
                
                // Chuyển về trang login sau 2 giây
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Email đã được xác minh! Bạn có thể đăng nhập ngay bây giờ.',
                            email: email
                        } 
                    });
                }, 2000);
            } else {
                setMessage(response.message || 'Mã xác minh không đúng');
                setIsError(true);
            }
        } catch (error) {
            console.error('Verification error:', error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác minh');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (cooldown > 0) return;

        setIsResending(true);
        setMessage('');
        setIsError(false);

        try {
            await authService.resendVerification(email);
            setMessage('Mã xác minh mới đã được gửi tới email của bạn');
            setIsError(false);
            setCooldown(60); // 60 seconds cooldown
        } catch (error) {
            console.error('Resend error:', error);
            setMessage(error.response?.data?.message || 'Không thể gửi lại mã xác minh');
            setIsError(true);
        } finally {
            setIsResending(false);
        }
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
        if (value.length <= 6) {
            setVerificationCode(value);
        }
    };

    const maskEmail = (email) => {
        if (!email) return '';
        const [username, domain] = email.split('@');
        const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
        return `${maskedUsername}@${domain}`;
    };

    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="verification-header">
                    <div className="verification-icon">
                        <span>📧</span>
                    </div>
                    <h1 className="verification-title">Xác minh email của bạn</h1>
                    <p className="verification-subtitle">
                        Chúng tôi đã gửi mã xác minh 6 chữ số tới email
                    </p>
                    <p className="verification-email">{maskEmail(email)}</p>
                </div>

                <form onSubmit={handleSubmit} className="verification-form">
                    <div className="input-group">
                        <label htmlFor="verificationCode" className="input-label">
                            Mã xác minh
                        </label>
                        <input
                            type="text"
                            id="verificationCode"
                            value={verificationCode}
                            onChange={handleCodeChange}
                            placeholder="000000"
                            className="verification-input"
                            maxLength={6}
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <div className="input-hint">
                            Nhập mã 6 chữ số từ email của bạn
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${isError ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || verificationCode.length !== 6}
                        className="verify-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Đang xác minh...
                            </>
                        ) : (
                            'Xác minh email'
                        )}
                    </button>

                    <div className="verification-options">
                        <p className="resend-text">Không nhận được mã?</p>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || cooldown > 0}
                            className="resend-button"
                        >
                            {isResending ? (
                                'Đang gửi...'
                            ) : cooldown > 0 ? (
                                `Gửi lại sau ${cooldown}s`
                            ) : (
                                'Gửi lại mã'
                            )}
                        </button>
                    </div>

                    <div className="verification-footer">
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="back-button"
                        >
                            ← Quay lại đăng ký
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
