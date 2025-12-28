// src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import '../styles/HeaderFooter.css'; // Dùng chung file CSS với Header

const Footer = () => {
    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                
                {/* CỘT 1: THÔNG TIN CÔNG TY */}
                <div className="footer-col">
                    <h3 className="footer-title">Thanh Tùng Elite Homes</h3>
                    <p className="footer-desc">
                        Đối tác tin cậy hàng đầu trong lĩnh vực cho thuê văn phòng và bất động sản cao cấp. 
                        Chúng tôi kiến tạo không gian làm việc lý tưởng cho doanh nghiệp của bạn.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><FaFacebookF /></a>
                        <a href="#" className="social-icon"><FaYoutube /></a>
                        <a href="#" className="social-icon"><FaLinkedinIn /></a>
                    </div>
                </div>

                {/* CỘT 2: LIÊN KẾT NHANH */}
                <div className="footer-col">
                    <h3 className="footer-title">Liên Kết Nhanh</h3>
                    <ul className="footer-links">
                        <li><a href="/">Trang Chủ</a></li>
                        <li><a href="/search">Văn Phòng Cho Thuê</a></li>
                        <li><a href="/consign">Ký Gửi Bất Động Sản</a></li>
                        <li><a href="/news">Tin Tức Thị Trường</a></li>
                        <li><a href="/contact">Tuyển Dụng</a></li>
                    </ul>
                </div>

                {/* CỘT 3: CHÍNH SÁCH */}
                <div className="footer-col">
                    <h3 className="footer-title">Chính Sách</h3>
                    <ul className="footer-links">
                        <li><a href="#">Chính Sách Bảo Mật</a></li>
                        <li><a href="#">Điều Khoản Sử Dụng</a></li>
                        <li><a href="#">Quy Trình Làm Việc</a></li>
                        <li><a href="#">Câu Hỏi Thường Gặp</a></li>
                        <li><a href="#">Liên Hệ Hỗ Trợ</a></li>
                    </ul>
                </div>

                {/* CỘT 4: LIÊN HỆ */}
                <div className="footer-col">
                    <h3 className="footer-title">Liên Hệ</h3>
                    <div className="contact-info">
                        <div className="contact-item">
                            <FaMapMarkerAlt className="c-icon" />
                            <span>Tòa nhà Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM</span>
                        </div>
                        <div className="contact-item">
                            <FaPhoneAlt className="c-icon" />
                            <span>0345.096.281 (Mr. Tùng)</span>
                        </div>
                        <div className="contact-item">
                            <FaEnvelope className="c-icon" />
                            <span>contact@thanhtungland.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div className="footer-bottom">
                <p>&copy; 2025 Thanh Tùng Elite Homes. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;