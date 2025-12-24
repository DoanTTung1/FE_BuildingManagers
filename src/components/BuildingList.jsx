import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast, ToastContainer } from 'react-toastify';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    
    // State tìm kiếm
    const [search, setSearch] = useState({
        name: '',
        floorArea: ''
    });

    // Hàm gọi API lấy danh sách
    const fetchBuildings = async () => {
        try {
            // Gọi API: /building (kết hợp với baseURL bên axiosClient)
            const res = await axiosClient.get('/building', {
                params: search // Tự động ghép ?name=...&floorArea=...
            });
            setBuildings(res.data);
        } catch (error) {
            console.log(error);
            toast.error("Lỗi không tải được dữ liệu! Kiểm tra Backend.");
        }
    };

    // Chạy lần đầu khi mở trang
    useEffect(() => {
        fetchBuildings();
    }, []);

    // Hàm xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa chứ?")) {
            try {
                await axiosClient.delete(`/building/${id}`);
                toast.success("Xóa thành công!");
                fetchBuildings(); // Load lại bảng
            } catch (error) {
                toast.error("Xóa thất bại!");
            }
        }
    }

    return (
        <div className="container mt-5">
            <ToastContainer />
            <h2 className="text-center text-primary mb-4">QUẢN LÝ TÒA NHÀ</h2>

            {/* Khung Tìm Kiếm */}
            <div className="card p-4 mb-4 shadow-sm bg-light">
                <div className="row g-3">
                    <div className="col-md-5">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Nhập tên tòa nhà..." 
                            value={search.name}
                            onChange={(e) => setSearch({...search, name: e.target.value})}
                        />
                    </div>
                    <div className="col-md-5">
                         <input 
                            type="number" 
                            className="form-control" 
                            placeholder="Diện tích sàn tối đa..." 
                            value={search.floorArea}
                            onChange={(e) => setSearch({...search, floorArea: e.target.value})}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary w-100" onClick={fetchBuildings}>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <table className="table table-bordered table-hover shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>Tên Tòa Nhà</th>
                        <th>Địa Chỉ</th>
                        <th>Số Tầng Hầm</th>
                        <th>Tên Quản Lý</th>
                        <th>SĐT</th>
                        <th>Diện Tích Sàn</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {buildings.length > 0 ? (
                        buildings.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.address}</td>
                                <td>{item.numberOfBasement}</td>
                                <td>{item.managerName}</td>
                                <td>{item.managerPhone}</td>
                                <td>{item.floorArea}</td>
                                <td>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center text-muted">Không có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BuildingList;