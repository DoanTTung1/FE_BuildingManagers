import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

// ... các import khác giữ nguyên ...
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
import CreateStaff from './pages/admin/CreateStaff';
import './styles/App.css';

// UserLayout giữ nguyên
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
            {/* === NHÓM 1: USER === */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />
            </Route>

            {/* === NHÓM 2: LOGIN === */}
            <Route path="/login" element={<LoginPage />} />

            {/* === NHÓM 3: ADMIN (QUAN TRỌNG) === */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<BuildingManager />} />
              <Route path="buildings" element={<BuildingManager />} />
              <Route path="users" element={<UserManager />} />
              
              {/* --- SỬA Ở ĐÂY: Đưa vào trong và bỏ '/admin/' ở path --- */}
              {/* React Router sẽ tự hiểu đường dẫn đầy đủ là: /admin/staff-create */}
              <Route path="users/create" element={<CreateStaff />} /> 
            </Route>

            {/* === 404 (Luôn để cuối cùng) === */}
            <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>404 Not Found</div>} />
          </Routes>

          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;