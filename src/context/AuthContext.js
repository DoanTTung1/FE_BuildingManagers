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

    // Hàm helper để lấy thông báo lỗi an toàn (tránh sập app)
    const getErrorMessage = (error, defaultMessage) => {
        // Nếu server trả về object có field message thì lấy nó
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        // Nếu server trả về string trực tiếp (ít gặp)
        if (typeof error.response?.data === 'string') {
            return error.response.data;
        }
        return defaultMessage;
    };

    const login = async (formData) => {
        try {
            const res = await authApi.login(formData);
            if (saveAuthData(res)) {
                return { success: true, ...res };
            }
        } catch (error) {
            // Đã sửa: Dùng hàm getErrorMessage để lấy string
            return { success: false, message: getErrorMessage(error, "Sai tài khoản hoặc mật khẩu!") };
        }
    };

    const register = async (formData) => {
        try {
            const res = await authApi.register(formData);
            saveAuthData(res);
            return { success: true, ...res };
        } catch (error) {
            // Đã sửa
            return { success: false, message: getErrorMessage(error, "Đăng ký thất bại!") };
        }
    };

    const loginWithGoogle = async (googleToken) => {
        try {
            const res = await authApi.loginWithGoogle(googleToken);
            if (saveAuthData(res)) {
                return { success: true, ...res };
            }
        } catch (error) {
            // Đã sửa
            return { success: false, message: getErrorMessage(error, "Đăng nhập Google thất bại!") };
        }
    };

    // --- SỬA CHÍNH: QUÊN MẬT KHẨU ---
    const forgotPassword = async (email) => {
        try {
            const res = await authApi.forgotPassword(email);
            // Nếu API trả về data, return nó để AuthModal hứng (chứa message success)
            return { success: true, message: res.message || "Đã gửi mail thành công!" };
        } catch (error) {
            // Đã sửa: Lấy message từ object data thay vì lấy cả object
            return {
                success: false,
                message: getErrorMessage(error, "Gửi yêu cầu thất bại!")
            };
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
            loginWithGoogle,
            forgotPassword,
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