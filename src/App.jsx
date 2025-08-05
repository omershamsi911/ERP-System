import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './hooks/useAuth';
import {AppProvider} from './contexts/AppContext';
import {Layout} from './components/shared/Layout';
import {DashboardPage} from "./pages/DashboardPage";
import {StudentsPage} from "./pages/StudentsPage";
import {StudentPage} from "./pages/StudentPage";
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/Attendace';
import {ReportsPage} from './pages/ReportsPage';
import AcademicsPage from './pages/AcademicsPage';
import {SettingsPage} from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import {NotFoundPage} from "./pages/NotFoundPage";
import AddStudentPage from "./pages/AddStudentPage";
import { ViewStudentPage } from "./pages/ViewStudentPage";
import { EditStudentPage } from "./pages/EditStudentPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import {LoginForm} from "./components/auth/LoginForm";
import {SignupForm} from "./components/auth/SignupForm";
import {ProfileSettingsPage} from "./pages/ProfileSettingsPage";
import TeachersPage from './pages/TeachersPage';
import './styles/Report.css';
import { StaffAttendance } from './components/teachers/StaffAttendance';
import CertificationResultsPage from './pages/CertificationResultsPage';



function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="students">
                      <Route index element={<StudentsPage />} />
                      <Route path="add" element={<AddStudentPage />} />
                      <Route path=":id" element={<StudentPage />} />
                      <Route path="view/:id" element={<ViewStudentPage />} />
                      <Route path="edit/:id" element={<EditStudentPage />} />
                    </Route>
                    <Route path="ProfileSettingsPage" element={<ProfileSettingsPage/>}/>
                    <Route path="fees" element={<FeesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="academic" element={<AcademicsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="teachers" element={<TeachersPage />} />
                    <Route path="teachers" element={StaffAttendance} />
                    <Route path="certificates-results" element={<CertificationResultsPage/>}/>
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;