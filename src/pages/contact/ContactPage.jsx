import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaFacebookF, FaYoutube, FaLinkedinIn, FaSpinner } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient'; // Dùng trực tiếp axiosClient hoặc qua contactApi đều được
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth để tự điền form
import toast from 'react-hot-toast'; // Dùng toast cho đẹp thay vì alert
import './Contact.css';

const ContactPage = () => {
    const { user } = useAuth(); // Lấy user hiện tại

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'buy',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 2. Tự động điền thông tin nếu đã đăng nhập
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // --- SỬA ĐOẠN NÀY ĐỂ KHỚP VỚI BACKEND MỚI ---
        const payload = {
            name: formData.name,       // Backend cần 'name', không phải 'fullName'
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject, // Backend cần tách riêng 'subject'
            message: formData.message  // Backend cần tách riêng 'message'
        };

        try {
            // Sửa đường dẫn API thành /api/contacts
            await axiosClient.post('/api/contacts', payload);

            setIsSubmitted(true);
            toast.success("Gửi liên hệ thành công!");

            // Reset form
            if (!user) {
                setFormData({ name: '', email: '', phone: '', subject: 'buy', message: '' });
            } else {
                setFormData(prev => ({ ...prev, subject: 'buy', message: '' }));
            }
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            const msg = error.response?.data || "Gửi thất bại, vui lòng thử lại.";
            // Lưu ý: Backend trả về chuỗi text trực tiếp (ResponseEntity.badRequest().body("Lỗi...")) 
            // nên dùng error.response.data thay vì error.response.data.message
            toast.error(typeof msg === 'string' ? msg : "Có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper để lấy tên chủ đề hiển thị đẹp hơn trong DB
    const getSubjectLabel = (val) => {
        switch (val) {
            case 'buy': return 'MUA NHÀ';
            case 'rent': return 'THUÊ VĂN PHÒNG';
            case 'consign': return 'KÝ GỬI';
            default: return 'KHÁC';
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
                            <div className="success-message fade-in">
                                <h3 style={{ color: '#10b981' }}>🎉 Đã gửi thành công!</h3>
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
                                    {isLoading ? (
                                        <span><FaSpinner className="spinner-icon" /> Đang gửi...</span>
                                    ) : (
                                        <><FaPaperPlane /> Gửi Yêu Cầu</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* RIGHT: MAP & SIDEBAR */}
                    <div className="contact-sidebar">
                        <div className="map-frame">
                            {/* 4. Link Google Map CHUẨN cho Bitexco */}
                            <iframe
                                title="Google Map Bitexco"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.522858695079!2d106.70196431165155!3d10.77121015926527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f46c6460023%3A0x69022630045155a5!2sBitexco%20Financial%20Tower!5e0!3m2!1sen!2s!4v1714580000000!5m2!1sen!2s"
                                width="100%" height="350" style={{ border: 0, borderRadius: '12px' }} allowFullScreen="" loading="lazy"
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
                                <a href="https://www.facebook.com/oanthanhtung.790997/" className="sc-icon fb" target="_blank" rel="noreferrer"><FaFacebookF /></a>
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