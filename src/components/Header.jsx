import React, { useEffect, useState } from 'react';
import '../styles/Header.css';

// Import ảnh logo (Lưu ý đường dẫn phải chính xác)
import logoImg from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Khi cuộn quá 50px thì đổi trạng thái
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
                    <div className="hotline-box">
                        <span className="hotline-label">Hotline 24/7</span>
                        <span className="hotline-number">0345.096.281</span>
                    </div>
                    
                    {/* Nút Đăng Nhập (Style nhẹ - Viền) */}
                    <button className="btn-login">Đăng Nhập</button>
                    
                    {/* Nút Đăng Ký (Style nổi bật - Nền màu) */}
                    <button className="btn-signup">Đăng Ký</button>
                </div>
            </div>
        </header>
    );
};

export default Header;