import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
// Thêm FaEnvelope cho icon Liên hệ
import {
    FaBuilding, FaUsers, FaSignOutAlt, FaChartPie,
    FaTachometerAlt, FaHome, FaClipboardList, FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ForbiddenPage from '../pages/admin/ForbiddenPage';
import '../styles/Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // 1. LẤY THÔNG TIN QUYỀN
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    // 2. KIỂM TRA QUYỀN
    const isAdmin = roles.some(r => r.includes('ADMIN'));
    const isStaff = roles.some(r => r.includes('STAFF'));
    const isAuthorized = token && (isAdmin || isStaff);

    // ============================================================
    // 3. LOGIC CHẶN CỬA (Render có điều kiện)
    // ============================================================

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        return <ForbiddenPage />;
    }

    // ============================================================
    // 4. GIAO DIỆN ADMIN
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
                {/* Header của Sidebar */}
                <div className="sidebar-brand">
                    <FaChartPie /> <span>Admin System</span>
                </div>

                <ul className="sidebar-menu">
                    {/* --- MỤC TỔNG QUAN --- */}
                    <li>
                        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaTachometerAlt /> <span>Tổng quan</span>
                        </NavLink>
                    </li>

                    {/* --- MỤC QUẢN LÝ --- */}
                    <li>
                        <NavLink to="/admin/buildings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaBuilding /> <span>Quản lý Tòa nhà</span>
                        </NavLink>
                    </li>

                    {/* --- QUẢN LÝ KÝ GỬI --- */}
                    <li>
                        <NavLink to="/admin/consignments" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaClipboardList /> <span>Quản lý Ký gửi</span>
                        </NavLink>
                    </li>

                    {/* --- [MỚI] QUẢN LÝ LIÊN HỆ --- */}
                    <li>
                        <NavLink to="/admin/contacts" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaEnvelope /> <span>Hộp thư Liên hệ</span>
                        </NavLink>
                    </li>

                    {/* --- QUẢN LÝ USER (Chỉ Admin) --- */}
                    {isAdmin && (
                        <li>
                            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaUsers /> <span>Quản lý User</span>
                            </NavLink>
                        </li>
                    )}
                </ul>

                {/* Footer của Sidebar */}
                <ul className="sidebar-menu" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <li>
                        <NavLink to="/">
                            <FaHome /> <span>Về Trang Khách</span>
                        </NavLink>
                    </li>
                    <li>
                        <a href="#" onClick={handleLogout} className="logout-link">
                            <FaSignOutAlt /> <span>Đăng xuất</span>
                        </a>
                    </li>
                </ul>
            </aside>

            {/* Nội dung chính thay đổi dynamic ở đây */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;