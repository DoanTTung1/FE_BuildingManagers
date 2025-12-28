import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaTimes, FaIdCard } from 'react-icons/fa';
import '../styles/AuthModal.css';

const AuthModal = () => {
    // Lấy các hàm và state từ Context
    const { isModalOpen, closeModal, login, register } = useAuth();
    
    // State quản lý View: true = Đăng nhập, false = Đăng ký
    const [isLoginView, setIsLoginView] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // State lưu dữ liệu Form
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        fullName: '',
        email: '',
        phone: ''
    });

    // Nếu modal chưa mở thì không render gì cả
    if (!isModalOpen) return null;

    // Hàm xử lý khi nhập liệu
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg(''); // Xóa thông báo lỗi khi người dùng bắt đầu gõ lại
    };

    // Hàm xử lý Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (isLoginView) {
            // --- XỬ LÝ ĐĂNG NHẬP ---
            const res = await login({ 
                userName: formData.userName, 
                password: formData.password 
            });
            
            if (!res.success) {
                setErrorMsg(res.message);
            }
        } else {
            // --- XỬ LÝ ĐĂNG KÝ ---
            const res = await register(formData);
            
            if (res.success) {
                setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
                // Tự động chuyển về tab Đăng nhập sau 1.5 giây
                setTimeout(() => {
                    setIsLoginView(true);
                    setSuccessMsg('');
                    // Xóa mật khẩu để người dùng nhập lại cho an toàn
                    setFormData(prev => ({...prev, password: ''})); 
                }, 1500);
            } else {
                setErrorMsg(res.message);
            }
        }
        setIsLoading(false);
    };

    // Hàm đóng modal và reset lại trạng thái
    const handleClose = () => {
        setErrorMsg('');
        setSuccessMsg('');
        closeModal();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={handleClose}>
                    <FaTimes />
                </button>
                
                {/* --- HEADER VỚI THANH TRƯỢT (SLIDING BAR) --- */}
                <div className="auth-header-wrapper">
                    <div className="auth-header-tabs">
                        <div 
                            className={`tab-item ${isLoginView ? 'active' : ''}`} 
                            onClick={() => setIsLoginView(true)}
                        >
                            Đăng Nhập
                        </div>
                        <div 
                            className={`tab-item ${!isLoginView ? 'active' : ''}`} 
                            onClick={() => setIsLoginView(false)}
                        >
                            Đăng Ký
                        </div>
                    </div>
                    {/* Đây là thanh kẻ trượt qua lại */}
                    <div className={`slider-bar ${!isLoginView ? 'slide-right' : ''}`}></div>
                </div>

                <div className="auth-body">
                    {/* Hiển thị thông báo lỗi hoặc thành công */}
                    {errorMsg && <div className="alert-box error fade-in">{errorMsg}</div>}
                    {successMsg && <div className="alert-box success fade-in">{successMsg}</div>}

                    <form onSubmit={handleSubmit} className={isLoginView ? 'form-login' : 'form-register'}>
                        
                        {/* --- USERNAME --- */}
                        <div className="input-group-auth">
                            <FaUser className="icon" />
                            <input 
                                type="text" 
                                name="userName" 
                                placeholder="Tên đăng nhập" 
                                required 
                                value={formData.userName} 
                                onChange={handleChange}
                            />
                        </div>

                        {/* --- PASSWORD --- */}
                        <div className="input-group-auth">
                            <FaLock className="icon" />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Mật khẩu" 
                                required 
                                value={formData.password} 
                                onChange={handleChange}
                            />
                        </div>

                        {/* --- CÁC TRƯỜNG ĐĂNG KÝ (Hiệu ứng mở rộng Accordion) --- */}
                        <div className={`register-expand ${!isLoginView ? 'open' : ''}`}>
                            <div className="input-group-auth">
                                <FaIdCard className="icon" />
                                <input 
                                    type="text" 
                                    name="fullName" 
                                    placeholder="Họ và tên đầy đủ" 
                                    value={formData.fullName} 
                                    onChange={handleChange} 
                                    required={!isLoginView} 
                                />
                            </div>
                            <div className="input-group-auth">
                                <FaEnvelope className="icon" />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email liên hệ" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required={!isLoginView} 
                                />
                            </div>
                            <div className="input-group-auth">
                                <FaPhone className="icon" />
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    placeholder="Số điện thoại" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required={!isLoginView} 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới')}
                        </button>
                    </form>
                    
                    {isLoginView && <p className="forgot-pass">Quên mật khẩu?</p>}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;