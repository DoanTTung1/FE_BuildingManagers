import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaLock, FaArrowLeft } from 'react-icons/fa';
import '../../styles/LoginPage.css';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg(''); // Xóa lỗi khi người dùng nhập lại
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await login(formData);

            if (res.success) {
                const roles = res.roles || [];
                console.log("Roles nhận được:", roles); // Bật F12 xem log này nó ra cái gì

                // Kiểm tra quyền (Chấp nhận cả ADMIN, STAFF, ROLE_ADMIN, ROLE_STAFF)
                const hasAccess = roles.some(r =>
                    r.includes('ADMIN') || r.includes('STAFF')
                );

                if (hasAccess) {
                    navigate('/admin/buildings');
                } else {
                    // === TRƯỜNG HỢP KHÔNG CÓ QUYỀN ===

                    // 1. Tắt loading NGAY LẬP TỨC để giao diện hết bị đơ
                    setIsLoading(false);

                    // 2. Set thông báo lỗi
                    setErrorMsg("⛔ CẢNH BÁO: Tài khoản này không có quyền quản trị! Đang chuyển về trang chủ...");

                    // 3. Đợi 3 giây rồi đá về trang chủ
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);

                    // 4. Return luôn để không chạy xuống phần finally bên dưới nữa
                    return;
                }
            } else {
                setErrorMsg(res.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("Có lỗi kết nối server, vui lòng thử lại.");
        } finally {
            // Chỉ tắt loading nếu chưa bị return ở trên
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Trang Quản Trị</h2>
                    <p>Hệ thống quản lý tòa nhà</p>
                </div>

                {errorMsg && <div className="error-msg">{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="userName"
                            placeholder="Tên đăng nhập"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                        <FaUserShield className="input-icon" />
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu bảo mật"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <FaLock className="input-icon" />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
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