import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import '../../styles/LoginPage.css';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Khi người dùng gõ lại, ẩn lỗi ngay lập tức để trải nghiệm tốt hơn
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Reset lỗi cũ

        const user = formData.username.trim();
        const pass = formData.password.trim();

        // --- 1. VALIDATION CHI TIẾT (KIỂM TRA ĐẦU VÀO) ---

        // Trường hợp 1: Bỏ trống cả hai
        if (!user && !pass) {
            setErrorMsg("⚠️ Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.");
            return;
        }

        // Trường hợp 2: Chỉ bỏ trống tên đăng nhập
        if (!user) {
            setErrorMsg("⚠️ Tên đăng nhập không được để trống. Vui lòng nhập lại.");
            return;
        }

        // Trường hợp 3: Chỉ bỏ trống mật khẩu
        if (!pass) {
            setErrorMsg("⚠️ Mật khẩu không được để trống. Vui lòng nhập lại.");
            return;
        }

        // Trường hợp 4 (Tùy chọn): Mật khẩu quá ngắn (nếu muốn chặn trước khi gửi lên server)
        // if (pass.length < 3) {
        //     setErrorMsg("⚠️ Mật khẩu quá ngắn. Vui lòng kiểm tra lại.");
        //     return;
        // }

        // --- 2. GỬI DỮ LIỆU LÊN SERVER ---
        setIsLoading(true);

        try {
            const res = await login(formData);

            if (res.success) {
                const roles = res.roles || [];

                // Kiểm tra tài khoản không có quyền
                if (roles.length === 0) {
                    setIsLoading(false);
                    setErrorMsg("⛔ Tài khoản này chưa được phân quyền. Vui lòng liên hệ Admin.");
                    return;
                }

                // Kiểm tra quyền Admin/Staff
                const hasAccess = roles.some(r => {
                    const roleName = typeof r === 'string' ? r : (r.authority || '');
                    return roleName.includes('ADMIN') || roleName.includes('STAFF');
                });

                if (hasAccess) {
                    // === ĐĂNG NHẬP THÀNH CÔNG ===
                    if (res.token) localStorage.setItem('token', res.token);
                    localStorage.setItem('roles', JSON.stringify(roles));
                    navigate('/admin/buildings');
                } else {
                    // === ĐÚNG PASS NHƯNG KHÔNG ĐỦ QUYỀN VÀO TRANG NÀY ===
                    setIsLoading(false);
                    setErrorMsg("⛔ Bạn không có quyền truy cập vào trang Quản Trị.");
                }
            } else {
                // === XỬ LÝ LỖI TỪ SERVER TRẢ VỀ ===
                setIsLoading(false);

                // Đôi khi server trả về tiếng Anh (Bad credentials), ta dịch sang tiếng Việt cho thân thiện
                let serverMessage = res.message || "";
                if (serverMessage === "Bad credentials" || serverMessage.includes("incorrect")) {
                    setErrorMsg("❌ Tên đăng nhập hoặc mật khẩu không chính xác.");
                } else if (serverMessage.includes("lock") || serverMessage.includes("disabled")) {
                    setErrorMsg("⛔ Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.");
                } else {
                    // Nếu lỗi khác, hiển thị nguyên văn hoặc thông báo chung
                    setErrorMsg(serverMessage || "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
                }
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setErrorMsg("🌐 Lỗi kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.");
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Trang Quản Trị</h2>
                    <p>Hệ thống quản lý tòa nhà</p>
                </div>

                {/* Hiển thị lỗi nổi bật hơn */}
                {errorMsg && (
                    <div className="error-msg" style={{
                        fontWeight: '500', // Đậm vừa phải
                        textAlign: 'left', // Căn trái cho dễ đọc nếu nội dung dài
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb',
                        padding: '12px 15px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <FaUser className="input-icon" />
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <FaLock className="input-icon" />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
                    </button>
                </form>

                <a href="/" className="back-home">
                    <FaArrowLeft style={{ marginRight: '5px' }} /> Quay về Website chính
                </a>
            </div>
        </div>
    );
};

export default LoginPage;