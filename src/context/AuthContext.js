import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý đóng/mở Modal

    // Kiểm tra xem đã đăng nhập chưa khi load trang
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user'); // Lưu tạm info user
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (formData) => {
        try {
            const res = await authApi.login(formData);
            // BE trả về: { token: "...", type: "Bearer" }
            if (res && res.token) {
                localStorage.setItem('token', res.token);
                
                // Vì API login hiện tại chưa trả về info user, ta lưu tạm username
                // Thực tế bạn nên decode JWT để lấy thông tin hoặc gọi thêm API /me
                const userInfo = { userName: formData.userName }; 
                localStorage.setItem('user', JSON.stringify(userInfo));
                
                setUser(userInfo);
                setIsModalOpen(false); // Đóng modal
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed:", error);
            return { 
                success: false, 
                message: error.response?.data || "Đăng nhập thất bại. Vui lòng kiểm tra lại!" 
            };
        }
    };

    const register = async (formData) => {
        try {
            const res = await authApi.register(formData);
            // Đăng ký xong thì tự động login luôn hoặc bắt đăng nhập lại
            // Ở đây mình trả về success để UI chuyển sang tab Login
            return { success: true, message: "Đăng ký thành công!" };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data || "Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại." 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
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