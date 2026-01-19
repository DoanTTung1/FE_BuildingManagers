import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context & Modals
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

// Layouts
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import HomePage from './components/HomePage';
import BuildingSearch from './components/BuildingSearch';
import BuildingDetail from './components/BuildingDetail';
import CreateBuilding from './components/CreateBuilding';
import UserProfile from './pages/UserProfile';

// Admin Pages
import BuildingManager from './pages/admin/BuildingManager';
import UserManager from './pages/admin/UserManager';
import LoginPage from './pages/admin/LoginPage';
import CreateStaff from './pages/admin/CreateStaff';
import Dashboard from './pages/admin/Dashboard';
// Styles
import './styles/App.css';

/**
 * Layout dành cho người dùng bình thường
 * Có Header và Footer cố định, nội dung thay đổi ở <Outlet />
 */
const UserLayout = () => {
  return (
    <div className="user-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ paddingTop: '80px', flex: 1, backgroundColor: '#f8fafd' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          {/* Hệ thống thông báo Toast toàn cục */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerStyle={{
              zIndex: 99999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#0f172a',
                color: '#fff',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* === NHÓM 1: GIAO DIỆN NGƯỜI DÙNG (USER) === */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* === NHÓM 2: TRANG LOGIN RIÊNG (ADMIN/STAFF) === */}
            <Route path="/login" element={<LoginPage />} />

            {/* === NHÓM 3: QUẢN TRỊ (ADMIN) === */}
            <Route path="/admin" element={<AdminLayout />}>
              {/* SỬA DÒNG NÀY: Mặc định vào Dashboard */}
              <Route index element={<Dashboard />} />

              {/* Thêm dòng này để truy cập được bằng link /admin/dashboard */}
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="buildings" element={<BuildingManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="users/create" element={<CreateStaff />} />
            </Route>

            {/* === 404 NOT FOUND === */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 style={{ fontSize: '4rem', color: '#0f172a' }}>404</h1>
                <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                <a href="/" style={{ color: '#ef4444', textDecoration: 'underline' }}>Quay lại trang chủ</a>
              </div>
            } />
          </Routes>

          {/* Modal đăng nhập/đăng ký có thể hiện ra ở bất cứ trang nào */}
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;