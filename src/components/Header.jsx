import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaPlusCircle, FaSignOutAlt, FaBuilding, FaPhoneAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import Context để lấy User & Modal
import '../styles/HeaderFooter.css';
import logoImg from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin User và hàm xử lý từ AuthContext
    const { user, openModal, logout } = useAuth();

    // Xử lý hiệu ứng cuộn trang
    useEffect(() => {
        const handleScroll = () => {
            // Khi cuộn xuống quá 50px thì đổi giao diện Header
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm kiểm tra link nào đang active để gạch chân
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' ? 'active' : '';
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    // Hàm đăng xuất
    const handleLogout = () => {
        logout(); // Xóa token
        navigate('/'); // Về trang chủ
    };

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">

                {/* --- 1. LOGO --- */}
                <div className="logo-area">
                    <Link to="/" title="Trang chủ">
                        <img src={logoImg} alt="Logo" className="logo-img" />
                    </Link>
                </div>

                {/* --- 2. MENU ĐIỀU HƯỚNG --- */}
                <nav className="navbar">
                    <ul className="nav-list">
                        <li>
                            <Link to="/" className={`nav-link ${isActive('/')}`}>
                                Trang Chủ
                            </Link>
                        </li>
                        <li>
                            <Link to="/search" className={`nav-link ${isActive('/search')}`}>
                                Tòa Nhà
                            </Link>
                        </li>
                        <li>
                            <Link to="/consign" className={`nav-link ${isActive('/consign')}`}>
                                Ký Gửi
                            </Link>
                        </li>
                        <li>
                            <Link to="/news" className={`nav-link ${isActive('/news')}`}>
                                Tin Tức
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
                                Liên Hệ
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* --- 3. KHU VỰC HÀNH ĐỘNG (Nút bấm) --- */}
                <div className="header-actions">

                    {/* Nút Đăng Tin */}
                    <Link to="/post-building" style={{ textDecoration: 'none' }}>
                        <button className="btn-post">
                            <FaPlusCircle /> Đăng tin
                        </button>
                    </Link>

                    {/* Hotline */}
                    <div className="hotline-box">
                        <span className="hotline-label">Hotline 24/7</span>
                        <a href="tel:0345096281" className="hotline-number">
                            0345.096.281
                        </a>
                    </div>

                    {/* Logic hiển thị: Nếu Đã Login -> Hiện Tên & Logout. Chưa Login -> Hiện Nút Đăng Nhập */}
                    {user ? (
                        <div className="user-logged-in">
                            <div className="user-info">
                                <FaUser className="user-icon" />
                                <span className="user-name">{user.userName || user.fullName}</span>
                            </div>
                            <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <button className="btn-login" onClick={openModal}>
                            <FaUser /> <span>Đăng Nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;