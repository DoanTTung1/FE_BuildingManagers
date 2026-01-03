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
    }
};

export default authApi;