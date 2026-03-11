import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Tenants from './pages/Tenants'
import Payments from './pages/Payments'
import EMITracker from './pages/EMITracker'
import Reminders from './pages/Reminders'
import Agreements from './pages/Agreements'
import Login from './pages/Login'
import Rooms from './pages/Rooms'
import { PageLoading } from './components/common/LoadingSpinner'
import './App.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoading />

  const isAuthenticated = !!user

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />

      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
      <Route path="/properties" element={isAuthenticated ? <Properties /> : <Navigate to="/login" />} />
      <Route path="/rooms" element={isAuthenticated ? <Rooms /> : <Navigate to="/login" />} />
      <Route path="/tenants" element={isAuthenticated ? <Tenants /> : <Navigate to="/login" />} />
      <Route path="/payments" element={isAuthenticated ? <Payments /> : <Navigate to="/login" />} />
      <Route path="/emi" element={isAuthenticated ? <EMITracker /> : <Navigate to="/login" />} />
      <Route path="/reminders" element={isAuthenticated ? <Reminders /> : <Navigate to="/login" />} />
      <Route path="/agreements" element={isAuthenticated ? <Agreements /> : <Navigate to="/login" />} />

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
