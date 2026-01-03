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

    // --- 1. HÀM ĐĂNG NHẬP ---
    const login = async (formData) => {
        try {
            const res = await authApi.login(formData);
            if (res && res.token) {
                localStorage.setItem('token', res.token);
                const userInfo = {
                    id: res.id,
                    username: res.username,
                    fullName: res.fullName || res.username,
                    email: res.email,
                    phone: res.phone,
                    avatar: res.avatar,
                    roles: res.roles || [],
                    phoneVerified: res.phoneVerified
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
                setUser(userInfo);
                setIsModalOpen(false);
                return { success: true, ...res };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data || "Sai tài khoản hoặc mật khẩu!"
            };
        }
    };

    // --- 2. HÀM ĐĂNG KÝ (BỔ SUNG ĐỂ HẾT LỖI) ---
    const register = async (formData) => {
        try {
            const res = await authApi.register(formData);

            // Nếu đăng ký xong Backend trả về token luôn (Auto login)
            if (res && res.token) {
                localStorage.setItem('token', res.token);
                const userInfo = {
                    id: res.id,
                    username: res.username,
                    fullName: res.fullName,
                    email: res.email,
                    phone: res.phone,
                    roles: res.roles || ["USER"],
                    phoneVerified: false // Mới đăng ký nên chưa verify
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
                setUser(userInfo);
            }
            return { success: true, ...res };
        } catch (error) {
            console.error("Register Error:", error);
            return {
                success: false,
                message: error.response?.data || "Đăng ký thất bại!"
            };
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser: updateUser,
            login,
            register, // <-- Giờ dòng này sẽ hết lỗi vì đã có hàm ở trên
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