import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaTimes, FaIdCard, FaArrowLeft } from 'react-icons/fa';
import '../styles/AuthModal.css';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const AuthModal = () => {
    const { isModalOpen, closeModal, login, register, loginWithGoogle, forgotPassword } = useAuth();

    const [isLoginView, setIsLoginView] = useState(true);
    const [isForgotPassView, setIsForgotPassView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        fullName: '',
        email: '',
        phone: ''
    });

    if (!isModalOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const handleClose = () => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsForgotPassView(false);
        closeModal();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isLoginView) {
                const res = await login({
                    username: formData.userName,
                    password: formData.password
                });
                if (res && res.success) {
                    toast.success("Chào mừng bạn trở lại!");
                    handleClose();
                } else {
                    toast.error(res?.message || "Sai tài khoản hoặc mật khẩu");
                }
            } else {
                const res = await register({
                    username: formData.userName,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                });

                if (res && res.success) {
                    toast.success("Đăng ký thành công!");
                    setSuccessMsg("Đăng ký thành công! Đang chuyển sang đăng nhập...");
                    setTimeout(() => {
                        setIsLoginView(true);
                        setSuccessMsg('');
                        setFormData(prev => ({ ...prev, password: '' }));
                    }, 1500);
                } else {
                    toast.error(res?.message || "Đăng ký thất bại");
                }
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            toast.error("Vui lòng nhập Email để hệ thống nhận diện!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await forgotPassword(formData.email);
            if (res.success) {
                toast.success("Mật khẩu mới đã được gửi vào Email!");
                setIsForgotPassView(false);
            }
        } catch (error) {
            toast.error("Lỗi khi gửi yêu cầu!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const res = await loginWithGoogle(credentialResponse.credential);
            if (res?.success) {
                toast.success("Đăng nhập Google thành công!");
                handleClose();
            }
        } catch (err) {
            toast.error("Lỗi xác thực Google!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {isForgotPassView && (
                    <button className="back-btn" onClick={() => setIsForgotPassView(false)}>
                        <FaArrowLeft />
                    </button>
                )}

                <button className="close-btn" onClick={handleClose}><FaTimes /></button>

                {!isForgotPassView ? (
                    <>
                        <div className="auth-header-wrapper">
                            <div className="auth-header-tabs">
                                <div className={`tab-item ${isLoginView ? 'active' : ''}`} onClick={() => setIsLoginView(true)}>Đăng Nhập</div>
                                <div className={`tab-item ${!isLoginView ? 'active' : ''}`} onClick={() => setIsLoginView(false)}>Đăng Ký</div>
                            </div>
                            <div className={`slider-bar ${!isLoginView ? 'slide-right' : ''}`}></div>
                        </div>

                        <div className="auth-body">
                            {errorMsg && <div className="alert-box error fade-in">{errorMsg}</div>}
                            {successMsg && <div className="alert-box success fade-in">{successMsg}</div>}

                            <form onSubmit={handleSubmit} className={isLoginView ? 'form-login' : 'form-register'}>
                                <div className="input-group-auth">
                                    <FaUser className="icon" />
                                    <input type="text" name="userName" placeholder="Tên đăng nhập" required value={formData.userName} onChange={handleChange} />
                                </div>
                                <div className="input-group-auth">
                                    <FaLock className="icon" />
                                    <input type="password" name="password" placeholder="Mật khẩu" required value={formData.password} onChange={handleChange} />
                                </div>

                                <div className={`register-expand ${!isLoginView ? 'open' : ''}`}>
                                    <div className="input-group-auth">
                                        <FaIdCard className="icon" />
                                        <input type="text" name="fullName" placeholder="Họ và tên đầy đủ" value={formData.fullName} onChange={handleChange} required={!isLoginView} />
                                    </div>
                                    <div className="input-group-auth">
                                        <FaEnvelope className="icon" />
                                        <input type="email" name="email" placeholder="Email liên hệ" value={formData.email} onChange={handleChange} required={!isLoginView} />
                                    </div>
                                    <div className="input-group-auth">
                                        <FaPhone className="icon" />
                                        <input type="tel" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required={!isLoginView} />
                                    </div>
                                </div>

                                <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới')}
                                </button>
                            </form>

                            {isLoginView && (
                                <>
                                    <div className="google-login-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => toast.error("Đăng nhập Google thất bại")}
                                        />
                                    </div>
                                    {/* --- ĐƯA QUÊN MẬT KHẨU XUỐNG DƯỚI CÙNG --- */}
                                    <p className="forgot-pass" onClick={() => setIsForgotPassView(true)}>
                                        Quên mật khẩu?
                                    </p>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-body fade-in">
                        <div className="forgot-header">
                            <h3 className="forgot-title">Khôi phục mật khẩu</h3>
                            <p className="forgot-desc">Chúng tôi sẽ gửi mật khẩu mới vào email của bạn.</p>
                        </div>

                        <form onSubmit={handleForgotSubmit}>
                            <div className="input-group-auth">
                                <FaEnvelope className="icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Nhập Email của bạn"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                                {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi mật khẩu mới'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;