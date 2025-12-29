import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AssignmentModal = ({ buildingId, onClose }) => {
    const [staffs, setStaffs] = useState([]);
    const [selectedStaffs, setSelectedStaffs] = useState([]);

    // 1. Tải danh sách nhân viên (STAFF)
    useEffect(() => {
        const fetchStaffs = async () => {
            try {
                const res = await axiosClient.get('/api/users/staffs');
                setStaffs(res);
            } catch (error) {
                console.error("Lỗi tải staff:", error);
            }
        };
        fetchStaffs();
        // TODO: Nếu muốn hiện các staff ĐÃ được giao trước đó, cần thêm 1 API getAssignedStaffs(buildingId)
    }, []);

    // 2. Xử lý check/uncheck
    const handleCheckboxChange = (staffId) => {
        setSelectedStaffs(prev => {
            if (prev.includes(staffId)) {
                return prev.filter(id => id !== staffId);
            } else {
                return [...prev, staffId];
            }
        });
    };

    // 3. Gửi API giao việc
    const handleSubmit = async () => {
        try {
            // BE yêu cầu: List<Long> staffIds
            await axiosClient.post(`/api/buildings/${buildingId}/assignment`, selectedStaffs);
            alert("Giao tòa nhà thành công!");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi giao việc!");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Giao Tòa Nhà Cho Nhân Viên</h3>
                <p>Chọn nhân viên quản lý cho tòa nhà ID: <b>{buildingId}</b></p>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '15px', border: '1px solid #eee', padding: '10px' }}>
                    {staffs.length > 0 ? staffs.map(staff => (
                        <div key={staff.id} style={{ padding: '8px', borderBottom: '1px solid #f1f1f1', display: 'flex', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={selectedStaffs.includes(staff.id)}
                                onChange={() => handleCheckboxChange(staff.id)}
                            />
                            <span>{staff.fullName} ({staff.userName})</span>
                        </div>
                    )) : <p>Không có nhân viên nào.</p>}
                </div>

                <div className="modal-actions">
                    <button className="btn-action btn-delete" onClick={onClose}>Hủy</button>
                    <button className="btn-add" onClick={handleSubmit}>Xác Nhận</button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;