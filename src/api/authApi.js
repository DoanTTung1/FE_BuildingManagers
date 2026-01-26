import axiosClient from "./axiosClient";

const authApi = {
    // 1. Đăng nhập
    login: (data) => {
        // data truyền vào: { username, password }
        return axiosClient.post('/api/auth/login', data);
    },

    // 2. Đăng ký
    register: (data) => {
        // data truyền vào: { username, password, fullName, email, phone }
        return axiosClient.post('/api/auth/register', data);
    },

    // 3. Gửi OTP (Bổ sung để VerifyModal dùng được)
    sendOtp: (username) => {
        // Gửi qua Query Parameter ?username=...
        return axiosClient.post(`/api/auth/send-otp?username=${username}`);
    },

    // 4. Xác nhận OTP
    verifyOtp: (data) => {
        // data truyền vào: { username, otp }
        return axiosClient.post('/api/auth/verify-otp', data);
    },

    // ==========================================
    // --- BỔ SUNG MỚI ĐỂ KHỚP VỚI BACKEND ---
    // ==========================================

    // 5. Quên mật khẩu
    forgotPassword: (email) => {
        // Truyền email qua Query Parameter
        return axiosClient.post(`/api/auth/forgot-password?email=${email}`);
    },

    // 6. Đăng nhập Google
    loginWithGoogle: (token) => {
        // Gửi Body JSON: { "token": "..." }
        return axiosClient.post('/api/auth/google', { token });
    }
};

export default authApi;