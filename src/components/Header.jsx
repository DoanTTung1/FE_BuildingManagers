import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaPlusCircle, FaPhoneAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import '../styles/Header.css';

// Import useAuth
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    const { openModal, user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* LOGO */}
                <div className="logo-area" onClick={() => navigate('/')}>
                    <h1 className="logo-text">
                        Elite<span>Homes</span>
                    </h1>
                </div>

                {/* MENU */}
                <nav className="nav-menu">
                    <ul className="nav-list">
                        <li><Link to="/" className={`nav-link ${isActive('/')}`}>Trang Chủ</Link></li>
                        <li><Link to="/search" className={`nav-link ${isActive('/search')}`}>Thuê Văn Phòng</Link></li>
                        <li><Link to="/projects" className={`nav-link ${isActive('/projects')}`}>Dự Án</Link></li>
                        <li><Link to="/news" className={`nav-link ${isActive('/news')}`}>Tin Tức</Link></li>
                        <li><Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Liên Hệ</Link></li>
                    </ul>
                </nav>

                {/* ACTIONS */}
                <div className="header-actions">
                    <div className="hotline-box">
                        <span className="hotline-label">Hotline 24/7</span>
                        <a href="tel:0345096281" className="hotline-number">
                            <FaPhoneAlt size={12} /> 0345.096.281
                        </a>
                    </div>

                    {/* --- KHU VỰC USER / ĐĂNG NHẬP --- */}
                    {user ? (
                        // TRẠNG THÁI: ĐÃ ĐĂNG NHẬP (USER BADGE)
                        <div className="user-badge">
                            <div className="user-info">
                                <span className="hello-lbl">Xin chào,</span>
                                <span className="user-name">{user.fullName || user.userName}</span>
                            </div>
                            <div className="divider-vertical"></div>
                            <button className="btn-logout-circle" onClick={handleLogout} title="Đăng xuất">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        // TRẠNG THÁI: CHƯA ĐĂNG NHẬP
                        <button className="btn-header btn-login" onClick={openModal}>
                            <FaUserCircle /> <span>Đăng Nhập</span>
                        </button>
                    )}

                    {/* Nút Đăng Tin */}
                    <button className="btn-header btn-post" onClick={() => navigate('/post-building')}>
                        <FaPlusCircle /> <span>Đăng Tin</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;