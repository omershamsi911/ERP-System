import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {AppProvider} from './contexts/AppContext';
import {Layout} from './components/shared/Layout';
import {DashboardPage} from "./pages/Dashboardpage";
import {StudentsPage} from "./pages/Studentspage";
import {StudentPage} from "./pages/Studentpage";
import {FeesPage} from "./pages/FeesPage";
import {AttendancePage} from './pages/AttendancePage';
import {ReportsPage} from './pages/ReportsPage';
import {AcademicCalenderPage} from "./pages/AcademicCalenderPage"
import {SettingsPage} from "./pages/SettingsPage";
import {UsersPage} from "./pages/UsersPage";
import {NotFoundPage} from "./pages/NotFoundPage";
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* // <Route path="/signup" element={<SignupPage />} /> */}
            {/* // <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
            {/* // <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
            
            {/* Protected Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              <Route path="students">
                <Route index element={<StudentsPage />} />
                {/* <Route path="new" element={<NewStudentPage />} /> */}
                <Route path=":id" element={<StudentPage />} />
                {/* <Route path="edit/:id" element={<EditStudentPage />} /> */}
              </Route>
              
              <Route path="fees" element={<FeesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="academic" element={<AcademicCalenderPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;