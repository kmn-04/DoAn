import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import EmailVerificationPage from '../pages/EmailVerificationPage'
import Dashboard from './Dashboard'
import UserManagement from './UserManagement'
import UserDetail from './UserDetail'
import UserAdd from './UserAdd'
import CategoryManagement from './CategoryManagement'
import CategoryAdd from './CategoryAdd'
import CategoryDetail from './CategoryDetail'
import CategoryEdit from './CategoryEdit'
import PartnerManagement from './PartnerManagement'
import TourManagement from './TourManagement'
import Layout from './Layout'
import authService from '../services/authService'

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa khi app load
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData)
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleSwitchToRegister = () => {
    navigate('/register')
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage 
              onSwitchToRegister={handleSwitchToRegister}
              onLoginSuccess={handleLoginSuccess} 
            />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage 
              onSwitchToLogin={handleSwitchToLogin}
            />
          )
        } 
      />
      <Route 
        path="/verify-email" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <EmailVerificationPage />
          )
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Dashboard onLogout={handleLogout} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/users" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <UserManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/users/add" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <UserAdd />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/users/:id" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <UserDetail />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/categories/add" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CategoryAdd />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/categories/:id/edit" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CategoryEdit />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/categories/:id" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CategoryDetail />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/categories" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CategoryManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/partners" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <PartnerManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/tours" 
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <TourManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Default Route */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
    </Routes>
  )
}

export default AppRouter
