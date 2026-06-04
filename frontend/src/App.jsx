import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import our core pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard'; // <-- Real Dashboard
import DonationStatus from './pages/DonationStatus'; // <-- Real Status Redirect

// Only Admin remains a placeholder (we will build this next)
const AdminDashboard = () => <div className="p-8 text-center text-slate-600">Admin Dashboard Placeholder</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private User Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/donation-status" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DonationStatus />
            </ProtectedRoute>
          } 
        />

        {/* Private Admin-Only Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;