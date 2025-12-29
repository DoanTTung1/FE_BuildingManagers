import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle,
    FaCar, FaBolt, FaShieldAlt, FaExpandArrowsAlt, FaClock,
    FaBuilding, FaPlane, FaUniversity, FaCoffee, FaLayerGroup,
    FaRulerVertical, FaWind, FaMotorcycle, FaWater, FaFileContract, FaMoneyBillWave, FaUserTie
} from 'react-icons/fa';
import '../styles/BuildingDetail.css';

const BuildingDetail = () => {
    const { id } = useParams();

    // State Data
    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State Form Liên Hệ
    const [contactForm, setContactForm] = useState({ fullName: '', phone: '', content: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
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

    const handleSendContact = async (e) => {
        e.preventDefault();
        if (!contactForm.phone || !contactForm.fullName) return alert("Vui lòng nhập đủ thông tin!");
        setIsSending(true);
        try {
            await axiosClient.post('/api/customers/contact', {
                fullName: contactForm.fullName,
                phone: contactForm.phone,
                demand: `Quan tâm ID ${id}: ${contactForm.content}`
            });
            alert("Đã gửi thành công!");
            setContactForm({ fullName: '', phone: '', content: '' });
        } catch (error) {
            alert("Lỗi kết nối server.");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    if (!building) return <div style={{ padding: '100px', textAlign: 'center' }}>Không tìm thấy tòa nhà!</div>;

    // Xử lý ảnh: Ưu tiên ảnh từ DB, nếu không có thì dùng ảnh mẫu
    const mainImage = building.image ? `data:image/jpeg;base64,${building.image}` : "https://via.placeholder.com/800x600?text=No+Image";

    return (
        <div className="detail-page-wrapper">
            <div className="container">
                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> / <Link to="/search">Tòa nhà</Link> / <span>{building.name}</span>
                </div>

                <div className="detail-container">
                    {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT (70%) --- */}
                    <div className="main-content">

                        {/* 1. HEADER INFO */}
                        <div className="header-info">
                            <h1 className="b-title">{building.name}</h1>
                            <p className="b-address">
                                <FaMapMarkerAlt /> {building.address} {building.districtName ? `, ${building.districtName}` : ''}
                            </p>
                            <div className="b-badges">
                                <span className="badge rank">Hạng {building.level || 'C'}</span>
                                {building.managerName && <span className="badge manager">QL: {building.managerName}</span>}
                            </div>
                        </div>

                        {/* 2. IMAGE HERO */}
                        <div className="hero-image-box">
                            <img src={mainImage} alt={building.name} className="hero-img" />
                            <span className="status-label">Đang cho thuê</span>
                        </div>

                        {/* 3. TỔNG QUAN (HIGHLIGHTS) */}
                        <div className="section-box">
                            <h3 className="sec-title">Tổng quan tòa nhà</h3>
                            <div className="highlights-grid">
                                <div className="hl-item">
                                    <FaExpandArrowsAlt className="hl-icon" />
                                    <span>Diện tích sàn<br /><b>{building.floorArea || 0} m²</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaLayerGroup className="hl-icon" />
                                    <span>Kết cấu<br /><b>{building.structure || 'N/A'}</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaBuilding className="hl-icon" />
                                    <span>Số hầm<br /><b>{building.numberOfBasement || 0} hầm</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaWind className="hl-icon" />
                                    <span>Hướng<br /><b>{building.direction || 'KXĐ'}</b></span>
                                </div>
                            </div>

                            {/* Hiển thị Diện tích trống (rentAreaResult) */}
                            {building.rentAreaResult && (
                                <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                    <strong style={{ color: '#047857', display: 'block', marginBottom: '5px' }}>✨ Diện tích đang trống:</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#065f46' }}>
                                        {building.rentAreaResult} m²
                                    </span>
                                </div>
                            )}

                            <div className="description-text" style={{ marginTop: '20px' }}>
                                {building.note || "Liên hệ để biết thêm chi tiết về tòa nhà này."}
                            </div>
                        </div>

                        {/* 4. BẢNG PHÍ DỊCH VỤ (Mapping field String) */}
                        <div className="section-box">
                            <h3 className="sec-title">Chi phí & Dịch vụ</h3>
                            <table className="rent-table">
                                <tbody>
                                    <tr>
                                        <th><FaMoneyBillWave /> Giá thuê</th>
                                        <td className="text-price">${building.rentPrice} <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>({building.rentPriceDescription})</span></td>
                                    </tr>
                                    <tr>
                                        <th><FaShieldAlt /> Phí dịch vụ/Quản lý</th>
                                        <td>{building.serviceFee || 'Liên hệ'}</td>
                                    </tr>
                                    <tr>
                                        <th><FaCar /> Phí gửi ô tô</th>
                                        <td>{building.carFee || 'Liên hệ'}</td>
                                    </tr>
                                    <tr>
                                        <th><FaMotorcycle /> Phí gửi xe máy</th>
                                        <td>{building.motorbikeFee || 'Liên hệ'}</td>
                                    </tr>
                                    <tr>
                                        <th><FaClock /> Phí ngoài giờ</th>
                                        <td>{building.overtimeFee || 'Thỏa thuận'}</td>
                                    </tr>
                                    <tr>
                                        <th><FaBolt /> Tiền điện</th>
                                        <td>{building.electricityFee || 'Theo giá nhà nước'}</td>
                                    </tr>
                                    <tr>
                                        <th><FaWater /> Tiền nước</th>
                                        <td>{building.waterFee || 'Miễn phí / Theo khối'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 5. ĐIỀU KIỆN THUÊ (NEW SECTION) */}
                        <div className="section-box">
                            <h3 className="sec-title">Điều kiện thuê</h3>
                            <div className="specs-grid">
                                <ul>
                                    <li>
                                        <FaFileContract className="check" />
                                        <span><b>Đặt cọc:</b> {building.deposit || '3 tháng'}</span>
                                    </li>
                                    <li>
                                        <FaMoneyBillWave className="check" />
                                        <span><b>Thanh toán:</b> {building.payment || 'Theo quý'}</span>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <FaClock className="check" />
                                        <span><b>Thời hạn thuê:</b> {building.rentTime || 'Tối thiểu 2 năm'}</span>
                                    </li>
                                    <li>
                                        <FaCheckCircle className="check" />
                                        <span><b>Thời gian trang trí:</b> {building.decorationTime || 'Thỏa thuận'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 6. BẢN ĐỒ (Nếu có link map) */}
                        {building.map && (
                            <div className="section-box">
                                <h3 className="sec-title">Vị trí trên bản đồ</h3>
                                <div style={{ width: '100%', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Trong thực tế bạn có thể Embed Google Map iframe tại đây */}
                                    <a href={building.linkOfBuilding} target="_blank" rel="noreferrer" style={{ color: '#0f2557', fontWeight: 'bold' }}>
                                        Xem vị trí thực tế trên Google Maps ↗
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CỘT PHẢI: SIDEBAR (30%) --- */}
                    <div className="sidebar">
                        <div className="sticky-card">
                            <div className="cost-breakdown">
                                <h4>Thông tin giá thuê</h4>
                                <div className="price-display">
                                    <span className="p-label">Giá niêm yết:</span>
                                    <span className="p-value">${building.rentPrice}<small>/m²</small></span>
                                </div>
                                <p className="note-text">{building.rentPriceDescription}</p>
                            </div>

                            {/* Hiển thị thông tin quản lý động từ API */}
                            <div className="agent-box">
                                <div className="agent-icon">
                                    <FaUserTie />
                                </div>
                                <div>
                                    <span className="sub">Quản lý tòa nhà</span>
                                    <strong>{building.managerName || 'Hotline BQL'}</strong>
                                </div>
                            </div>

                            {/* Gọi số điện thoại từ API (building.managerPhoneNumber) */}
                            <a href={`tel:${building.managerPhoneNumber}`} className="btn-call-action">
                                <FaPhoneAlt /> {building.managerPhoneNumber || 'Liên hệ ngay'}
                            </a>

                            <form className="mini-contact-form" onSubmit={handleSendContact}>
                                <h5>Yêu cầu báo giá chi tiết</h5>
                                <input
                                    type="text" placeholder="Họ tên *"
                                    value={contactForm.fullName}
                                    onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Số điện thoại *"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                />
                                <textarea
                                    placeholder="Nhu cầu (VD: Tôi cần thuê 100m2...)"
                                    value={contactForm.content}
                                    onChange={e => setContactForm({ ...contactForm, content: e.target.value })}
                                ></textarea>
                                <button type="submit" disabled={isSending}>
                                    {isSending ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BuildingDetail;