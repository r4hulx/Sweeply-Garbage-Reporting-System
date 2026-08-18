import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Import all your pages
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CleanerDashboardPage from './pages/CleanerDashboardPage.jsx'
import ReportPage from './pages/ReportPage.jsx' // Make sure this file exists, or remove this line

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />, // Make Login the first thing they see
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
    <ProtectedRoute allowedRole="Citizen">
      <DashboardPage />
    </ProtectedRoute>
  ),
  },
  {
    path: "/cleaner-dashboard",
    element: (
    <ProtectedRoute allowedRole="Cleaner">
      <CleanerDashboardPage />
    </ProtectedRoute>
  ),
  },
  {
    path: "/report",
    element: (
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  ),
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)