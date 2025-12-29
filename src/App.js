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

import './styles/App.css';

// 1. Tạo một Layout dành riêng cho các trang của User (Có Header/Footer)
const UserLayout = () => {
  return (
    <div className="user-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ paddingTop: '100px', flex: 1, backgroundColor: '#f8fafd' }}>
        <Outlet /> {/* Nơi hiển thị các trang con của User */}
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
            {/* --- NHÓM ROUTE NGƯỜI DÙNG (CÓ HEADER/FOOTER) --- */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />
            </Route>

            {/* --- NHÓM ROUTE ADMIN (KHÔNG CÓ HEADER/FOOTER USER) --- */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<BuildingManager />} />
              <Route path="buildings" element={<BuildingManager />} />
              <Route path="users" element={<UserManager />} />
            </Route>
          </Routes>

          {/* Modal vẫn để ngoài để bật lên được ở mọi nơi */}
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;