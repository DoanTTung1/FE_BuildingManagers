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
        // Xóa thông báo lỗi ngay khi người dùng nhập lại
        if (errorMsg) setErrorMsg('');
    };

    const handleClose = () => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsForgotPassView(false);
        // Reset form khi đóng để đảm bảo sạch sẽ cho lần sau
        setFormData({ userName: '', password: '', fullName: '', email: '', phone: '' });
        closeModal();
    };

    // --- 1. HÀM KIỂM TRA DỮ LIỆU (VALIDATION) ---
    const validateForm = () => {
        // Kiểm tra Tên đăng nhập
        if (!formData.userName.trim()) {
            toast.error("Vui lòng nhập tên đăng nhập!");
            return false;
        }

        // Kiểm tra Mật khẩu
        if (!formData.password) {
            toast.error("Vui lòng nhập mật khẩu!");
            return false;
        }

        // Nếu là màn hình Đăng Ký thì kiểm tra thêm các trường khác
        if (!isLoginView) {
            if (formData.password.length < 6) {
                toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
                return false;
            }

            if (!formData.fullName.trim()) {
                toast.error("Vui lòng nhập họ và tên!");
                return false;
            }

            if (!formData.email.trim()) {
                toast.error("Vui lòng nhập Email!");
                return false;
            }
            // Validate định dạng Email cơ bản
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error("Email không hợp lệ!");
                return false;
            }

            if (!formData.phone.trim()) {
                toast.error("Vui lòng nhập số điện thoại!");
                return false;
            }
            // Validate số điện thoại (chỉ số, độ dài 10-11)
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(formData.phone)) {
                toast.error("Số điện thoại không hợp lệ (10-11 số)!");
                return false;
            }
        }

        return true; // Dữ liệu hợp lệ
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- 2. GỌI HÀM VALIDATE TRƯỚC KHI XỬ LÝ ---
        if (!validateForm()) {
            return; // Dừng lại nếu dữ liệu chưa đủ
        }

        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isLoginView) {
                // --- LOGIN ---
                const res = await login({
                    username: formData.userName,
                    password: formData.password
                });

                if (res && res.success) {
                    toast.success("Đăng nhập thành công!");
                    handleClose();
                } else {
                    // Xử lý thông báo "Bad credentials" thành tiếng Việt thân thiện hơn
                    let msg = res?.message;
                    if (msg === "Bad credentials") {
                        msg = "Sai tên đăng nhập hoặc mật khẩu!";
                    }
                    // Hiển thị vừa toast vừa text đỏ
                    toast.error(msg || "Đăng nhập thất bại");
                    setErrorMsg(msg || "Sai tên đăng nhập hoặc mật khẩu");
                }
            } else {
                // --- REGISTER ---
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
                    setErrorMsg(res?.message || "Tên đăng nhập hoặc Email đã tồn tại");
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
        // Validate riêng cho form quên mật khẩu
        if (!formData.email.trim()) {
            toast.error("Vui lòng nhập Email để lấy lại mật khẩu!");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Email không đúng định dạng!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await forgotPassword(formData.email);
            if (res && res.success) {
                toast.success(res.message || "Mật khẩu mới đã được gửi vào Email!");
                setIsForgotPassView(false);
            } else {
                toast.error(res.message || "Email không tồn tại trong hệ thống!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến máy chủ!");
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
            } else {
                toast.error(res?.message || "Đăng nhập Google thất bại");
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

                            <form onSubmit={handleSubmit} className={isLoginView ? 'form-login' : 'form-register'} noValidate>
                                <div className="input-group-auth">
                                    <FaUser className="icon" />
                                    <input type="text" name="userName" placeholder="Tên đăng nhập" value={formData.userName} onChange={handleChange} />
                                </div>
                                <div className="input-group-auth">
                                    <FaLock className="icon" />
                                    <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} />
                                </div>

                                <div className={`register-expand ${!isLoginView ? 'open' : ''}`}>
                                    <div className="input-group-auth">
                                        <FaIdCard className="icon" />
                                        <input type="text" name="fullName" placeholder="Họ và tên đầy đủ" value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    <div className="input-group-auth">
                                        <FaEnvelope className="icon" />
                                        <input type="email" name="email" placeholder="Email liên hệ" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="input-group-auth">
                                        <FaPhone className="icon" />
                                        <input type="tel" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
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
                                            theme="outline"
                                            shape="pill"
                                            size="large"
                                            text="signin_with"
                                            width="380"
                                        />
                                    </div>
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

                        <form onSubmit={handleForgotSubmit} noValidate>
                            <div className="input-group-auth">
                                <FaEnvelope className="icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Nhập Email của bạn"
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