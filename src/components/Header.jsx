import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaPlus, FaPhoneVolume, FaSignOutAlt, FaBars } from 'react-icons/fa';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';
import VerifyModal from './VerifyModal';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const { openModal, user, logout, setUser } = useAuth();

    // Hiệu ứng cuộn
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Xử lý đăng tin
    const handlePostClick = () => {
        if (!user) return openModal();
        const isAdmin = user.roles && user.roles.includes('ADMIN');
        if (!user.phoneVerified && !isAdmin) return setShowVerifyModal(true);
        navigate('/post-building');
    };

    // Callback xác thực
    const onVerifySuccess = () => {
        const updatedUser = { ...user, phoneVerified: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/post-building');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <header className={`ultra-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-wrapper">
                    {/* --- LOGO --- */}
                    <div className="brand-logo" onClick={() => navigate('/')}>
                        <h1>Elite<span className="brand-highlight">Homes</span></h1>
                    </div>

                    {/* --- NAVIGATION --- */}
                    <nav className="desktop-nav">
                        <ul>
                            <li><Link to="/" className={`nav-item ${isActive('/')}`}>Trang Chủ</Link></li>
                            <li><Link to="/search" className={`nav-item ${isActive('/search')}`}>Mua/Thuê Văn Phòng</Link></li>
                            <li><Link to="/ky-gui" className={`nav-item ${isActive('/ky-gui')}`}>Ký Gửi Nhà Đất</Link></li>
                            <li><Link to="/news" className={`nav-item ${isActive('/news')}`}>Tin Tức</Link></li>
                            <li><Link to="/contact" className={`nav-item ${isActive('/contact')}`}>Liên Hệ</Link></li>
                        </ul>
                    </nav>

                    {/* --- ACTIONS --- */}
                    <div className="header-right">
                        {/* Hotline */}
                        <div className="hotline-pill">
                            <div className="icon-pulse"><FaPhoneVolume /></div>
                            <div className="hotline-info">
                                <span>Hỗ trợ 24/7</span>
                                <strong>0345.096.281</strong>
                            </div>
                        </div>

                        <div className="divider"></div>

                        {/* User / Login */}
                        {/* --- PHẦN USER ĐÃ SỬA GỌN --- */}
                        {user ? (
                            <div className="user-capsule">
                                <div className="avatar-ring">
                                    <img
                                        src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt="User"
                                    // Xóa hết style={{...}} ở đây nếu còn
                                    />
                                </div>
                                <div className="user-text" onClick={() => navigate('/profile')}>
                                    <span className="welcome">Xin chào,</span>
                                    <span className="name">{user.fullName || user.username}</span>
                                </div>
                                <button className="btn-icon-logout" onClick={() => { logout(); navigate('/'); }} title="Đăng xuất">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        ) : (
                            <button className="btn-login-modern" onClick={openModal}>
                                <FaUserCircle /> <span>Đăng nhập</span>
                            </button>
                        )}

                        {/* Post Button */}
                        <button className="btn-post-premium" onClick={handlePostClick}>
                            <span className="flare"></span>
                            <FaPlus /> <span>Đăng Tin</span>
                        </button>
                    </div>
                </div>
            </header>

            <VerifyModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onVerifiedSuccess={onVerifySuccess}
                userPhone={user?.phone}
                username={user?.username}
            />
        </>
    );
};

export default Header;