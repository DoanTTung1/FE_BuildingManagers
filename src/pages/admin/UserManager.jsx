import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FaTrash, FaUserPlus, FaUserShield } from 'react-icons/fa';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // State form tạo nhân viên mới
    const [newStaff, setNewStaff] = useState({
        userName: '', fullName: '', password: '', email: '', phone: '', status: 1
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get('/api/users');
            setUsers(res);
        } catch (error) {
            console.error("Lỗi tải user:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa user này?")) {
            try {
                await axiosClient.delete(`/api/users/${id}`);
                alert("Xóa thành công!");
                fetchUsers();
            } catch (error) {
                alert("Lỗi khi xóa!");
            }
        }
    };

    const handleCreateStaff = async () => {
        try {
            // BE cần xử lý thêm password và set Role ADMIN/STAFF ở Backend nếu dùng DTO này
            await axiosClient.post('/api/users', newStaff);
            alert("Tạo nhân viên thành công!");
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            alert("Lỗi tạo nhân viên!");
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h2>Quản Lý Người Dùng</h2>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <FaUserPlus /> Thêm Nhân Viên
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Họ Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.userName}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    {user.roleCodes && user.roleCodes.map(role => (
                                        <span key={role} style={{ marginRight: 5, background: '#e0e7ff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{role}</span>
                                    ))}
                                </td>
                                <td>
                                    <button className="btn-action btn-delete" onClick={() => handleDelete(user.id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm Nhân Viên */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Thêm Nhân Viên Mới</h3>
                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            <input type="text" placeholder="Username" className="form-control"
                                onChange={e => setNewStaff({ ...newStaff, userName: e.target.value })} />
                            <input type="text" placeholder="Họ tên" className="form-control"
                                onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })} />
                            {/* Lưu ý: API UserDTO của bạn chưa thấy trường password, cần bổ sung ở BE nếu muốn tạo login */}
                            <input type="email" placeholder="Email" className="form-control"
                                onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                            <input type="text" placeholder="SĐT" className="form-control"
                                onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)} className="btn-cancel">Hủy</button>
                            <button onClick={handleCreateStaff} className="btn-add">Tạo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;