import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import layout components
import { Layout } from './components/layout';
import { ToastContainer } from './components/ui';
import { ProtectedRoute } from './components/auth';
import AppInitializer from './components/AppInitializer';

// Import pages
import LandingPage from './pages/LandingPage';
import ToursListingPage from './pages/ToursListingPage';
import TourDetailPage from './pages/TourDetailPage';
import PartnersListingPage from './pages/PartnersListingPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import BookingCheckoutPage from './pages/BookingCheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ComponentDemo from './pages/ComponentDemo';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import BookingHistoryPage from './pages/dashboard/BookingHistoryPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import WishlistPage from './pages/dashboard/WishlistPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <Router>
          <Routes>
          {/* Public routes with main layout */}
          <Route path="/" element={
            <Layout>
              <LandingPage />
            </Layout>
          } />
          
          <Route path="/tours" element={
            <Layout>
              <ToursListingPage />
            </Layout>
          } />
          
          <Route path="/tours/:slug" element={
            <Layout>
              <TourDetailPage />
            </Layout>
          } />

          <Route path="/partners" element={
            <Layout>
              <PartnersListingPage />
            </Layout>
          } />
          
          <Route path="/partners/:slug" element={
            <Layout>
              <PartnerDetailPage />
            </Layout>
          } />

          {/* Booking routes - Protected */}
          <Route path="/booking/checkout" element={
            <ProtectedRoute>
              <BookingCheckoutPage />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/confirmation/:bookingId" element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <Layout>
              <div className="min-h-screen bg-gray-50">
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-900">ℹ️ Về Chúng Tôi</h1>
                  <p className="text-gray-600 mt-4">Đang xây dựng...</p>
                </div>
              </div>
            </Layout>
          } />

          <Route path="/contact" element={
            <Layout>
              <div className="min-h-screen bg-gray-50">
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-900">📞 Liên Hệ</h1>
                  <p className="text-gray-600 mt-4">Đang xây dựng...</p>
                </div>
              </div>
            </Layout>
          } />

          <Route path="/demo" element={
            <Layout>
              <ComponentDemo />
            </Layout>
          } />

          {/* User account routes - Protected with public layout */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/bookings" element={
            <ProtectedRoute>
              <Layout>
                <BookingHistoryPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Layout>
                <WishlistPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <div className="min-h-screen bg-gray-50">
                  <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-gray-900">⚙️ Admin Panel</h1>
                    <p className="text-gray-600 mt-4">Chỉ admin mới thấy được!</p>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Auth routes without main layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 404 fallback */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen bg-gray-50">
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-4">Trang không tìm thấy</p>
                </div>
              </div>
            </Layout>
          } />
          </Routes>

          {/* Toast notifications */}
          <ToastContainer />
        </Router>
      </AppInitializer>
    </QueryClientProvider>
  );
}

export default App;