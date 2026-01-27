// ... import giữ nguyên

const CreateStaff = () => {
    // ...
    const [formData, setFormData] = useState({
        username: '', // Sửa userName -> username (viết thường hết)
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'STAFF'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // --- CHUẨN BỊ PAYLOAD KHỚP VỚI JAVA USERDTO ---
            const payload = {
                // 1. Khớp tên trường trong UserDTO
                username: formData.username, // SỬA LẠI: dùng 'username'
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                status: 1, // Active

                // 2. Sửa 'roleCodes' thành 'roles' để khớp DTO
                roles: [formData.role],

                // 3. Các trường khác (nếu cần)
                avatar: "https://placehold.co/150x150?text=Staff", // Ảnh mặc định
                phoneVerified: false
            };

            await axiosClient.post('/api/users', payload);

            setMessage({ type: 'success', text: 'Tạo nhân viên thành công!' });
            setTimeout(() => { navigate('/admin/users'); }, 1500);

        } catch (error) {
            console.error("Lỗi API:", error);
            const errorMsg = error.response?.data || 'Lỗi hệ thống. Vui lòng thử lại!';
            // Lưu ý: Backend trả về string trực tiếp nên lấy error.response.data
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : "Có lỗi xảy ra" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in-up">
            {/* ... Phần Header giữ nguyên ... */}

            <div className="form-card-container">
                {/* ... Phần Message giữ nguyên ... */}

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                        <div className="form-column">
                            {/* --- CẬP NHẬT NAME CỦA INPUT --- */}
                            <div className="form-group">
                                <label><FaUser /> Tên đăng nhập</label>
                                <input
                                    type="text"
                                    name="username" // Sửa name="userName" -> name="username"
                                    className="form-control-admin"
                                    placeholder="Ví dụ: staff_01"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Các ô input khác (password, fullName) giữ nguyên tên vì đã khớp */}
                            <div className="form-group">
                                <label><FaLock /> Mật khẩu</label>
                                <input
                                    type="password" name="password" className="form-control-admin"
                                    placeholder="Nhập mật khẩu..."
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

                        <div className="form-column">
                            {/* Các ô bên phải giữ nguyên */}
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