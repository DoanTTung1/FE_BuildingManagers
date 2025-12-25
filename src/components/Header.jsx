import React, { useEffect, useState } from 'react';
import '../styles/Header.css';
import logoImg from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">

                {/* --- LOGO --- */}
                <div className="logo-area">
                    <img
                        src={logoImg}
                        alt="Thanh Tùng Elite Homes Logo"
                        className="logo-img"
                    />
                </div>

                {/* --- MENU --- */}
                <nav className="navbar">
                    <ul className="nav-list">
                        <li className="nav-item"><a href="#" className="nav-link active">Trang Chủ</a></li>
                        <li className="nav-item"><a href="#" className="nav-link">Văn Phòng</a></li>
                        <li className="nav-item"><a href="#" className="nav-link">Ký Gửi</a></li>
                        <li className="nav-item"><a href="#" className="nav-link">Tin Tức</a></li>
                        <li className="nav-item"><a href="#" className="nav-link">Liên Hệ</a></li>
                    </ul>
                </nav>

                {/* --- ACTIONS --- */}
                <div className="header-actions">
                    {/* Nút Đăng Tin */}
                    <button className="btn-post">
                        <i className="fas fa-plus-circle"></i> Đăng tin
                    </button>

                    <div className="hotline-box">
                        <span className="hotline-label">Hotline 24/7</span>
                        <span className="hotline-number">0345.096.281</span>
                    </div>

                    {/* Nút Đăng Nhập mới - Đã thêm icon và bỏ nút Đăng ký */}
                    <button className="btn-login">
                        <i className="fas fa-user"></i> Đăng Nhập
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;