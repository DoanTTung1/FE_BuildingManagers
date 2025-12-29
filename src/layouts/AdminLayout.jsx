import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUsers, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import context để lấy info user
import '../styles/Admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); // Lấy hàm logout từ context cho đồng bộ

    // KIỂM TRA QUYỀN TRUY CẬP (Route Guard)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');

        // Nếu không có token hoặc không phải ADMIN/STAFF thì đá về trang chủ
        if (!token || (!roles.includes('ADMIN') && roles.includes('STAFF'))) {
            alert("Bạn không có quyền truy cập khu vực này!");
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Admin?")) {
            logout(); // Gọi hàm logout từ Context
            navigate('/');
        }
    };

    return (
        <div className="admin-layout">
            {/* SIDEBAR FIXED */}
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
                    
                    {/* Chỉ ADMIN mới thấy menu Quản lý User */}
                    {JSON.parse(localStorage.getItem('roles') || '[]').includes('ADMIN') && (
                        <li>
                            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaUsers /> <span>Quản lý User</span>
                            </NavLink>
                        </li>
                    )}
                </ul>

                {/* Phần dưới cùng của Sidebar */}
                <ul className="sidebar-menu" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <li>
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                             <FaChartPie /> <span>Về Trang Chủ</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={handleLogout} className="logout-link">
                            <FaSignOutAlt /> <span>Đăng xuất</span>
                        </a>
                    </li>
                </ul>
            </aside>

            {/* PHẦN NỘI DUNG CHÍNH (Sẽ cuộn độc lập) */}
            <main className="admin-content">
                <Outlet /> {/* Nơi hiển thị BuildingManager.js hoặc UserManager.js */}
            </main>
        </div>
    );
};

export default AdminLayout;