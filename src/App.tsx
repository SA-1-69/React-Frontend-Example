import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom'
import LoginPage from './page/LoginPage'
import RegisterPage from './page/RegisterPage'
import ProfilePage from './page/ProfilePage'
import UsersPage from './page/UsersPage'
import UserDetailPage from './page/UserDetailPage'
import NotFoundPage from './page/NotFoundPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicOnlyRoute } from './components/PublicOnlyRoute'
import { AppShell } from './components/AppShell'

function HomeRedirect() {
  return <Navigate to="/profile" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
