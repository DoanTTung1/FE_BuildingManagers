import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm navigate
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // Khởi tạo điều hướng

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

            // res ở đây chính là AuthResponse từ Backend
            if (res && res.token) {
                // 1. Lưu Token
                localStorage.setItem('token', res.token);

                // 2. Lưu thông tin User và Roles (Khớp với AuthResponse DTO)
                const userInfo = {
                    id: res.id,
                    userName: res.username, // Khớp với trường 'username' trong DTO
                    email: res.email,
                    roles: res.roles // Đây là List<String> ["ADMIN", ...]
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('roles', JSON.stringify(res.roles)); // Lưu riêng để dễ check

                setUser(userInfo);
                setIsModalOpen(false);

                // 3. LOGIC CHUYỂN HƯỚNG QUAN TRỌNG
                // Kiểm tra nếu roles có chứa ADMIN hoặc STAFF
                if (res.roles && (res.roles.includes("ADMIN") || res.roles.includes("STAFF"))) {
                    navigate('/admin/buildings'); // Chuyển thẳng vào Dashboard Admin
                } else {
                    navigate('/'); // Khách hàng bình thường thì ở lại trang chủ
                }

                return { success: true };
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
        localStorage.clear();
        setUser(null);
        navigate('/'); // Đăng xuất về trang chủ
    };

    return (
        <AuthContext.Provider value={{
            user, login, register: (data) => authApi.register(data),
            logout, isModalOpen,
            openModal: () => setIsModalOpen(true),
            closeModal: () => setIsModalOpen(false)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);