import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import layout components (keep these as regular imports)
import { Layout } from './components/layout';
import { ToastContainer, PageLoader, TourPageLoader, BookingPageLoader, DashboardPageLoader, AuthPageLoader } from './components/ui';
import { ProtectedRoute } from './components/auth';
import { ErrorBoundary, PageErrorBoundary } from './components/error';
import { ResponsiveTestTool, ResponsiveDebugInfo } from './components/dev/ResponsiveTestTool';
import { EdgeCaseTestTool } from './components/dev/EdgeCaseTestTool';
import AppInitializer from './components/AppInitializer';

// Lazy import pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const ToursListingPage = React.lazy(() => import('./pages/ToursListingPage'));
const TourDetailPage = React.lazy(() => import('./pages/TourDetailPage'));
const PartnersListingPage = React.lazy(() => import('./pages/PartnersListingPage'));
const PartnerDetailPage = React.lazy(() => import('./pages/PartnerDetailPage'));
const PartnershipPage = React.lazy(() => import('./pages/PartnershipPage'));
const BookingCheckoutPage = React.lazy(() => import('./pages/BookingCheckoutPage'));
const BookingConfirmationPage = React.lazy(() => import('./pages/BookingConfirmationPage'));
const PaymentReturnPage = React.lazy(() => import('./pages/payment/PaymentReturnPage'));
const ComponentDemo = React.lazy(() => import('./pages/ComponentDemo'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

// Dashboard pages - lazy loaded
const BookingHistoryPage = React.lazy(() => import('./pages/dashboard/BookingHistoryPage'));
const ProfilePage = React.lazy(() => import('./pages/dashboard/ProfilePage'));
const WishlistPage = React.lazy(() => import('./pages/dashboard/WishlistPage'));
const NotificationsPage = React.lazy(() => import('./pages/dashboard/NotificationsPage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppInitializer>
          <ResponsiveTestTool>
            <Router>
            <Routes>
            {/* Public routes with main layout */}
            <Route path="/" element={
              <Layout>
                <PageErrorBoundary>
                  <Suspense fallback={<PageLoader message="Đang tải trang chủ..." />}>
                    <LandingPage />
                  </Suspense>
                </PageErrorBoundary>
              </Layout>
            } />
            
            <Route path="/tours" element={
              <Layout>
                <PageErrorBoundary>
                  <Suspense fallback={<TourPageLoader />}>
                    <ToursListingPage />
                  </Suspense>
                </PageErrorBoundary>
              </Layout>
            } />
            
            <Route path="/tours/:slug" element={
              <Layout>
                <PageErrorBoundary>
                  <Suspense fallback={<TourPageLoader />}>
                    <TourDetailPage />
                  </Suspense>
                </PageErrorBoundary>
              </Layout>
            } />

            <Route path="/partners" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Đang tải danh sách đối tác..." />}>
                  <PartnersListingPage />
                </Suspense>
              </Layout>
            } />

            <Route path="/become-partner" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Đang tải thông tin đối tác..." />}>
                  <PartnershipPage />
                </Suspense>
              </Layout>
            } />
            
            <Route path="/partners/:slug" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Đang tải chi tiết đối tác..." />}>
                  <PartnerDetailPage />
                </Suspense>
              </Layout>
            } />

            {/* Booking routes - Protected */}
            <Route path="/booking/checkout" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<BookingPageLoader />}>
                    <BookingCheckoutPage />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            
            <Route path="/booking/confirmation/:bookingId" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<BookingPageLoader />}>
                    <BookingConfirmationPage />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Payment Routes */}
            <Route path="/payment/momo/return" element={
              <PageErrorBoundary>
                <Suspense fallback={<PageLoader message="Đang xử lý kết quả thanh toán..." />}>
                  <PaymentReturnPage />
                </Suspense>
              </PageErrorBoundary>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <BookingHistoryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/about" element={
            <Layout>
              <Suspense fallback={<PageLoader message="Đang tải thông tin về chúng tôi..." />}>
                <AboutPage />
              </Suspense>
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
                <Suspense fallback={<PageLoader message="Đang tải demo..." />}>
                  <ComponentDemo />
                </Suspense>
              </Layout>
            } />

            {/* User account routes - Protected with public layout */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <WishlistPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <NotificationsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <SettingsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div className="min-h-screen bg-gray-50">
                    <div className="text-center py-20">
                      <h1 className="text-4xl font-bold text-gray-900">🔧 Admin Panel</h1>
                      <p className="text-gray-600 mt-4">Đang xây dựng...</p>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Auth routes without main layout */}
            <Route path="/login" element={
              <Suspense fallback={<AuthPageLoader />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<AuthPageLoader />}>
                <RegisterPage />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<AuthPageLoader />}>
                <ForgotPasswordPage />
              </Suspense>
            } />

            {/* 404 fallback */}
            <Route path="*" element={
              <Layout>
                <div className="min-h-screen bg-gray-50">
                  <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-gray-900">404 - Không tìm thấy trang</h1>
                    <p className="text-gray-600 mt-4">Trang bạn tìm kiếm không tồn tại.</p>
      </div>
      </div>
              </Layout>
            } />
          </Routes>

          {/* Toast notifications */}
          <ToastContainer />
          
          {/* Responsive debugging tools (development only) */}
          <EdgeCaseTestTool />
          <ResponsiveDebugInfo />
        </Router>
          </ResponsiveTestTool>
        </AppInitializer>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;