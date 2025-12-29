import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUsers, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import '../styles/Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Xóa token (Giả sử bạn lưu ở localStorage)
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <FaChartPie /> Admin Panel
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <NavLink to="/admin/buildings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaBuilding /> Quản lý Tòa nhà
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                            <FaUsers /> Quản lý User
                        </NavLink>
                    </li>
                    <li>
                        <a href="#" onClick={handleLogout}>
                            <FaSignOutAlt /> Đăng xuất
                        </a>
                    </li>
                </ul>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* Nơi hiển thị các trang con */}
            </main>
        </div>
    );
};

export default AdminLayout;