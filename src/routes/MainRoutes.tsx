import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { PublicOnlyRoute } from '../components/PublicOnlyRoute'
import FullLayout from '../layout/FullLayout'
import MiniLayout from '../layout/MiniLayout'
import LoginPage from '../pages/authentication/Login'
import RegisterPage from '../pages/authentication/Register'
import DashboardPage from '../pages/dashboard'
import NotFoundPage from '../pages/not-found'

function HomeRedirect() {
  return <Navigate to="/profile" replace />
}

export function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<MiniLayout />}>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<FullLayout />}>
            <Route path="/profile" element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
