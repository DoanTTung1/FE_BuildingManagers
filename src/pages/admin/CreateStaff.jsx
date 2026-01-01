import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard, FaSave, FaArrowLeft, FaUserShield } from 'react-icons/fa';

const CreateStaff = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State form khớp với các trường cần thiết
    const [formData, setFormData] = useState({
        userName: '',
        password: '', 
        fullName: '',
        email: '',
        phone: '',
        role: 'STAFF' // Mặc định chọn STAFF
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // --- CHUẨN BỊ DỮ LIỆU GỬI ĐI (Payload) ---
            const payload = {
                // 1. Các trường khớp tên trong UserDTO
                userName: formData.userName,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,

                // 2. Trường status (Integer)
                status: 1, // 1 = Active

                // 3. Xử lý List<String> roleCodes
                roleCodes: [formData.role], // Đóng gói role đơn thành mảng

                // 4. Mật khẩu (LƯU Ý: UserDTO bên Java cần có field này)
                password: formData.password
            };

            // Gọi API: POST /api/users
            await axiosClient.post('/api/users', payload);

            setMessage({ type: 'success', text: 'Tạo nhân viên thành công!' });

            // Chuyển hướng sau 1.5s
            setTimeout(() => {
                navigate('/admin/users');
            }, 1500);

        } catch (error) {
            console.error("Lỗi API:", error);
            // Lấy thông báo lỗi chi tiết từ Backend
            const errorMsg = error.response?.data?.message || 'Lỗi hệ thống. Vui lòng thử lại!';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in-up">
            {/* Header */}
            <div className="admin-header">
                <h2>Thêm Nhân Viên Mới</h2>
                <button className="btn-back" onClick={() => navigate('/admin/users')}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>

            {/* Form Container (Giao diện Luxury) */}
            <div className="form-card-container">
                {/* Thông báo */}
                {message.text && (
                    <div className={`alert-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                        {/* Cột Trái */}
                        <div className="form-column">
                            <div className="form-group">
                                <label><FaUser /> Tên đăng nhập</label>
                                <input
                                    type="text" name="userName" className="form-control-admin"
                                    placeholder="Ví dụ: staff_01"
                                    value={formData.userName} onChange={handleChange} required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaLock /> Mật khẩu</label>
                                <input
                                    type="password" name="password" className="form-control-admin"
                                    placeholder="Nhập mật khẩu đăng nhập..."
                                    value={formData.password} onChange={handleChange} required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaIdCard /> Họ và tên</label>
                                <input
                                    type="text" name="fullName" className="form-control-admin"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        {/* Cột Phải */}
                        <div className="form-column">
                            <div className="form-group">
                                <label><FaEnvelope /> Email</label>
                                <input
                                    type="email" name="email" className="form-control-admin"
                                    placeholder="staff@email.com"
                                    value={formData.email} onChange={handleChange} required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaPhone /> Số điện thoại</label>
                                <input
                                    type="tel" name="phone" className="form-control-admin"
                                    placeholder="0912..."
                                    value={formData.phone} onChange={handleChange} required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaUserShield /> Phân quyền</label>
                                <select
                                    name="role" className="form-control-admin"
                                    value={formData.role} onChange={handleChange}
                                >
                                    <option value="STAFF">Nhân Viên (Staff)</option>
                                    <option value="ADMIN">Quản Trị Viên (Admin)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : <><FaSave /> Lưu Hồ Sơ</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStaff;