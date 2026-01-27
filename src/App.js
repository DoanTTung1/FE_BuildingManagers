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

// Common Components
import ChatWidget from './components/common/ChatWidget';

// User Pages
import HomePage from './components/HomePage';
import BuildingSearch from './components/BuildingSearch';
import BuildingDetail from './components/BuildingDetail';
import CreateBuilding from './components/CreateBuilding';
import UserProfile from './pages/UserProfile';
import ConsignmentPage from './pages/Consignment/ConsignmentPage';

// Admin Pages
import BuildingManager from './pages/admin/BuildingManager';
import UserManager from './pages/admin/UserManager';
import LoginPage from './pages/admin/LoginPage';
import CreateStaff from './pages/admin/CreateStaff';
import Dashboard from './pages/admin/Dashboard';
import UpdateBuilding from './pages/admin/UpdateBuilding';
import ConsignmentManager from './pages/admin/ConsignmentManager';
import ContactManager from './pages/admin/ContactManager';

// News Pages
import NewsPage from './pages/news/NewsPage';
import NewsDetail from './pages/news/NewsDetail';

// Contact Page
import ContactPage from './pages/contact/ContactPage';

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

      {/* Chatbot hiện ở mọi trang User */}
      <ChatWidget />

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
            gutter={8} // Khoảng cách giữa các thông báo
            containerStyle={{
              zIndex: 99999, // Đảm bảo luôn nổi trên cùng
            }}
            toastOptions={{
              duration: 5000,
              // Style chung cho cái khung
              style: {
                background: '#fff',
                color: '#1e293b', // Màu chữ xám đậm sang trọng
                padding: '12px 20px',
                borderRadius: '16px', // Bo tròn nhiều hơn nhìn cho mềm
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', // Bóng đổ xịn
                fontSize: '15px',
                fontWeight: '500',
                border: '1px solid #f1f5f9', // Viền mỏng tinh tế
                maxWidth: '500px',
              },
              // Cấu hình riêng cho Success (Thành công)
              success: {
                iconTheme: {
                  primary: '#10b981', // Xanh ngọc lục bảo
                  secondary: '#ecfdf5', // Nền icon nhạt
                },
                style: {
                  borderLeft: '6px solid #10b981', // Viền màu bên trái tạo điểm nhấn
                },
              },
              // Cấu hình riêng cho Error (Lỗi)
              error: {
                iconTheme: {
                  primary: '#ef4444', // Đỏ tươi
                  secondary: '#fef2f2',
                },
                style: {
                  borderLeft: '6px solid #ef4444',
                },
              },
              // Cấu hình cho Loading
              loading: {
                style: {
                  borderLeft: '6px solid #3b82f6',
                },
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

              {/* ROUTE CHO TRANG TIN TỨC */}
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetail />} />

              {/* ROUTE CHO TRANG LIÊN HỆ (User xem) */}
              <Route path="/contact" element={<ContactPage />} />

              {/* ROUTE CHO TRANG KÝ GỬI */}
              <Route path="/ky-gui" element={<ConsignmentPage />} />
            </Route>

            {/* === NHÓM 2: TRANG LOGIN RIÊNG (ADMIN/STAFF) === */}
            <Route path="/login" element={<LoginPage />} />

            {/* === NHÓM 3: QUẢN TRỊ (ADMIN) === */}
            {/* QUAN TRỌNG: Mọi trang Admin phải nằm trong Route này */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="buildings" element={<BuildingManager />} />
              <Route path="building-create" element={<CreateBuilding />} />
              <Route path="building-edit/:id" element={<UpdateBuilding />} />

              <Route path="users" element={<UserManager />} />
              <Route path="users/create" element={<CreateStaff />} />

              <Route path="consignments" element={<ConsignmentManager />} />

              {/* SỬA LẠI: Đưa ContactManager vào trong AdminLayout */}
              <Route path="contacts" element={<ContactManager />} />
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

          {/* Modal đăng nhập/đăng ký */}
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;