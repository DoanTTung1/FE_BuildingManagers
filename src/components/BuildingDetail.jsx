import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle,
    FaCar, FaBolt, FaShieldAlt, FaExpandArrowsAlt, FaClock,
    FaBuilding, FaUniversity, FaLayerGroup,
    FaWind, FaMotorcycle, FaWater, FaFileContract, FaMoneyBillWave, FaUserTie, FaImages
} from 'react-icons/fa';
import '../styles/BuildingDetail.css';

// --- Helper functions để format dữ liệu ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Liên hệ';
    // Format theo USD. Nếu muốn VND thì đổi currency: 'VND' và 'vi-VN'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('en-US').format(value);
};
// ------------------------------------------

const BuildingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State Data
    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // State để hứng ảnh chính đang được chọn
    const [selectedImage, setSelectedImage] = useState(null);

    // State Form Liên Hệ
    const [contactForm, setContactForm] = useState({ fullName: '', phone: '', content: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axiosClient.get(`/api/buildings/${id}`);
                setBuilding(res);
                // Mặc định chọn ảnh đại diện làm ảnh chính khi mới tải
                setSelectedImage(res.image);
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
                // Có thể navigate về trang 404 hoặc thông báo lỗi tốt hơn
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
            alert("Đã gửi thành công! Chúng tôi sẽ liên hệ sớm.");
            setContactForm({ fullName: '', phone: '', content: '' });
        } catch (error) {
            alert("Gửi thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsSending(false);
        }
    };

    // Xử lý ảnh hiển thị an toàn (placeholder nếu ảnh lỗi hoặc null)
    const getSafeImageUrl = (url) => {
        return (url && url.startsWith("http")) ? url : "https://placehold.co/800x500?text=No+Image+Available";
    };

    // Gộp ảnh đại diện và danh sách ảnh chi tiết để hiển thị gallery
    // Sử dụng Set để đảm bảo không trùng ảnh đại diện nếu nó đã có trong imageList
    const galleryImages = building ? [...new Set([building.image, ...(building.imageList || [])].filter(Boolean))] : [];


    if (isLoading) return <div className="loading-container">Đang tải dữ liệu tòa nhà...</div>;
    if (!building) return <div className="error-container">Không tìm thấy thông tin tòa nhà này.</div>;


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
                                <span className="badge rank">Hạng {building.level || 'Khác'}</span>
                                {building.managerName && <span className="badge manager">QL: {building.managerName}</span>}
                            </div>
                        </div>

                        {/* 2. IMAGE HERO & GALLERY (Đã nâng cấp) */}
                        <div className="hero-image-section" style={{ marginBottom: '30px' }}>
                            {/* Ảnh chính */}
                            <div className="hero-image-box">
                                <img
                                    src={getSafeImageUrl(selectedImage)}
                                    alt={building.name}
                                    className="hero-img"
                                    onError={(e) => { e.target.src = "https://placehold.co/800x500?text=Image+Error" }}
                                />
                                <span className="status-label">Đang cho thuê</span>
                            </div>

                            {/* Danh sách ảnh thumbnails */}
                            {galleryImages.length > 1 && (
                                <div className="thumbnails-list" style={{ display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                    {galleryImages.map((imgUrl, index) => (
                                        <img
                                            key={index}
                                            src={getSafeImageUrl(imgUrl)}
                                            alt={`Thumbnail ${index}`}
                                            onClick={() => setSelectedImage(imgUrl)}
                                            style={{
                                                width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer',
                                                border: selectedImage === imgUrl ? '2px solid #0f2557' : '2px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>


                        {/* 3. TỔNG QUAN (HIGHLIGHTS) */}
                        <div className="section-box">
                            <h3 className="sec-title">Tổng quan tòa nhà</h3>
                            <div className="highlights-grid">
                                <div className="hl-item">
                                    <FaExpandArrowsAlt className="hl-icon" />
                                    <span>Diện tích sàn<br /><b>{formatNumber(building.floorArea)} m²</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaLayerGroup className="hl-icon" />
                                    <span>Kết cấu<br /><b>{building.structure || 'Đang cập nhật'}</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaBuilding className="hl-icon" />
                                    <span>Số hầm<br /><b>{building.numberOfBasement || 0} hầm</b></span>
                                </div>
                                <div className="hl-item">
                                    <FaWind className="hl-icon" />
                                    <span>Hướng<br /><b>{building.direction || 'Đang cập nhật'}</b></span>
                                </div>
                            </div>

                            {/* Hiển thị Diện tích trống */}
                            {building.rentAreaResult && (
                                <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                    <strong style={{ color: '#047857', display: 'block', marginBottom: '5px' }}>✨ Diện tích đang trống:</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#065f46' }}>
                                        {building.rentAreaResult} m²
                                    </span>
                                </div>
                            )}

                            <div className="description-text" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
                                {building.note || "Vui lòng liên hệ với ban quản lý để biết thêm chi tiết về tòa nhà này."}
                            </div>
                        </div>

                        {/* 4. BẢNG PHÍ DỊCH VỤ */}
                        <div className="section-box">
                            <h3 className="sec-title">Chi phí & Dịch vụ</h3>
                            <table className="rent-table">
                                <tbody>
                                    <tr>
                                        <th><FaMoneyBillWave /> Giá thuê</th>
                                        {/* Sử dụng hàm formatCurrency */}
                                        <td className="text-price">{formatCurrency(building.rentPrice)}<small>/m²</small> <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>({building.rentPriceDescription || 'Chưa VAT'})</span></td>
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

                        {/* 5. ĐIỀU KIỆN THUÊ */}
                        <div className="section-box">
                            <h3 className="sec-title">Điều kiện thuê</h3>
                            <div className="specs-grid">
                                <ul>
                                    <li>
                                        <FaFileContract className="check" />
                                        <span><b>Đặt cọc:</b> {building.deposit || 'Thỏa thuận'}</span>
                                    </li>
                                    <li>
                                        <FaMoneyBillWave className="check" />
                                        <span><b>Thanh toán:</b> {building.payment || 'Thỏa thuận'}</span>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <FaClock className="check" />
                                        <span><b>Thời hạn thuê:</b> {building.rentTime || 'Thỏa thuận'}</span>
                                    </li>
                                    <li>
                                        <FaCheckCircle className="check" />
                                        <span><b>Thời gian trang trí:</b> {building.decorationTime || 'Thỏa thuận'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 6. BẢN ĐỒ */}
                        {building.linkOfBuilding && (
                            <div className="section-box">
                                <h3 className="sec-title">Vị trí trên bản đồ</h3>
                                {/* Nếu có iframe bản đồ thì nhúng vào đây, tạm thời dùng link */}
                                <div style={{ width: '100%', height: '250px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
                                    <a href={building.linkOfBuilding} target="_blank" rel="noreferrer" style={{ color: '#0f2557', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaMapMarkerAlt /> Xem vị trí thực tế trên Google Maps ↗
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
                                    {/* Sử dụng hàm formatCurrency */}
                                    <span className="p-value">{formatCurrency(building.rentPrice)}<small>/m²</small></span>
                                </div>
                                <p className="note-text">{building.rentPriceDescription || 'Giá có thể thay đổi tùy thời điểm và diện tích thuê.'}</p>
                            </div>

                            <div className="agent-box">
                                <div className="agent-icon">
                                    <FaUserTie />
                                </div>
                                <div>
                                    <span className="sub">Quản lý tòa nhà: </span>
                                    <strong>{building.managerName || 'Hotline BQL'}</strong>
                                </div>
                            </div>

                            {/* Kiểm tra nếu có số điện thoại thì mới hiện nút gọi */}
                            {building.managerPhoneNumber ? (
                                <a href={`tel:${building.managerPhoneNumber}`} className="btn-call-action">
                                    <FaPhoneAlt /> {building.managerPhoneNumber}
                                </a>
                            ) : (
                                <button className="btn-call-action disabled" disabled>
                                    <FaPhoneAlt /> Đang cập nhật SĐT
                                </button>
                            )}


                            <form className="mini-contact-form" onSubmit={handleSendContact}>
                                <h5>Yêu cầu báo giá & Tư vấn</h5>
                                <input
                                    type="text" placeholder="Họ tên của bạn *"
                                    value={contactForm.fullName}
                                    onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })}
                                    required
                                />
                                <input
                                    type="tel" placeholder="Số điện thoại liên hệ *"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Ví dụ: Tôi cần thuê văn phòng khoảng 150m2, cho khoảng 20 nhân sự làm việc..."
                                    value={contactForm.content}
                                    onChange={e => setContactForm({ ...contactForm, content: e.target.value })}
                                    rows="4"
                                ></textarea>
                                <button type="submit" disabled={isSending}>
                                    {isSending ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Ngay'}
                                </button>
                                <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '10px', textAlign: 'center' }}>Chúng tôi cam kết bảo mật thông tin của bạn.</p>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BuildingDetail;