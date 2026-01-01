import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FaTrash, FaUserPlus, FaEdit, FaUserShield, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserManager = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            // Giả sử API trả về mảng user trực tiếp hoặc res.data
            const res = await axiosClient.get('/api/users');
            setUsers(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Lỗi tải user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa nhân viên này?")) {
            try {
                await axiosClient.delete(`/api/users/${id}`); // Hoặc api delete tương ứng
                // Xóa thành công thì lọc bỏ item đó khỏi state để đỡ phải load lại trang
                setUsers(prev => prev.filter(u => u.id !== id));
            } catch (error) {
                alert("Lỗi khi xóa! Có thể bạn không đủ quyền.");
            }
        }
    };

    return (
        <div className="fade-in-up">
            {/* --- HEADER --- */}
            <div className="admin-header">
                <h2>Quản Lý Nhân Viên</h2>

                {/* Nút này sẽ dẫn sang trang CreateStaff xịn xò chúng ta vừa làm */}
                <button className="btn-add" onClick={() => navigate('/admin/users/create')}>
                    <FaUserPlus /> Thêm Nhân Viên
                </button>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Thông tin tài khoản</th>
                            <th>Liên hệ</th>
                            <th>Vai trò</th>
                            <th style={{ textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Đang tải dữ liệu...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Chưa có nhân viên nào.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>

                                    {/* Cột thông tin User */}
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <b style={{ color: '#334155', fontSize: '1rem' }}>{user.fullName || user.userName}</b>
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>@{user.userName}</span>
                                        </div>
                                    </td>

                                    {/* Cột liên hệ */}
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.phone}</span>
                                        </div>
                                    </td>

                                    {/* Cột Vai trò (Role) - Badge đẹp */}
                                    <td>
                                        {/* Xử lý hiển thị role tùy theo dữ liệu backend trả về (roleCodes hoặc roles) */}
                                        {(user.roleCodes || user.roles || []).map((role, index) => {
                                            const isAdmin = role.includes('ADMIN');
                                            return (
                                                <span key={index} style={{
                                                    background: isAdmin ? '#fee2e2' : '#eff6ff',
                                                    color: isAdmin ? '#ef4444' : '#3b82f6',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    marginRight: '5px'
                                                }}>
                                                    {isAdmin ? <FaUserShield /> : <FaUserTie />}
                                                    {role}
                                                </span>
                                            );
                                        })}
                                    </td>

                                    {/* Cột Hành động */}
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-action btn-edit" title="Sửa thông tin">
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-action btn-delete"
                                            title="Xóa nhân viên"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;