import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi'; // Đảm bảo bạn có file này gọi axiosClient

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Load lại user khi F5 trang
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (formData) => {
        try {
            // Gọi API đăng nhập
            const res = await authApi.login(formData);

            if (res && res.token) {
                // 1. Lưu Token
                localStorage.setItem('token', res.token);

                // 2. Chuẩn bị thông tin User để lưu
                // Backend trả về 'username' hay 'userName' thì bạn map cho đúng vào đây
                const userInfo = {
                    id: res.id,
                    username: res.username,
                    fullName: res.fullName || res.username,
                    email: res.email,
                    phone: res.phone,
                    avatar: res.avatar, // Lưu thêm avatar
                    roles: res.roles || [],
                    phoneVerified: res.phoneVerified // Quan trọng cho dấu tích xanh
                };

                // 3. Lưu vào LocalStorage và State
                localStorage.setItem('user', JSON.stringify(userInfo));
                setUser(userInfo);

                // Đóng modal đăng nhập
                setIsModalOpen(false);

                return { success: true, ...res };
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
        localStorage.clear(); // Xóa sạch token và user
        setUser(null);
        navigate('/'); // Quay về trang chủ
    };

    // Hàm này để Modal Update Profile gọi sau khi lưu thành công
    // Giúp Header cập nhật avatar/tên ngay lập tức
    const updateUser = (newUserData) => {
        // Giữ lại token cũ, chỉ update thông tin user
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser: updateUser, // Export hàm này để các Component con dùng
            login,
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