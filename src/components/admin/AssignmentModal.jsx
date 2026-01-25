import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

// QUAN TRỌNG: Import file CSS riêng của Modal
import './AssignmentModal.css';

const AssignmentModal = ({ buildingId, onClose }) => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Tải dữ liệu
    useEffect(() => {
        const fetchStaffs = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/api/buildings/${buildingId}/staffs`);
                setStaffs(Array.isArray(res) ? res : (res.data || []));
            } catch (error) {
                console.error("Lỗi tải danh sách:", error);
            } finally {
                setLoading(false);
            }
        };
        if (buildingId) fetchStaffs();
    }, [buildingId]);

    // 2. Xử lý click chọn
    const handleToggle = (staffId) => {
        setStaffs(prev => prev.map(staff => {
            if (staff.id === staffId) {
                return { ...staff, checked: staff.checked === 'checked' ? '' : 'checked' };
            }
            return staff;
        }));
    };

    // 3. Gửi API
    const handleSubmit = async () => {
        try {
            const selectedIds = staffs
                .filter(staff => staff.checked === 'checked')
                .map(staff => staff.id);
            await axiosClient.post(`/api/buildings/${buildingId}/assignment`, selectedIds);
            alert("Giao việc thành công!");
            onClose();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h3>Phân Công Nhân Viên</h3>
                    <p>Tòa nhà ID: <b>{buildingId}</b></p>
                </div>

                {/* Danh sách nhân viên */}
                <div className="staff-list-wrapper">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Đang tải...</div>
                    ) : (
                        staffs.length > 0 ? staffs.map(staff => {
                            const isChecked = staff.checked === 'checked';
                            return (
                                <div
                                    key={staff.id}
                                    className={`staff-item ${isChecked ? 'active' : ''}`}
                                    onClick={() => handleToggle(staff.id)}
                                >
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        checked={isChecked}
                                        readOnly
                                    />
                                    <div className="staff-info">
                                        <span className="staff-name">{staff.fullName || staff.username}</span>
                                        <span className="staff-code">Mã NV: {staff.id}</span>
                                    </div>
                                </div>
                            );
                        }) : <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Chưa có nhân viên nào.</div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="modal-actions">
                    <button className="btn-modal btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-modal btn-confirm" onClick={handleSubmit}>Xác Nhận</button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;