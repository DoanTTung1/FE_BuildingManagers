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

    // Hàm dùng chung để lưu User và Token
    const saveAuthData = (res) => {
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
            return true;
        }
        return false;
    };

    const login = async (formData) => {
        try {
            const res = await authApi.login(formData);
            if (saveAuthData(res)) {
                return { success: true, ...res };
            }
        } catch (error) {
            return { success: false, message: error.response?.data || "Sai tài khoản hoặc mật khẩu!" };
        }
    };

    const register = async (formData) => {
        try {
            const res = await authApi.register(formData);
            saveAuthData(res);
            return { success: true, ...res };
        } catch (error) {
            return { success: false, message: error.response?.data || "Đăng ký thất bại!" };
        }
    };

    // --- 3. BỔ SUNG: ĐĂNG NHẬP GOOGLE ---
    const loginWithGoogle = async (googleToken) => {
        try {
            // Gửi token của Google xuống BE
            const res = await authApi.loginWithGoogle(googleToken);
            if (saveAuthData(res)) {
                return { success: true, ...res };
            }
        } catch (error) {
            return { success: false, message: error.response?.data || "Đăng nhập Google thất bại!" };
        }
    };

    // --- 4. BỔ SUNG: QUÊN MẬT KHẨU ---
    const forgotPassword = async (email) => {
        try {
            // Gọi API quên mật khẩu đã viết ở BE
            await authApi.forgotPassword(email);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data || "Gửi yêu cầu thất bại!" };
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            register,
            loginWithGoogle, // Bổ sung để AuthModal gọi được
            forgotPassword,  // Bổ sung để AuthModal gọi được
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