import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
    FaPhone, FaCheck, FaTrash, FaEye, FaFilter,
    FaSearch, FaClipboardList, FaMapMarkerAlt
} from 'react-icons/fa';
import '../../styles/ConsignmentManager.css';

const ConsignmentManager = () => {
    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(''); // '' = All, 'PENDING', 'CONTACTED'...
    const [stats, setStats] = useState({ pending: 0, today: 0 });

    // Gọi API lấy dữ liệu
    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi API list (Bạn có thể thêm params ?status=... nếu muốn lọc phía server)
            const params = { page: 0, size: 50, sort: 'createdDate,desc' };
            if (filterStatus) params.status = filterStatus;

            const res = await axiosClient.get('/api/consignments', { params });

            // Backend trả về Page<T>, dữ liệu nằm trong res.content
            setConsignments(res.content || []);

            // Tính toán sơ bộ số lượng (Nếu backend chưa có API thống kê riêng)
            const pendingCount = (res.content || []).filter(c => c.status === 'PENDING').length;
            setStats({ pending: pendingCount, total: res.totalElements });

        } catch (error) {
            toast.error("Không thể tải danh sách ký gửi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]); // Mỗi khi đổi tab filter thì gọi lại API

    // Xử lý chuyển trạng thái
    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Bạn chắc chắn muốn chuyển trạng thái sang ${newStatus}?`)) return;

        try {
            await axiosClient.put(`/api/consignments/${id}/status?status=${newStatus}`);
            toast.success("Cập nhật thành công!");
            fetchData(); // Reload lại bảng
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // Xử lý xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Hành động này không thể hoàn tác. Xóa yêu cầu này?")) return;
        try {
            await axiosClient.delete(`/api/consignments/${id}`);
            toast.success("Đã xóa yêu cầu");
            fetchData();
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    // Helper: Format tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Helper: Format ngày
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper: Badge màu sắc
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="badge badge-warning">Chờ xử lý</span>;
            case 'CONTACTED': return <span className="badge badge-info">Đã liên hệ</span>;
            case 'APPROVED': return <span className="badge badge-success">Đã duyệt</span>;
            case 'REJECTED': return <span className="badge badge-danger">Từ chối</span>;
            default: return <span className="badge badge-default">{status}</span>;
        }
    };

    return (
        <div className="admin-page-container">
            {/* --- HEADER --- */}
            <div className="page-header">
                <div>
                    <h1>Quản Lý Ký Gửi</h1>
                    <p>Danh sách khách hàng gửi yêu cầu Bán/Cho thuê</p>
                </div>
                <div className="header-stats">
                    <div className="stat-box">
                        <span className="stat-num">{stats.pending || 0}</span>
                        <span className="stat-label">Chờ xử lý</span>
                    </div>
                </div>
            </div>

            {/* --- FILTER TABS --- */}
            <div className="filter-tabs">
                <button
                    className={`tab-btn ${filterStatus === '' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('')}
                >Tất cả</button>
                <button
                    className={`tab-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('PENDING')}
                >Chờ xử lý ⚠️</button>
                <button
                    className={`tab-btn ${filterStatus === 'CONTACTED' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('CONTACTED')}
                >Đã liên hệ 📞</button>
                <button
                    className={`tab-btn ${filterStatus === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('APPROVED')}
                >Đã duyệt ✅</button>
            </div>

            {/* --- TABLE --- */}
            <div className="table-wrapper">
                {loading ? <div className="loading-spinner">Đang tải dữ liệu...</div> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Bất động sản</th>
                                <th>Giá kỳ vọng</th>
                                <th>Trạng thái</th>
                                <th>Ngày gửi</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consignments.length === 0 ? (
                                <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>
                            ) : consignments.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="user-info">
                                            <strong>{item.customerName}</strong>
                                            <a href={`tel:${item.customerPhone}`} className="phone-link">
                                                <FaPhone /> {item.customerPhone}
                                            </a>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="prop-info">
                                            <span className="prop-name">{item.buildingName}</span>
                                            <span className="prop-addr"><FaMapMarkerAlt /> {item.districtCode}</span>
                                            <small className="prop-type">{item.transactionType === 'RENT' ? 'Cho Thuê' : 'Bán'}</small>
                                        </div>
                                    </td>
                                    <td className="price-cell">
                                        {formatCurrency(item.expectedPrice)}
                                    </td>
                                    <td>{getStatusBadge(item.status)}</td>
                                    <td>{formatDate(item.createdDate)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {/* Nút hành động dựa trên trạng thái */}
                                            {item.status === 'PENDING' && (
                                                <button
                                                    className="btn-icon btn-blue"
                                                    title="Đã gọi điện"
                                                    onClick={() => handleStatusUpdate(item.id, 'CONTACTED')}
                                                >
                                                    <FaPhone />
                                                </button>
                                            )}

                                            {item.status !== 'APPROVED' && (
                                                <button
                                                    className="btn-icon btn-green"
                                                    title="Duyệt đăng tin"
                                                    onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            <button
                                                className="btn-icon btn-red"
                                                title="Xóa yêu cầu"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ConsignmentManager;