import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaMapMarkerAlt, FaArrowLeft, FaPhoneAlt } from 'react-icons/fa';
import '../styles/BuildingDetail.css'; // Import file CSS mới

const BuildingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gọi API chi tiết: /api/buildings/{id}
                const res = await axiosClient.get(`/api/buildings/${id}`);
                setBuilding(res);
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (isLoading) return <div className="detail-page-wrapper" style={{ textAlign: 'center' }}><h2>Đang tải dữ liệu...</h2></div>;
    if (!building) return <div className="detail-page-wrapper" style={{ textAlign: 'center' }}><h2>Không tìm thấy tòa nhà!</h2></div>;

    return (
        <div className="detail-page-wrapper">
            <div className="detail-container">

                {/* --- LEFT: IMAGE --- */}
                <div className="left-column">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Quay lại danh sách
                    </button>

                    <div className="detail-image-wrapper">
                        {building.image ? (
                            <img
                                src={`data:image/jpeg;base64,${building.image}`}
                                alt={building.name}
                                className="detail-img"
                            />
                        ) : (
                            <div className="no-image-box">Chưa có hình ảnh</div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT: INFO --- */}
                <div className="detail-info">
                    <h1 className="building-title">{building.name}</h1>
                    <p className="building-address">
                        <FaMapMarkerAlt /> {building.address}, {building.district}
                    </p>

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Giá thuê</span>
                            <span className="value highlight">${building.rentPrice}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Diện tích sàn</span>
                            <span className="value">{building.floorArea} m²</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Hướng</span>
                            <span className="value">{building.direction || 'Đang cập nhật'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Hạng văn phòng</span>
                            <span className="value">{building.level || 'Tiêu chuẩn'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Phí quản lý</span>
                            <span className="value">{building.serviceFee ? `$${building.serviceFee}` : 'Đang cập nhật'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Phí ô tô</span>
                            <span className="value">{building.carFee ? `$${building.carFee}` : 'Đang cập nhật'}</span>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Mô tả chi tiết</h3>
                        <p className="description-text">
                            {building.note || "Hiện chưa có mô tả chi tiết cho tòa nhà này. Vui lòng liên hệ để biết thêm thông tin."}
                        </p>
                    </div>

                    <button className="btn-contact-now" onClick={() => alert('Đã gửi yêu cầu! Nhân viên sẽ gọi lại cho bạn.')}>
                        <FaPhoneAlt /> Liên Hệ Thuê Ngay: 0345.096.281
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuildingDetail;