import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaPhone, FaCamera, FaIdBadge, FaLock } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/UserProfile.css';

// Toast Notification
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- QUAN TRỌNG: Import useAuth để cập nhật state toàn cục ---
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    // 1. Lấy hàm setUser từ AuthContext
    const { setUser } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load dữ liệu khi mở Modal
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

    // Xử lý chọn ảnh
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Giới hạn 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
                return;
            }
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    // Xử lý Submit
    const handleSubmit = async () => {
        // Validate cơ bản
        if (!formData.fullName.trim()) {
            toast.warning("Vui lòng nhập họ tên!");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Đang cập nhật hồ sơ...");

        try {
            // Chuẩn bị dữ liệu gửi đi
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('username', formData.username);

            if (avatarFile) {
                data.append('avatarFile', avatarFile);
            }

            // Gọi API
            const res = await axiosClient.post('/api/users/profile/update', data);

            // --- CẬP NHẬT CONTEXT VÀ LOCALSTORAGE NGAY LẬP TỨC ---
            // res là UserDTO mới trả về từ server
            if (res) {
                setUser(res);
            }
            // -----------------------------------------------------

            toast.update(toastId, {
                render: "Cập nhật thành công! 🎉",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });

            // Callback ra ngoài (nếu component cha cần)
            if (onUpdateSuccess) onUpdateSuccess(res);

            // Đóng Modal sau 1.5s
            setTimeout(() => onClose(), 1500);

        } catch (error) {
            console.error(error);
            toast.update(toastId, {
                render: error.response?.data?.message || "Lỗi: Không thể cập nhật!",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Toast Container riêng cho Modal để hiển thị nổi lên trên */}
            <ToastContainer
                position="top-right" autoClose={3000} theme="colored" style={{ zIndex: 99999 }}
            />

            <div className="glass-modal">
                {/* HEADER */}
                <div className="modal-header">
                    <div className="header-text">
                        <h3>Chỉnh sửa hồ sơ</h3>
                        <p>Cập nhật thông tin cá nhân của bạn</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    {/* 1. KHU VỰC AVATAR */}
                    <div className="avatar-section">
                        <div className="avatar-circle-glass">
                            {previewAvatar ? (
                                <img src={previewAvatar} alt="Avatar" />
                            ) : (
                                <FaUser className="default-avatar-icon" />
                            )}
                            <label htmlFor="avatarInput" className="camera-btn-glass">
                                <FaCamera />
                            </label>
                            <input id="avatarInput" type="file" accept="image/*" hidden onChange={handleFileChange} />
                        </div>
                        <span className="upload-hint">Chạm để thay đổi ảnh đại diện</span>
                    </div>

                    {/* 2. FORM NHẬP LIỆU (GRID LAYOUT) */}
                    <div className="form-grid-layout">

                        {/* Tên đăng nhập (Full Width - Read Only) */}
                        <div className="form-group full-width">
                            <label>Tên đăng nhập</label>
                            <div className="input-glass-box disabled">
                                <FaIdBadge className="field-icon" />
                                <input type="text" value={formData.username} disabled />
                                <FaLock className="lock-icon" />
                            </div>
                        </div>

                        {/* Họ tên */}
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <div className="input-glass-box">
                                <FaUser className="field-icon" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Nhập họ tên"
                                />
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <div className="input-glass-box">
                                <FaPhone className="field-icon" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    placeholder="090..."
                                    onChange={(e) => {
                                        // Chỉ cho phép nhập số
                                        if (/^[0-9\s+]*$/.test(e.target.value)) {
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email (Full Width) */}
                        <div className="form-group full-width">
                            <label>Địa chỉ Email</label>
                            <div className="input-glass-box">
                                <FaEnvelope className="field-icon" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="btn-cancel-glass" onClick={onClose}>Hủy</button>
                    <button className="btn-save-gradient" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang lưu..." : <><FaSave /> Lưu Thay Đổi</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;