import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import layout components (keep these as regular imports)
import { Layout } from './components/layout';
import AdminLayout from './components/layout/AdminLayout';
import { ToastContainer, PageLoader, TourPageLoader, BookingPageLoader, DashboardPageLoader, AuthPageLoader } from './components/ui';
import { ProtectedRoute } from './components/auth';
import { ErrorBoundary, PageErrorBoundary } from './components/error';
import AppInitializer from './components/AppInitializer';
import ScrollToTop from './components/ScrollToTop';

// Lazy import pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const ToursListingPage = React.lazy(() => import('./pages/ToursListingPage'));
const TourDetailPage = React.lazy(() => import('./pages/TourDetailPage'));
const PartnersListingPage = React.lazy(() => import('./pages/PartnersListingPage'));
const PartnerDetailPage = React.lazy(() => import('./pages/PartnerDetailPage'));
const PartnershipPage = React.lazy(() => import('./pages/PartnershipPage'));
const BookingCheckoutPage = React.lazy(() => import('./pages/BookingCheckoutPage'));
const BookingConfirmationPage = React.lazy(() => import('./pages/BookingConfirmationPage'));
// PaymentReturnPage removed - MoMo payment under re-implementation
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));

// Dashboard pages - lazy loaded
const BookingHistoryPage = React.lazy(() => import('./pages/dashboard/BookingHistoryPage'));
const ProfilePage = React.lazy(() => import('./pages/dashboard/ProfilePage'));
const WishlistPage = React.lazy(() => import('./pages/dashboard/WishlistPage'));
const NotificationsPage = React.lazy(() => import('./pages/dashboard/NotificationsPage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));
const MyReviewsPage = React.lazy(() => import('./pages/dashboard/MyReviewsPage'));

// Admin pages - lazy loaded
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTours = React.lazy(() => import('./pages/admin/AdminTours'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminBookings = React.lazy(() => import('./pages/admin/AdminBookings'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminPartners = React.lazy(() => import('./pages/admin/AdminPartners'));
const AdminPromotions = React.lazy(() => import('./pages/admin/AdminPromotions'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminContacts = React.lazy(() => import('./pages/admin/AdminContacts'));
const AdminStatistics = React.lazy(() => import('./pages/admin/AdminStatistics'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));

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
            <Router>
              <ScrollToTop />
            <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Public routes with main layout */}
            {/* Dashboard - Trang chủ */}
            <Route path="/dashboard" element={
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
            
            {/* Payment Routes - MoMo removed, to be re-implemented */}

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
                <Suspense fallback={<PageLoader message="Đang tải trang liên hệ..." />}>
                  <ContactPage />
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

            <Route path="/my-reviews" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <MyReviewsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin routes - Protected with admin layout */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/tours" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminTours />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/categories" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminCategories />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/bookings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminBookings />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/reviews" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminReviews />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminUsers />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/partners" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminPartners />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/promotions" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminPromotions />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/notifications" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminNotifications />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/contacts" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminContacts />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/statistics" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminStatistics />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminSettings />
                  </Suspense>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/banners" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Suspense fallback={<DashboardPageLoader />}>
                    <AdminBanners />
                  </Suspense>
                </AdminLayout>
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
        </Router>
        </AppInitializer>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;