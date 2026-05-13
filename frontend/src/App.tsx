import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import EmployeeListPage from './pages/employee/EmployeeListPage';
import SchedulePage from './pages/schedule/SchedulePage';
import DepartmentSchedulePage from './pages/schedule/DepartmentSchedulePage';
import CalendarPage from './pages/schedule/CalendarPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminMasterPage from './pages/admin/AdminMasterPage';
import ToastProvider from './components/shared/ToastProvider';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/schedules/department" replace /> : <LoginPage />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/schedules" element={<SchedulePage />} />
            <Route path="/schedules/calendar" element={<CalendarPage />} />
            <Route path="/schedules/department" element={<DepartmentSchedulePage />} />
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/admin/master" element={<AdminMasterPage />} />
            <Route path="/" element={<Navigate to="/schedules/department" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/schedules/department" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
