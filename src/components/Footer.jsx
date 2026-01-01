import React from 'react';
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer-wrapper">
            {/* Lớp phủ họa tiết tạo chiều sâu cho nền xanh */}
            <div className="footer-pattern"></div>

            <div className="footer-container">
                {/* CỘT 1: THƯƠNG HIỆU */}
                <div className="footer-col brand-col">
                    <h3 className="footer-title">Thanh Tùng Elite Homes</h3>
                    <p className="footer-desc">
                        Kiến tạo đẳng cấp sống và làm việc. Đối tác chiến lược tin cậy trong lĩnh vực bất động sản và văn phòng cao cấp.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" className="social-icon" aria-label="Youtube"><FaYoutube /></a>
                        <a href="#" className="social-icon" aria-label="LinkedIn"><FaLinkedinIn /></a>
                    </div>
                </div>

                {/* CỘT 2: KHÁM PHÁ */}
                <div className="footer-col">
                    <h3 className="footer-title">Khám Phá</h3>
                    <ul className="footer-links">
                        <li><a href="/"><FaChevronRight className="link-arrow" /> Trang Chủ</a></li>
                        <li><a href="/search"><FaChevronRight className="link-arrow" /> Văn Phòng Cho Thuê</a></li>
                        <li><a href="/consign"><FaChevronRight className="link-arrow" /> Ký Gửi BĐS</a></li>
                        <li><a href="/news"><FaChevronRight className="link-arrow" /> Tin Tức & Sự Kiện</a></li>
                    </ul>
                </div>

                {/* CỘT 3: HỖ TRỢ */}
                <div className="footer-col">
                    <h3 className="footer-title">Hỗ Trợ</h3>
                    <ul className="footer-links">
                        <li><a href="#"><FaChevronRight className="link-arrow" /> Điều Khoản Sử Dụng</a></li>
                        <li><a href="#"><FaChevronRight className="link-arrow" /> Chính Sách Bảo Mật</a></li>
                        <li><a href="#"><FaChevronRight className="link-arrow" /> Quy Trình Làm Việc</a></li>
                        <li><a href="/contact"><FaChevronRight className="link-arrow" /> Liên Hệ Tư Vấn</a></li>
                    </ul>
                </div>

                {/* CỘT 4: LIÊN HỆ */}
                <div className="footer-col">
                    <h3 className="footer-title">Thông Tin Liên Hệ</h3>
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="icon-box"><FaMapMarkerAlt /></div>
                            <div className="text-box">
                                <strong>Trụ Sở Chính</strong>
                                <span>Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM</span>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="icon-box"><FaPhoneAlt /></div>
                            <div className="text-box">
                                <strong>Hotline 24/7</strong>
                                <span className="highlight-text">0345.096.281 (Mr. Tùng)</span>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="icon-box"><FaEnvelope /></div>
                            <div className="text-box">
                                <strong>Email Hỗ Trợ</strong>
                                <span>contact@thanhtungland.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COPYRIGHT */}
            <div className="footer-bottom">
                <div className="bottom-content">
                    <p>&copy; 2025 <strong>Thanh Tùng Elite Homes</strong>. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;