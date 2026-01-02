import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';
import '../styles/VerifyModal.css';
import axiosClient from '../api/axiosClient';

// Thêm prop 'username' để gửi kèm request
const VerifyModal = ({ isOpen, onClose, onVerifiedSuccess, userPhone, username }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reset OTP khi mở modal
    useEffect(() => {
        if (isOpen) {
            setOtp("");
            // Tùy chọn: Tự động gửi OTP ngay khi mở Modal
            handleResendOtp();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- 1. HÀM GỬI LẠI MÃ (GỌI API SEND-OTP) ---
    const handleResendOtp = async () => {
        try {
            // Gọi API Backend: POST /api/auth/send-otp?username=...
            await axiosClient.post(`/api/auth/send-otp?username=${username}`);
            // alert("Đã gửi mã OTP mới! (Check Log Server)"); // Bỏ comment nếu muốn hiện thông báo
        } catch (error) {
            console.error(error);
            alert("Lỗi khi gửi mã: " + (error.response?.data || "Lỗi Server"));
        }
    };

    // --- 2. HÀM XÁC NHẬN (GỌI API VERIFY-OTP) ---
    const handleVerify = async () => {
        if (otp.length < 6) {
            alert("Vui lòng nhập đủ 6 số OTP");
            return;
        }

        setIsLoading(true);
        try {
            // Gọi API Backend: POST /api/auth/verify-otp
            // Body: { username: "...", otp: "..." }
            await axiosClient.post('/api/auth/verify-otp', {
                username: username,
                otp: otp
            });

            alert("Xác thực thành công!");
            onVerifiedSuccess(); // Báo cho Header biết đã xong
            onClose(); // Đóng Modal

        } catch (error) {
            console.error(error);
            // Hiển thị thông báo lỗi từ Backend trả về
            alert(error.response?.data || "Mã OTP không chính xác hoặc đã hết hạn!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="verify-overlay">
            <div className="verify-box">
                <button className="btn-close-verify" onClick={onClose}><FaTimes /></button>

                <div className="verify-icon">
                    <FaMobileAlt />
                </div>

                <h3 className="verify-title">Xác thực SĐT</h3>
                <p className="verify-desc">
                    Vui lòng nhập mã OTP (lấy trong <strong>Log Server</strong>) đã gửi đến số <strong>{userPhone}</strong>
                </p>

                <div className="otp-input-group">
                    <input
                        type="text" className="otp-input" maxLength="6"
                        placeholder="______"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>

                <button className="btn-verify-action" onClick={handleVerify} disabled={isLoading}>
                    {isLoading ? "Đang kiểm tra..." : "Xác nhận ngay"}
                </button>

                <span className="resend-link" onClick={handleResendOtp}>
                    Chưa nhận được mã? <strong>Gửi lại ngay</strong>
                </span>
            </div>
        </div>
    );
};

export default VerifyModal;