import {Route, BrowserRouter, Routes, Navigate} from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VolunteerDashboard from './pages/VolunteerDashboard' 
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import Moderation from './pages/admin/Moderation'
import Reports from './pages/admin/Reports'

import Layout from './components/Layout'
import Opportunities from './pages/Opportunities'
import SchedulePickup from './pages/SchedulePickup'
import CreateOpportunity from './pages/CreateOpportunity'
import OpportunityDetails from './pages/OpportunityDetails'
import {Toaster} from 'react-hot-toast'
import SchedulePickupPage from './pages/SchedulePickupPage'
import EditOpportunity from './pages/Edit-Opportunity'
import Messages from './pages/Messages'
import OtpVerification from './pages/OtpVerification'
import MyProfile from './pages/MyProfile'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard Switcher - Improved for Robustness
function DashboardRouter() {
  const storedUser = (() => {
    try { 
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null; 
    } catch { return null; }
  })();

  if (!storedUser) return <Navigate to="/login" replace />;

  switch(storedUser.role) {
    case "volunteer": return <VolunteerDashboard />;
    case "admin":     return <AdminDashboard />;
    case "ngo":       return <Dashboard />;
    default:          return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/"                       element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"                  element={<Login/>} />
        <Route path="/register"               element={<Register/>}/>
        <Route path="/verify-register-otp"    element={<OtpVerification />} />

        {/* Protected Routes (Require Login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard"            element={<DashboardRouter />} />
            <Route path="/opportunities"        element={<Opportunities />} />
            <Route path="/opportunity/:id"      element={<OpportunityDetails/>}/>
            <Route path="/messages"             element={<Messages/>} />
            <Route path="/my-profile"           element={<MyProfile/> } />
            <Route path="/notifications"        element={<Notifications />} />

            {/* Volunteer Specific */}
            <Route element={<ProtectedRoute allowedRoles={["volunteer", "admin"]} />}>
              <Route path="/schedule"             element={<SchedulePickup/>}/>
              <Route path="/schedule-page"        element={<SchedulePickupPage />}/>
            </Route>

            {/* NGO Specific */}
            <Route element={<ProtectedRoute allowedRoles={["ngo", "admin"]} />}>
              <Route path="/create-opportunity"   element={<CreateOpportunity/>} />
              <Route path="/edit-opportunity/:id" element={<EditOpportunity />} />
            </Route>

            {/* Admin Exclusive Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/users"          element={<UserManagement />} />
              <Route path="/admin/moderation"     element={<Moderation />} />
              <Route path="/admin/reports"        element={<Reports />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
