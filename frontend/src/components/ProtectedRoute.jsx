import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Truy cập bị từ chối</h2>
        <p>Bạn cần đăng nhập để truy cập trang này.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Về trang đăng nhập
        </button>
      </div>
    );
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
