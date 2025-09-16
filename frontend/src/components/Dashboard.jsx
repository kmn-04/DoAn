import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'CUSTOMER':
        return 'Khách hàng';
      case 'USER':
        return 'Người dùng';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#e74c3c';
      case 'CUSTOMER':
        return '#f39c12';
      case 'USER':
        return '#27ae60';
      default:
        return '#666';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Tourism Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Xin chào, {user.fullName}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Thông tin tài khoản</h2>
          
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>ID:</strong> {user.userId}
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Tên đăng nhập:</strong> {user.username}
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Họ tên:</strong> {user.fullName}
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Quyền:</strong>{' '}
              <span style={{
                color: getRoleColor(user.role),
                fontWeight: 'bold'
              }}>
                {getRoleText(user.role)}
              </span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Token:</strong> {user.accessToken ? 'Có' : 'Không'}
            </div>
          </div>

          {/* Role-specific content */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: '#333' }}>Chức năng theo quyền</h3>
            {user.role === 'ADMIN' && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: '4px',
                color: '#e74c3c'
              }}>
                <strong>Quyền Quản trị viên:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                  <li>Quản lý người dùng</li>
                  <li>Quản lý tour du lịch</li>
                  <li>Quản lý đặt tour</li>
                  <li>Xem báo cáo thống kê</li>
                </ul>
                <div style={{ marginTop: '1rem' }}>
                  <button
                    onClick={() => navigate('/users')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    Quản lý Người dùng
                  </button>
                </div>
              </div>
            )}
            {user.role === 'CUSTOMER' && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fffbf0',
                border: '1px solid #fed7aa',
                borderRadius: '4px',
                color: '#f39c12'
              }}>
                <strong>Quyền Khách hàng:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                  <li>Xem danh sách tour</li>
                  <li>Đặt tour du lịch</li>
                  <li>Xem lịch sử đặt tour</li>
                  <li>Đánh giá tour</li>
                </ul>
              </div>
            )}
            {user.role === 'USER' && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fff4',
                border: '1px solid #c6f5d4',
                borderRadius: '4px',
                color: '#27ae60'
              }}>
                <strong>Quyền Người dùng:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                  <li>Xem danh sách tour</li>
                  <li>Xem thông tin chi tiết tour</li>
                  <li>Tìm kiếm tour</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
