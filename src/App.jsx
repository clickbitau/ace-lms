import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LmsProvider } from './context/LmsContext';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';
import CourseAuthoring from './pages/admin/CourseAuthoring';
import EnrollmentRecords from './pages/admin/EnrollmentRecords';
import PaymentRecords from './pages/admin/PaymentRecords';
import CertificateRegistry from './pages/admin/CertificateRegistry';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import InteractiveVideoStudio from './pages/admin/InteractiveVideoStudio';
import StudentDashboard from './pages/student/StudentDashboard';
import CoursePlayer from './pages/student/CoursePlayer';
import MyCertificates from './pages/student/MyCertificates';
import StudentProfile from './pages/student/StudentProfile';
import PaymentHistory from './pages/student/PaymentHistory';
import CourseCatalog from './pages/public/CourseCatalog';
import CourseDetail from './pages/public/CourseDetail';
import Checkout from './pages/public/Checkout';
import CertificateVerification from './pages/public/CertificateVerification';
import WorkflowHub from './pages/public/WorkflowHub';
import './index.css';

export default function App() {
  return (
    <LmsProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="courses/:courseId/author" element={<CourseAuthoring />} />
            <Route path="video-studio" element={<InteractiveVideoStudio />} />
            <Route path="enrollments" element={<EnrollmentRecords />} />
            <Route path="payments" element={<PaymentRecords />} />
            <Route path="certificates" element={<CertificateRegistry />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="workflow" element={<WorkflowHub />} />
            {/* Redirect removed admin routes */}
            <Route path="assignments" element={<Navigate to="/admin" replace />} />
            <Route path="discussions" element={<Navigate to="/admin" replace />} />
            <Route path="media" element={<Navigate to="/admin" replace />} />
            <Route path="reviews" element={<Navigate to="/admin" replace />} />
            <Route path="coupons" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="workflow" element={<WorkflowHub />} />
            {/* Redirect removed student routes */}
            <Route path="assignments" element={<Navigate to="/student" replace />} />
          </Route>

          {/* Learning Player (full-screen layout) */}
          <Route path="/student/learn/:courseId" element={<CoursePlayer />} />

          {/* Public routes */}
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/verify/:code" element={<CertificateVerification />} />
          <Route path="/workflow" element={<WorkflowHub />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </LmsProvider>
  );
}
