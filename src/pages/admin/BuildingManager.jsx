import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FaTrash, FaEdit, FaUserTag, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AssignmentModal from '../../components/admin/AssignmentModal';

const BuildingManager = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);

    // State cho Modal giao việc
    const [assignmentBuildingId, setAssignmentBuildingId] = useState(null);

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const res = await axiosClient.get('/api/buildings/admin');
            setBuildings(res);
        } catch (error) {
            console.error("Lỗi tải tòa nhà:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn muốn xóa MỀM tòa nhà này?")) {
            try {
                await axiosClient.delete(`/api/buildings/${id}`);
                alert("Xóa thành công!");
                fetchBuildings();
            } catch (error) {
                alert("Lỗi khi xóa! (Có thể bạn không phải Admin)");
            }
        }
    };

    // Nút sửa sẽ điều hướng sang trang CreateBuilding nhưng với mode Edit (cần xử lý thêm ở file đó)
    // Ở đây mình ví dụ logic giao diện
    const handleEdit = (id) => {
        navigate(`/admin/building-edit/${id}`); // Bạn cần tạo route này nếu muốn sửa
    };

    return (
        <div>
            <div className="admin-header">
                <h2>Quản Lý Tòa Nhà</h2>
                {/* Tái sử dụng trang CreateBuilding */}
                <button className="btn-add" onClick={() => navigate('/post-building')}>
                    <FaPlus /> Thêm Tòa Nhà
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Tòa Nhà</th>
                            <th>Địa Chỉ</th>
                            <th>Giá Thuê</th>
                            <th>Diện Tích Sàn</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildings.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td><b>{item.name}</b></td>
                                <td>{item.address}</td>
                                <td>${item.rentPrice}</td>
                                <td>{item.floorArea} m²</td>
                                <td>
                                    {/* Nút Giao Việc */}
                                    <button
                                        className="btn-action btn-assign"
                                        title="Giao cho nhân viên"
                                        onClick={() => setAssignmentBuildingId(item.id)}
                                    >
                                        <FaUserTag />
                                    </button>

                                    {/* Nút Sửa */}
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() => handleEdit(item.id)}
                                    >
                                        <FaEdit />
                                    </button>

                                    {/* Nút Xóa */}
                                    <button
                                        className="btn-action btn-delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hiển thị Modal Giao Việc nếu có ID */}
            {assignmentBuildingId && (
                <AssignmentModal
                    buildingId={assignmentBuildingId}
                    onClose={() => setAssignmentBuildingId(null)}
                />
            )}
        </div>
    );
};

export default BuildingManager;