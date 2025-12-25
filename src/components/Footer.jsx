import React from 'react';
import '../styles/Footer.css';
// Import các icon cần thiết
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaYoutube, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                
                {/* CỘT 1: THÔNG TIN CÔNG TY */}
                <div className="footer-col">
                    <h3 className="footer-title">THANH TÙNG ELITE HOMES</h3>
                    <p className="footer-desc">
                        Đối tác tin cậy hàng đầu trong lĩnh vực cho thuê văn phòng và bất động sản cao cấp. Chúng tôi kiến tạo không gian làm việc lý tưởng cho doanh nghiệp của bạn.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><FaFacebookF /></a>
                        <a href="#" className="social-icon"><FaYoutube /></a>
                        <a href="#" className="social-icon"><FaLinkedinIn /></a>
                    </div>
                </div>

                {/* CỘT 2: LIÊN KẾT NHANH */}
                <div className="footer-col">
                    <h3 className="footer-title">LIÊN KẾT NHANH</h3>
                    <ul className="footer-links">
                        <li><a href="#">Trang Chủ</a></li>
                        <li><a href="#">Văn Phòng Cho Thuê</a></li>
                        <li><a href="#">Ký Gửi Bất Động Sản</a></li>
                        <li><a href="#">Tin Tức Thị Trường</a></li>
                        <li><a href="#">Tuyển Dụng</a></li>
                    </ul>
                </div>

                {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
                <div className="footer-col">
                    <h3 className="footer-title">CHÍNH SÁCH</h3>
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
                    <h3 className="footer-title">LIÊN HỆ</h3>
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

            {/* PHẦN BẢN QUYỀN CUỐI CÙNG */}
            <div className="footer-bottom">
                <p>&copy; 2025 Thanh Tùng Elite Homes. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;