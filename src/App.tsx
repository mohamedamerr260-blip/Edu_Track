import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, UserRole } from './lib/index';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import Behavior from './pages/Behavior';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Gamification from './pages/Gamification';
import Communication from './pages/Communication';
import Settings from './pages/Settings';
import NotFound from './pages/not-found/Index';
import Classroom from './pages/Classroom';

const queryClient = new QueryClient();

// حماية المسارات بناءً على ذاكرة المتصفح (قاعدة البيانات البديلة)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = localStorage.getItem('current_user');

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

// التوجيه التلقائي للـ Dashboard المناسبة حسب نوع الحساب
const DashboardRoute = () => {
  const currentUserString = localStorage.getItem('current_user');

  if (!currentUserString) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const user = JSON.parse(currentUserString);

  switch (user.role) {
    case UserRole.TEACHER:
      return <TeacherDashboard />;
    case UserRole.STUDENT:
      return <StudentDashboard />;
    case UserRole.PARENT:
      return <ParentDashboard />;
    default:
      return <Navigate to={ROUTES.LOGIN} replace />;
  }
};

const App = () => {
  useEffect(() => {
    // ضبط اتجاه الصفحة للغة العربية
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* المسارات العامة */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />

            {/* المسارات المحمية */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.STUDENTS}
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.GRADES}
              element={
                <ProtectedRoute>
                  <Grades />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ATTENDANCE}
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/behavior"
              element={
                <ProtectedRoute>
                  <Behavior />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.REPORTS}
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamification"
              element={
                <ProtectedRoute>
                  <Gamification />
                </ProtectedRoute>
              }
            />
            <Route path="/classroom" element={<Classroom />} />
            <Route
              path="/communication"
              element={
                <ProtectedRoute>
                  <Communication />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* صفحة الخطأ 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;