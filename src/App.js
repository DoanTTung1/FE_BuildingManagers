import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import BuildingSearch from './components/BuildingSearch';
import BuildingDetail from './components/BuildingDetail';
import CreateBuilding from './components/CreateBuilding';
import AdminLayout from './layouts/AdminLayout';
import BuildingManager from './pages/admin/BuildingManager';
import UserManager from './pages/admin/UserManager';
import LoginPage from './pages/admin/LoginPage';

import './styles/App.css';

// 1. Layout User (Giữ nguyên)
const UserLayout = () => {
  return (
    <div className="user-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ paddingTop: '100px', flex: 1, backgroundColor: '#f8fafd' }}>
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
          <Routes>
            {/* === NHÓM 1: CÁC TRANG CÔNG KHAI (USER) === */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />
            </Route>

            {/* === NHÓM 2: TRANG LOGIN (ĐỨNG MỘT MÌNH) === */}
            {/* SỬA: Đưa ra ngoài cùng, ngang hàng với User và Admin */}
            <Route path="/login" element={<LoginPage />} />

            {/* === NHÓM 3: KHU VỰC ADMIN (CÓ SIDEBAR) === */}
            <Route path="/admin" element={<AdminLayout />}>
              {/* index: Mặc định vào /admin sẽ hiện BuildingManager */}
              <Route index element={<BuildingManager />} />

              {/* Các đường dẫn con KHÔNG được có dấu / ở đầu */}
              <Route path="buildings" element={<BuildingManager />} />
              <Route path="users" element={<UserManager />} />
            </Route>

            {/* Trang 404 (Nếu cần) */}
            <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>404 Not Found</div>} />

          </Routes>

          {/* Modal vẫn để ngoài để bật lên được ở mọi nơi */}
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;