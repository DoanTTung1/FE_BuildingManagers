import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (formData) => {
        try {
            const res = await authApi.login(formData);

            // Kiểm tra dữ liệu trả về từ Backend
            if (res && res.token) {
                // 1. Lưu Token
                localStorage.setItem('token', res.token);

                // 2. Lưu thông tin User
                const userInfo = {
                    id: res.id,
                    userName: res.username,
                    email: res.email,
                    roles: res.roles || [] // Đảm bảo luôn là mảng
                };

                localStorage.setItem('user', JSON.stringify(userInfo));

                // Lưu roles riêng ra để AdminLayout dễ đọc (như chúng ta đã bàn)
                localStorage.setItem('roles', JSON.stringify(res.roles || []));

                setUser(userInfo);
                setIsModalOpen(false);

                // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---

                // A. Tắt chuyển hướng tự động tại đây. 
                // Lý do: Để LoginPage tự quyết định. Nếu Context tự chuyển trang, 
                // logic báo lỗi "Không có quyền" bên LoginPage sẽ không kịp chạy.
                /* if (res.roles && (res.roles.includes("ADMIN") || res.roles.includes("STAFF"))) {
                    navigate('/admin/buildings');
                } else {
                    navigate('/');
                }
                */

                // B. Trả về ĐẦY ĐỦ dữ liệu cho LoginPage dùng
                // Dùng ...res để bung toàn bộ dữ liệu (token, roles, id...) ra
                return {
                    success: true,
                    ...res,      // <-- Cực kỳ quan trọng: Trả lại roles cho LoginPage đọc
                    roles: res.roles // Gán cứng thêm lần nữa cho chắc ăn
                };
            }
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data || "Sai tài khoản hoặc mật khẩu!"
            };
        }
    };

    const logout = () => {
        localStorage.clear(); // Xóa sạch token, user, roles
        setUser(null);
        navigate('/'); // Đăng xuất xong về trang chủ
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register: (data) => authApi.register(data),
            logout,
            isModalOpen,
            openModal: () => setIsModalOpen(true),
            closeModal: () => setIsModalOpen(false)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);