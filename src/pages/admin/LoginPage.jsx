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
        userName: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Khi người dùng bắt đầu gõ lại thì ẩn lỗi đi cho đỡ rối
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Reset thông báo lỗi cũ
        setErrorMsg('');

        // 2. KIỂM TRA ĐẦU VÀO (VALIDATION)
        // Dùng .trim() để loại bỏ dấu cách thừa, tránh trường hợp người dùng chỉ nhập dấu cách
        const user = formData.userName.trim();
        const pass = formData.password.trim();

        if (!user && !pass) {
            setErrorMsg("⚠️ Vui lòng nhập Tên đăng nhập và Mật khẩu!");
            return; // Dừng ngay, không gửi gì lên server
        }

        if (!user) {
            setErrorMsg("⚠️ Bạn chưa nhập Tên đăng nhập!");
            return;
        }

        if (!pass) {
            setErrorMsg("⚠️ Bạn chưa nhập Mật khẩu!");
            return;
        }

        // 3. Nếu đã nhập đủ thì mới bắt đầu Loading và gọi API
        setIsLoading(true);

        try {
            const res = await login(formData);

            if (res.success) {
                const roles = res.roles || [];

                // Kiểm tra tài khoản rỗng quyền
                if (roles.length === 0) {
                    setIsLoading(false);
                    setErrorMsg("⚠️ Cảnh báo: Tài khoản này chưa được cấp quyền!");
                    return;
                }

                // Kiểm tra quyền Admin/Staff
                const hasAccess = roles.some(r => {
                    const roleName = typeof r === 'string' ? r : (r.authority || '');
                    return roleName.includes('ADMIN') || roleName.includes('STAFF');
                });

                if (hasAccess) {
                    // === ĐÚNG: VÀO ADMIN ===
                    if (res.token) localStorage.setItem('token', res.token);
                    localStorage.setItem('roles', JSON.stringify(roles));
                    navigate('/admin/buildings');
                } else {
                    // === SAI QUYỀN: BÁO LỖI & ĐỨNG YÊN ===
                    setIsLoading(false);
                    setErrorMsg("⛔ Bạn không có quyền truy cập vào trang Quản Trị!");
                }
            } else {
                // === SAI TÀI KHOẢN / MẬT KHẨU ===
                setIsLoading(false);
                setErrorMsg(res.message || "❌ Tài khoản hoặc mật khẩu không đúng.");
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setErrorMsg("Lỗi kết nối Server. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Trang Quản Trị</h2>
                    <p>Hệ thống quản lý tòa nhà</p>
                </div>

                {/* Phần hiển thị lỗi */}
                {errorMsg && (
                    <div className="error-msg" style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#d9534f',
                        backgroundColor: '#f9d6d5',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="userName"
                            placeholder="Tên đăng nhập"
                            // Đã bỏ 'required' để dùng validate JS tùy chỉnh
                            autoFocus
                            value={formData.userName}
                            onChange={handleChange}
                        />
                        <FaUser className="input-icon" />
                    </div>

                    <div className="input-wrapper">
                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            // Đã bỏ 'required' để dùng validate JS tùy chỉnh
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