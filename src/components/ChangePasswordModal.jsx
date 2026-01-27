import React, { useState } from 'react';
import authApi from '../api/authApi';
import toast from 'react-hot-toast';
import { FaLock, FaTimes, FaSave, FaKey } from 'react-icons/fa'; 

// Import file CSS riêng biệt
import '../styles/ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải từ 6 ký tự trở lên!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authApi.changePassword(formData);
            if (res && (res.success || res.message)) {
                toast.success(res.message || "Đổi mật khẩu thành công!");
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                onClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Đổi mật khẩu thất bại!";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Đổi class thành cp-modal-overlay
        <div className="cp-modal-overlay" onClick={onClose}>
            {/* Đổi class thành cp-modal-container */}
            <div className="cp-modal-container" onClick={(e) => e.stopPropagation()}>
                
                <button className="cp-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2 className="cp-modal-title">Đổi Mật Khẩu</h2>
                
                <form onSubmit={handleSubmit} className="cp-form">
                    
                    <div className="cp-input-group">
                        <FaKey className="icon" /> 
                        <input 
                            type="password" 
                            name="currentPassword" 
                            placeholder="Mật khẩu hiện tại" 
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="cp-input-group">
                        <FaLock className="icon" />
                        <input 
                            type="password" 
                            name="newPassword" 
                            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="cp-input-group">
                        <FaLock className="icon" />
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            placeholder="Nhập lại mật khẩu mới" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="cp-btn-submit" disabled={isLoading}>
                        {isLoading ? (
                            <span>Đang xử lý...</span>
                        ) : (
                            <><FaSave style={{ marginRight: '8px' }} /> Xác nhận thay đổi</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;