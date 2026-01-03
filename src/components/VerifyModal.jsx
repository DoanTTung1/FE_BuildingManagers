import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';
import '../styles/VerifyModal.css';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const VerifyModal = ({ isOpen, onClose, onVerifiedSuccess, userPhone, username }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setOtp("");
            handleResendOtp();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- 1. HÀM GỬI LẠI MÃ ---
    const handleResendOtp = async () => {
        try {
            await axiosClient.post(`/api/auth/send-otp?username=${username}`);
            toast.success("Mã OTP mới đã được gửi!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi gửi mã: " + (error.response?.data || "Server lỗi"));
        }
    };

    // --- 2. HÀM XÁC NHẬN ---
    const handleVerify = async () => {
        if (otp.length < 6) {
            toast.error("Vui lòng nhập đủ 6 số OTP");
            return;
        }

        setIsLoading(true);
        try {
            await axiosClient.post('/api/auth/verify-otp', {
                username: username,
                otp: otp
            });

            toast.success("Xác thực thành công!", {
                icon: '✅',
                style: {
                    borderRadius: '10px',
                    background: '#0f172a',
                    color: '#fff',
                },
            });

            onVerifiedSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            // Dùng toast thay vì alert để xóa cái hộp xám xấu xí
            toast.error(error.response?.data || "Mã OTP không chính xác!", {
                style: {
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#fff',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. PHẦN GIAO DIỆN (PHẢI NẰM NGOÀI HÀM HANDLEVERIFY) ---
    return (
        <div className="verify-overlay">
            <div className="verify-box">
                <button className="btn-close-verify" onClick={onClose}><FaTimes /></button>

                <div className="verify-icon">
                    <FaMobileAlt />
                </div>

                <h3 className="verify-title">Xác thực SĐT</h3>
                <p className="verify-desc">
                    Vui lòng nhập mã OTP đã gửi đến số <strong>{userPhone}</strong>
                </p>

                <div className="otp-input-group">
                    <input
                        type="text"
                        className="otp-input"
                        maxLength="6"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
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