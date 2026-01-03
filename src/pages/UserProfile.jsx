import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import EditProfileModal from '../components/EditProfileModal';
import {
    FaUserCircle, FaPhoneAlt, FaEnvelope, FaCheckCircle,
    FaExclamationTriangle, FaBuilding, FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaClock
} from 'react-icons/fa';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [myBuildings, setMyBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        if (user) fetchMyBuildings();
    }, [user]);

    const fetchMyBuildings = async () => {
        try {
            const res = await axiosClient.get('/api/buildings/my-posts');
            if (Array.isArray(res)) setMyBuildings(res);
            else if (res && res.data) setMyBuildings(res.data);
            else setMyBuildings([]);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
            try {
                await axiosClient.delete(`/api/buildings/${id}`);
                setMyBuildings(prev => prev.filter(item => item.id !== id));
            } catch (e) {
                alert("Xóa thất bại!");
            }
        }
    };

    if (!user) return <div className="loading-screen">Đang tải thông tin...</div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">

                {/* --- PHẦN TRÊN: CARD THÔNG TIN CÁ NHÂN --- */}
                <div className="profile-card">
                    {/* CỘT TRÁI: AVATAR + TÊN */}
                    <div className="profile-sidebar">
                        <div className="avatar-wrapper">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="avatar-img" />
                            ) : (
                                <FaUserCircle className="avatar-placeholder" />
                            )}
                        </div>
                        <h2 className="user-fullname">{user.fullName || user.username}</h2>
                        <span className={`user-role ${user.roles?.includes('ADMIN') ? 'role-admin' : 'role-user'}`}>
                            {user.roles?.includes('ADMIN') ? 'Administrator' : 'Thành Viên'}
                        </span>
                    </div>

                    {/* CỘT PHẢI: CHI TIẾT */}
                    <div className="profile-main">
                        <div className="profile-header">
                            <h3 className="section-heading">Hồ Sơ Cá Nhân</h3>
                            <div className="verification-badge">
                                {user.phoneVerified ? (
                                    <span className="badge verified"><FaCheckCircle /> Đã xác thực SĐT</span>
                                ) : (
                                    <span className="badge unverified"><FaExclamationTriangle /> Chưa xác thực SĐT</span>
                                )}
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <label>Tên đăng nhập</label>
                                <div className="info-value">{user.username}</div>
                            </div>
                            <div className="info-item">
                                <label>Họ và tên</label>
                                <div className="info-value">{user.fullName}</div>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <div className="info-value">
                                    <FaEnvelope className="icon" /> {user.email || "Chưa cập nhật"}
                                </div>
                            </div>
                            <div className="info-item">
                                <label>Số điện thoại</label>
                                <div className="info-value">
                                    <FaPhoneAlt className="icon" /> {user.phone || "Chưa cập nhật"}
                                </div>
                            </div>
                            <div className="info-item action-item">
                                <button className="btn-edit-profile" onClick={() => setIsEditOpen(true)}>
                                    Chỉnh sửa thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PHẦN DƯỚI: QUẢN LÝ TIN ĐĂNG --- */}
                <div className="building-section">
                    <div className="section-header-row">
                        <div className="title-box">
                            <FaBuilding className="title-icon" />
                            <h3>Tin Đăng Của Bạn</h3>
                            <span className="counter">{myBuildings.length}</span>
                        </div>
                        <Link to="/post-building" className="btn-create-new">
                            <FaPlus /> Đăng Tin Mới
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">Đang tải danh sách...</div>
                    ) : myBuildings.length === 0 ? (
                        <div className="empty-state">
                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" width="80" style={{ opacity: 0.5 }} />
                            <p>Bạn chưa có tin đăng nào.</p>
                        </div>
                    ) : (
                        <div className="building-grid">
                            {myBuildings.map(item => (
                                <div key={item.id} className="building-card">
                                    <div className="card-image">
                                        <img src={item.avatar || "https://via.placeholder.com/400x300"} alt={item.name} />

                                        {/* --- BADGE TRẠNG THÁI (BỔ SUNG) --- */}
                                        {item.status === 2 && (
                                            <div className="status-overlay pending">
                                                <FaClock /> Chờ duyệt
                                            </div>
                                        )}
                                        {item.status === 1 && (
                                            <div className="status-overlay active">
                                                <FaCheckCircle /> Đang hiện
                                            </div>
                                        )}
                                        {/* ---------------------------------- */}

                                        <div className="price-tag">${item.rentPrice}/m²</div>
                                    </div>

                                    <div className="card-content">
                                        <h4 className="card-title" onClick={() => navigate(`/building/${item.id}`)}>
                                            {item.name}
                                        </h4>
                                        <p className="card-address">
                                            <FaMapMarkerAlt /> {item.street}, {item.district}
                                        </p>

                                        <div className="card-actions">
                                            <button className="action-btn edit" onClick={() => navigate(`/admin/building-edit/${item.id}`)}>
                                                <FaEdit /> Sửa
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                                <FaTrash /> Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                currentUser={user}
                onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    );
};

export default UserProfile;