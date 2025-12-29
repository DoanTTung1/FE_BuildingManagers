import React from 'react';
// Lưu ý: Đổi tên từ 'Router' thành 'BrowserRouter' để chuẩn hóa
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        // 1. BrowserRouter phải là bọc ngoài cùng nhất
        <BrowserRouter>
            {/* 2. AuthProvider nằm trong Router để sử dụng được useNavigate() */}
            <AuthProvider>
                <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />

                    <main style={{ paddingTop: '100px', flex: 1, backgroundColor: '#f8fafd' }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/search" element={<BuildingSearch />} />
                            <Route path="/building/:id" element={<BuildingDetail />} />
                            <Route path="/post-building" element={<CreateBuilding />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<BuildingManager />} />
                                <Route path="buildings" element={<BuildingManager />} />
                                <Route path="users" element={<UserManager />} />
                            </Route>
                        </Routes>
                    </main>

                    <Footer />

                    {/* Modal hiển thị toàn cục */}
                    <AuthModal />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}
export default App;