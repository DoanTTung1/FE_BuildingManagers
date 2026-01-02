import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import EditProfileModal from '../components/EditProfileModal';
import {
    FaUserCircle, FaPhoneAlt, FaEnvelope, FaCheckCircle,
    FaExclamationTriangle, FaBuilding, FaMapMarkerAlt, FaEdit, FaTrash, FaPlus
} from 'react-icons/fa';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [myBuildings, setMyBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false); // State mở modal

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

    if (!user) return <div style={{ paddingTop: '150px', textAlign: 'center' }}>Đang tải...</div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">

                <div className="profile-card">
                    {/* CỘT TRÁI: AVATAR + TÊN */}
                    <div className="profile-sidebar">
                        <div className="up-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" />
                            ) : (
                                <FaUserCircle />
                            )}
                        </div>
                        <h2 className="up-name">{user.fullName || user.username}</h2>
                        <span className="up-role">
                            {user.roles?.includes('ADMIN') ? 'Quản Trị Viên' : 'Thành Viên'}
                        </span>
                    </div>

                    {/* CỘT PHẢI: CHI TIẾT */}
                    <div className="profile-details">
                        <div className="up-header-row">
                            <h3 className="up-title">Thông Tin Cá Nhân</h3>
                            {user.phoneVerified ? (
                                <span className="up-badge verified"><FaCheckCircle /> ĐÃ XÁC THỰC</span>
                            ) : (
                                <span className="up-badge unverified"><FaExclamationTriangle /> CHƯA XÁC THỰC</span>
                            )}
                        </div>

                        <div className="up-form-grid">
                            <div className="up-group">
                                <label>Tên đăng nhập</label>
                                <input className="up-input" type="text" value={user.username || ''} disabled />
                            </div>
                            <div className="up-group">
                                <label>Họ và tên</label>
                                <input className="up-input" type="text" value={user.fullName || ''} disabled />
                            </div>
                            <div className="up-group">
                                <label>Email</label>
                                <div className="up-input-wrapper">
                                    <input className="up-input" type="text" value={user.email || ''} disabled />
                                    <FaEnvelope className="up-icon-right" />
                                </div>
                            </div>
                            <div className="up-group">
                                <label>Số điện thoại</label>
                                <div className="up-input-wrapper">
                                    <input className="up-input" type="text" value={user.phone || ''} placeholder="Chưa cập nhật" disabled />
                                    <FaPhoneAlt className="up-icon-right" />
                                </div>
                            </div>

                            <div className="up-actions">
                                <button className="up-btn-save" onClick={() => setIsEditOpen(true)}>
                                    Cập nhật thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DANH SÁCH TÒA NHÀ */}
                <div className="my-buildings-section">
                    <div className="section-head">
                        <div className="head-title">
                            <FaBuilding /> Quản lý tin đăng
                            <span className="count-tag">{myBuildings.length}</span>
                        </div>
                        <Link to="/post-building" className="btn-new-post">
                            <FaPlus /> Đăng tin mới
                        </Link>
                    </div>

                    {isLoading ? <p style={{ textAlign: 'center' }}>Đang tải...</p> :
                        myBuildings.length === 0 ? <div className="empty-box"><p>Bạn chưa đăng tòa nhà nào.</p></div> :
                            (
                                <div className="mini-grid">
                                    {myBuildings.map(item => (
                                        <div key={item.id} className="mini-item">
                                            <div className="mini-img-box">
                                                <img src={item.avatar || "https://via.placeholder.com/400x300"} alt={item.name} />
                                                <span className="mini-price">${item.rentPrice}/m²</span>
                                            </div>
                                            <div className="mini-body">
                                                <h4 className="mini-h4" onClick={() => navigate(`/building/${item.id}`)}>{item.name}</h4>
                                                <div className="mini-addr"><FaMapMarkerAlt /> {item.street}, {item.district}</div>
                                                <div className="mini-btns">
                                                    <button className="m-btn m-edit" onClick={() => navigate(`/admin/building-edit/${item.id}`)}><FaEdit /> Sửa</button>
                                                    <button className="m-btn m-del" onClick={() => handleDelete(item.id)}><FaTrash /> Xóa</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                </div>
            </div>

            {/* MODAL EDIT */}
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