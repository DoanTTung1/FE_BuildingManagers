import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaFacebookF, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import contactApi from '../../api/contactApi'; // Import API
import './Contact.css';

const ContactPage = () => {
    // State quản lý form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'buy', // Mặc định giá trị đầu tiên của select
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Thêm state Loading

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Bắt đầu loading

        try {
            // Gọi API thật
            await contactApi.sendContact(formData);

            // Thành công
            setIsSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: 'buy', message: '' }); // Reset form

            // Tự động tắt thông báo sau 5s để người dùng có thể gửi tiếp
            setTimeout(() => setIsSubmitted(false), 5000);

        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            alert("Gửi thất bại! Vui lòng kiểm tra kết nối mạng và thử lại.");
        } finally {
            setIsLoading(false); // Kết thúc loading
        }
    };

    return (
        <div className="contact-page">
            {/* 1. HERO BANNER */}
            <div className="contact-hero">
                <div className="hero-content">
                    <h1>Liên Hệ Với Chúng Tôi</h1>
                    <p>Đội ngũ EliteHomes luôn sẵn sàng hỗ trợ bạn 24/7. Hãy kết nối ngay!</p>
                </div>
            </div>

            <div className="contact-container">
                {/* 2. INFO CARDS */}
                <div className="contact-info-grid">
                    <div className="info-card">
                        <div className="icon-circle"><FaMapMarkerAlt /></div>
                        <h3>Trụ sở chính</h3>
                        <p>Tòa nhà Bitexco Financial Tower</p>
                        <p>Số 2 Hải Triều, Q.1, TP.HCM</p>
                    </div>
                    <div className="info-card">
                        <div className="icon-circle"><FaPhoneAlt /></div>
                        <h3>Hotline hỗ trợ</h3>
                        <p className="highlight">0345.096.281</p>
                        <p>CSKH: (028) 3838 3838</p>
                    </div>
                    <div className="info-card">
                        <div className="icon-circle"><FaEnvelope /></div>
                        <h3>Email liên hệ</h3>
                        <p>contact@elitehomes.vn</p>
                        <p>support@elitehomes.vn</p>
                    </div>
                </div>

                {/* 3. MAIN SECTION */}
                <div className="contact-main-wrapper">
                    {/* LEFT: FORM */}
                    <div className="contact-form-box">
                        <h2>Gửi tin nhắn cho chúng tôi</h2>
                        <p>Để lại thông tin, chuyên viên tư vấn sẽ liên hệ lại trong vòng 15 phút.</p>

                        {isSubmitted ? (
                            <div className="success-message">
                                <h3>🎉 Đã gửi thành công!</h3>
                                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.</p>
                                <button onClick={() => setIsSubmitted(false)} className="btn-retry">
                                    Gửi tin khác
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="text" name="name"
                                            value={formData.name}
                                            placeholder="Nhập tên của bạn" required onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="tel" name="phone"
                                            value={formData.phone}
                                            placeholder="Nhập số điện thoại" required onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="email" name="email"
                                            value={formData.email}
                                            placeholder="example@gmail.com" required onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Chủ đề quan tâm</label>
                                        <select name="subject" value={formData.subject} onChange={handleChange}>
                                            <option value="buy">Mua căn hộ / Nhà phố</option>
                                            <option value="rent">Thuê văn phòng</option>
                                            <option value="consign">Ký gửi bất động sản</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Nội dung chi tiết <span style={{ color: 'red' }}>*</span></label>
                                    <textarea
                                        name="message" rows="5"
                                        value={formData.message}
                                        placeholder="Bạn cần hỗ trợ gì..." required onChange={handleChange}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-submit-contact" disabled={isLoading}>
                                    {isLoading ? 'Đang gửi...' : <><FaPaperPlane /> Gửi Yêu Cầu</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* RIGHT: MAP & SIDEBAR */}
                    <div className="contact-sidebar">
                        <div className="map-frame">
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.517826541572!2d106.70134531533414!3d10.771595262228355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2sBitexco%20Financial%20Tower!5e0!3m2!1sen!2s!4v1645432654321!5m2!1sen!2s"
                                width="100%" height="350" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                            ></iframe>
                        </div>

                        <div className="working-hours">
                            <h3>Giờ làm việc</h3>
                            <ul>
                                <li><span>Thứ 2 - Thứ 6:</span> <strong>8:00 - 18:00</strong></li>
                                <li><span>Thứ 7:</span> <strong>8:00 - 12:00</strong></li>
                                <li><span>Chủ Nhật:</span> <strong>Nghỉ</strong></li>
                            </ul>
                        </div>

                        <div className="social-connect">
                            <h3>Kết nối mạng xã hội</h3>
                            <div className="social-icons">
                                <a href="https://www.facebook.com/groups/2156788427977817" className="sc-icon fb"><FaFacebookF /></a>
                                <a href="#" className="sc-icon yt"><FaYoutube /></a>
                                <a href="#" className="sc-icon in"><FaLinkedinIn /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;