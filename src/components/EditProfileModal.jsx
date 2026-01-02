import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaPhone, FaCamera, FaIdBadge } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/UserProfile.css';

// --- IMPORT THƯ VIỆN TOAST ---
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// -----------------------------

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: ''
    });

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
            // Kiểm tra dung lượng ảnh (VD: giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
                return;
            }
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        // Validate cơ bản
        if (!formData.fullName.trim()) {
            toast.warning("Vui lòng nhập họ tên!");
            return;
        }

        setLoading(true);
        // Toast ID để cập nhật trạng thái (loading -> success)
        const toastId = toast.loading("Đang cập nhật hồ sơ...");

        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('username', formData.username);

            if (avatarFile) {
                data.append('avatarFile', avatarFile);
            }

            const res = await axiosClient.post('/api/users/profile/update', data);

            // Cập nhật thông báo thành công
            toast.update(toastId, {
                render: "Cập nhật hồ sơ thành công! 🎉",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });

            onUpdateSuccess(res);

            // Đợi 1.5s cho người dùng đọc thông báo rồi mới đóng Modal
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error(error);
            // Cập nhật thông báo thất bại
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
        <div className="verify-overlay">
            {/* CONTAINER CHỨA THÔNG BÁO (Luôn nằm trên cùng) */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{ zIndex: 99999 }} // Đảm bảo nổi lên trên Modal
            />

            <div className="verify-box" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <button className="btn-close-verify" onClick={onClose}><FaTimes /></button>

                <h3 className="verify-title" style={{ marginTop: '10px' }}>Chỉnh sửa hồ sơ</h3>

                {/* Upload Ảnh */}
                <div className="avatar-upload-area">
                    <div className="avatar-preview-circle">
                        {previewAvatar ? (
                            <img src={previewAvatar} alt="Avatar" />
                        ) : (
                            <FaUser size={40} color="#cbd5e1" />
                        )}
                        <label htmlFor="avatarInput" className="camera-btn">
                            <FaCamera />
                        </label>
                        <input
                            id="avatarInput"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <span className="upload-hint">Nhấn vào máy ảnh để đổi avatar</span>
                </div>

                {/* Form Inputs */}
                <div style={{ textAlign: 'left' }}>

                    {/* 1. Tên đăng nhập (ĐÃ KHÓA) */}
                    <div className="input-row">
                        <label>Tên đăng nhập</label>
                        <div className="icon-input-box">
                            <FaIdBadge className="field-icon" />
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                            />
                        </div>
                        <small style={{ color: 'red', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>
                            * Tên đăng nhập không được thay đổi
                        </small>
                    </div>

                    {/* 2. Họ tên */}
                    <div className="input-row">
                        <label>Họ và tên</label>
                        <div className="icon-input-box">
                            <FaUser className="field-icon" />
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 3. Email */}
                    <div className="input-row">
                        <label>Email</label>
                        <div className="icon-input-box">
                            <FaEnvelope className="field-icon" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 4. Số điện thoại (CHỈ NHẬP SỐ & DẤU CÁCH) */}
                    <div className="input-row">
                        <label>Số điện thoại</label>
                        <div className="icon-input-box">
                            <FaPhone className="field-icon" />
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                maxLength={15}
                                placeholder="Nhập số điện thoại"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Cho phép số, khoảng trắng và dấu +
                                    if (/^[0-9\s+]*$/.test(val)) {
                                        setFormData({ ...formData, phone: val });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* NÚT LƯU */}
                <button
                    className="up-btn-save"
                    style={{ width: '100%', marginTop: '20px' }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : <><FaSave /> Lưu thay đổi</>}
                </button>
            </div>
        </div>
    );
};

export default EditProfileModal;