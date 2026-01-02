import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaPlusCircle, FaPhoneAlt, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext';

// Import Component Modal OTP
import VerifyModal from './VerifyModal';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // 1. LẤY THÊM setUser ĐỂ UPDATE TRẠNG THÁI
    const { openModal, user, logout, setUser } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- HÀM XỬ LÝ KHI BẤM ĐĂNG TIN ---
    const handlePostClick = () => {
        // 1. Chưa đăng nhập -> Bắt đăng nhập
        if (!user) {
            openModal();
            return;
        }

        // 2. Kiểm tra xác thực SĐT
        // Admin được quyền đăng kể cả chưa xác thực (nếu muốn)
        // Lưu ý: user.roles là mảng ["USER", "ADMIN"]
        const isAdmin = user.roles && user.roles.includes('ADMIN');

        if (!user.phoneVerified && !isAdmin) {
            setShowVerifyModal(true);
            return;
        }

        // 3. Đủ điều kiện -> Cho vào trang đăng tin
        navigate('/post-building');
    };

    // --- CALLBACK KHI XÁC THỰC THÀNH CÔNG ---
    const onVerifySuccess = () => {
        // 1. Cập nhật state ngay lập tức để không hiện Modal nữa
        const updatedUser = { ...user, phoneVerified: true };
        setUser(updatedUser);

        // 2. Cập nhật LocalStorage để F5 không bị mất
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 3. Chuyển trang
        navigate('/post-building');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    <div className="logo-area" onClick={() => navigate('/')}>
                        <h1 className="logo-text">Elite<span>Homes</span></h1>
                    </div>

                    <nav className="nav-menu">
                        <ul className="nav-list">
                            <li><Link to="/" className={`nav-link ${isActive('/')}`}>Trang Chủ</Link></li>
                            <li><Link to="/search" className={`nav-link ${isActive('/search')}`}>Thuê Văn Phòng</Link></li>
                            <li><Link to="/projects" className={`nav-link ${isActive('/projects')}`}>Dự Án</Link></li>
                            <li><Link to="/news" className={`nav-link ${isActive('/news')}`}>Tin Tức</Link></li>
                            <li><Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Liên Hệ</Link></li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <div className="hotline-box">
                            <span className="hotline-label">Hotline 24/7</span>
                            <a href="tel:0345096281" className="hotline-number">
                                <FaPhoneAlt size={12} /> 0345.096.281
                            </a>
                        </div>

                        {user ? (
                            <div className="user-badge">
                                {/* --- THÊM PHẦN HIỂN THỊ AVATAR --- */}
                                <div className="user-avatar-small" style={{
                                    width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden',
                                    marginRight: '10px', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FaUserCircle size={24} color="#0f172a" />
                                    )}
                                </div>
                                {/* --------------------------------- */}

                                <div className="user-info">
                                    <span className="hello-lbl">Xin chào,</span>

                                    {/* Link tới trang Profile */}
                                    <Link to="/profile" className="user-name-link" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#bc2222ff' }}>
                                        {user.fullName || user.username}
                                    </Link>

                                </div>
                                <div className="divider-vertical"></div>
                                <button className="btn-logout-circle" onClick={handleLogout} title="Đăng xuất">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        ) : (
                            <button className="btn-header btn-login" onClick={openModal}>
                                <FaUserCircle /> <span>Đăng Nhập</span>
                            </button>
                        )}

                        <button className="btn-header btn-post" onClick={handlePostClick}>
                            <FaPlusCircle /> <span>Đăng Tin</span>
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