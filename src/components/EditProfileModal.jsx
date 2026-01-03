import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaPhone, FaCamera, FaIdBadge, FaLock } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/UserProfile.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({ username: '', fullName: '', email: '', phone: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser && isOpen) {
            setFormData({
                username: currentUser.username || '',
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || ''
            });
            setAvatarFile(null);
            setPreviewAvatar(currentUser.avatar || null);
        }
    }, [currentUser, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("Ảnh > 5MB! Vui lòng chọn ảnh nhỏ hơn.");
                return;
            }
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.fullName.trim()) return toast.warning("Chưa nhập họ tên!");
        setLoading(true);
        const toastId = toast.loading("Đang lưu...");

        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('username', formData.username);
            if (avatarFile) data.append('avatarFile', avatarFile);

            const res = await axiosClient.post('/api/users/profile/update', data);
            if (res) setUser(res);

            toast.update(toastId, { render: "Đã lưu thành công! 🎉", type: "success", isLoading: false, autoClose: 1500 });
            if (onUpdateSuccess) onUpdateSuccess(res);
            setTimeout(() => onClose(), 1000);
        } catch (error) {
            console.error(error);
            toast.update(toastId, { render: "Lỗi cập nhật!", type: "error", isLoading: false, autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <ToastContainer position="top-right" autoClose={2000} theme="colored" style={{ zIndex: 99999 }} />

            <div className="glass-modal">
                {/* 1. NÚT X ĐẸP - TRÔI NỔI GÓC PHẢI */}
                <button className="btn-close-floating" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-content-clean">
                    {/* 2. AVATAR LÀM TRUNG TÂM */}
                    <div className="avatar-hero">
                        <div className="avatar-ring">
                            {previewAvatar ? <img src={previewAvatar} alt="Avatar" /> : <FaUser className="default-icon" />}
                            <label htmlFor="avatarInput" className="btn-cam-float"><FaCamera /></label>
                            <input id="avatarInput" type="file" accept="image/*" hidden onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* 3. FORM GỌN GÀNG */}
                    <div className="clean-form-grid">
                        <div className="clean-input-group full">
                            <label>Tên đăng nhập</label>
                            <div className="clean-input disabled">
                                <FaIdBadge className="c-icon" />
                                <input type="text" value={formData.username} disabled />
                                <FaLock className="lock-mini" />
                            </div>
                        </div>

                        <div className="clean-input-group">
                            <label>Họ và tên</label>
                            <div className="clean-input">
                                <FaUser className="c-icon" />
                                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Họ tên" />
                            </div>
                        </div>

                        <div className="clean-input-group">
                            <label>Số điện thoại</label>
                            <div className="clean-input">
                                <FaPhone className="c-icon" />
                                <input type="tel" value={formData.phone} onChange={(e) => /^[0-9\s+]*$/.test(e.target.value) && setFormData({ ...formData, phone: e.target.value })} placeholder="SĐT" />
                            </div>
                        </div>

                        <div className="clean-input-group full">
                            <label>Email</label>
                            <div className="clean-input">
                                <FaEnvelope className="c-icon" />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER */}
                <div className="modal-footer-clean">
                    <button className="btn-cancel-clean" onClick={onClose}>Hủy</button>
                    <button className="btn-save-clean" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang lưu..." : <><FaSave /> Lưu thông tin</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;