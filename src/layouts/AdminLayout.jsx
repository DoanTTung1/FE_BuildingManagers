import React from 'react'; // Bỏ useEffect đi
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { FaBuilding, FaUsers, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ForbiddenPage from '../pages/admin/ForbiddenPage';
import '../styles/Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // 1. LẤY THÔNG TIN QUYỀN NGAY LẬP TỨC
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    // 2. KIỂM TRA QUYỀN
    const isAdmin = roles.some(r => r.includes('ADMIN'));
    const isStaff = roles.some(r => r.includes('STAFF'));
    const isAuthorized = token && (isAdmin || isStaff);

    // ============================================================
    // 3. LOGIC CHẶN CỬA (Render có điều kiện)
    // ============================================================

    // Nếu chưa đăng nhập -> Đá về Login (hoặc trang chủ)
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập nhưng KHÔNG CÓ QUYỀN -> Hiện trang báo lỗi 403
    if (!isAuthorized) {
        return <ForbiddenPage />;
    }

    // ============================================================
    // 4. NẾU CÓ QUYỀN -> Mới render giao diện Admin bên dưới
    // ============================================================

    const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            logout();
            navigate('/');
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <FaChartPie /> <span>Admin Panel</span>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <NavLink to="/admin/buildings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaBuilding /> <span>Quản lý Tòa nhà</span>
                        </NavLink>
                    </li>

                    {/* Menu User chỉ hiện cho Admin */}
                    {isAdmin && (
                        <li>
                            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaUsers /> <span>Quản lý User</span>
                            </NavLink>
                        </li>
                    )}
                </ul>

                <ul className="sidebar-menu" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <li>
                        <NavLink to="/">
                            <FaChartPie /> <span>Về Trang Chủ</span>
                        </NavLink>
                    </li>
                    <li>
                        <a href="#" onClick={handleLogout} className="logout-link">
                            <FaSignOutAlt /> <span>Đăng xuất</span>
                        </a>
                    </li>
                </ul>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;