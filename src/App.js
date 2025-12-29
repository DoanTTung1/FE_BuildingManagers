import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import Provider
import AuthModal from './components/AuthModal';       // Import Modal

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import BuildingSearch from './components/BuildingSearch';
import BuildingDetail from './components/BuildingDetail';
import CreateBuilding from './components/CreateBuilding';
import './styles/App.css';
import AdminLayout from './layouts/AdminLayout';
import BuildingManager from './pages/admin/BuildingManager';
import UserManager from './pages/admin/UserManager';
function App() {
  return (
    <AuthProvider> {/* Bọc toàn bộ App */}
      <Router>
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />

          <main style={{ paddingTop: '100px', flex: 1, backgroundColor: '#f8fafd' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<BuildingSearch />} />
              <Route path="/building/:id" element={<BuildingDetail />} />
              <Route path="/post-building" element={<CreateBuilding />} />

              {/* --- ROUTE CHO ADMIN (Cần xử lý PrivateRoute nếu kỹ hơn) --- */}
              <Route path="/admin" element={<AdminLayout />}>
                {/* Mặc định vào trang tòa nhà */}
                <Route index element={<BuildingManager />} />
                <Route path="buildings" element={<BuildingManager />} />
                <Route path="users" element={<UserManager />} />
              </Route>
            </Routes>
          </main>

          <Footer />

          {/* Modal nằm ngoài Routes để hiển thị đè lên mọi trang */}
          <AuthModal />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;