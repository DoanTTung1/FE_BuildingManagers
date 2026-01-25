import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle,
    FaCar, FaBolt, FaShieldAlt, FaExpandArrowsAlt, FaClock,
    FaBuilding, FaLayerGroup,
    FaWind, FaMotorcycle, FaWater, FaFileContract, FaMoneyBillWave, FaUserTie
} from 'react-icons/fa';
import '../styles/BuildingDetail.css';

// --- Helper functions ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Liên hệ';
    // Đổi sang VNĐ
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('de-DE').format(value); // Format kiểu 1.000 (Việt Nam)
};
// ------------------------

const BuildingDetail = () => {
    const { id } = useParams();
    // const navigate = useNavigate(); // Chưa dùng tới

    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [contactForm, setContactForm] = useState({ fullName: '', phone: '', content: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axiosClient.get(`/api/buildings/${id}`);
                setBuilding(res);
                setSelectedImage(res.image);
                
                // Set nội dung mặc định cho form liên hệ
                const action = res.transactionType === 'SALE' ? 'mua' : 'thuê';
                setContactForm(prev => ({
                    ...prev,
                    content: `Tôi quan tâm đến tòa nhà ${res.name} (Mã: ${res.id}). Vui lòng tư vấn thêm về giá ${action}.`
                }));

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
                demand: `Khách quan tâm ID ${id} [${building.transactionType}]: ${contactForm.content}`
            });
            alert("Đã gửi thành công! Chúng tôi sẽ liên hệ sớm.");
            setContactForm({ fullName: '', phone: '', content: '' });
        } catch (error) {
            alert("Gửi thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsSending(false);
        }
    };

    const getSafeImageUrl = (url) => {
        return (url && url.startsWith("http")) ? url : "https://placehold.co/800x500?text=No+Image+Available";
    };

    const galleryImages = building ? [...new Set([building.image, ...(building.imageList || [])].filter(Boolean))] : [];

    if (isLoading) return <div className="loading-container">Đang tải dữ liệu tòa nhà...</div>;
    if (!building) return <div className="error-container">Không tìm thấy thông tin tòa nhà này.</div>;

    // 🔥 CHECK XEM LÀ MUA HAY THUÊ
    const isSale = building.transactionType === 'SALE';

    return (
        <div className="detail-page-wrapper">
            <div className="container">
                {/* BREADCRUMB */}
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> / <Link to="/search">Tòa nhà</Link> / <span>{building.name}</span>
                </div>

                <div className="detail-container">
                    {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
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

                        {/* 2. HERO IMAGE */}
                        <div className="hero-image-section" style={{ marginBottom: '30px' }}>
                            <div className="hero-image-box">
                                <img
                                    src={getSafeImageUrl(selectedImage)}
                                    alt={building.name}
                                    className="hero-img"
                                    onError={(e) => { e.target.src = "https://placehold.co/800x500?text=Image+Error" }}
                                />
                                {/* 🔥 NHÃN TRẠNG THÁI MUA/BÁN */}
                                <span className={`status-label ${isSale ? 'label-sale' : 'label-rent'}`} 
                                      style={{ backgroundColor: isSale ? '#f97316' : '#10b981' }}>
                                    {isSale ? '🔥 Đang Bán' : '✨ Cho Thuê'}
                                </span>
                            </div>

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
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. TỔNG QUAN */}
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

                            {/* Chỉ hiện diện tích trống nếu là THUÊ */}
                            {!isSale && building.rentAreaResult && (
                                <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                    <strong style={{ color: '#047857', display: 'block', marginBottom: '5px' }}>✨ Diện tích đang trống:</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#065f46' }}>
                                        {building.rentAreaResult}
                                    </span>
                                </div>
                            )}

                            <div className="description-text" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
                                {building.note || "Vui lòng liên hệ với ban quản lý để biết thêm chi tiết."}
                            </div>
                        </div>

                        {/* 4. BẢNG GIÁ & PHÍ (LOGIC ẨN/HIỆN) */}
                        <div className="section-box">
                            <h3 className="sec-title">{isSale ? 'Thông tin giá bán' : 'Chi phí & Dịch vụ'}</h3>
                            <table className="rent-table">
                                <tbody>
                                    <tr>
                                        <th><FaMoneyBillWave /> {isSale ? 'Giá bán' : 'Giá thuê'}</th>
                                        <td className="text-price">
                                            {formatCurrency(building.rentPrice)}
                                            {!isSale && <small>/tháng</small>}
                                            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal', marginLeft: '5px' }}>
                                                ({building.rentPriceDescription || 'Chưa bao gồm VAT'})
                                            </span>
                                        </td>
                                    </tr>
                                    
                                    {/* 🔥 NẾU LÀ THUÊ MỚI HIỆN CÁC PHÍ NÀY */}
                                    {!isSale && (
                                        <>
                                            <tr><th><FaShieldAlt /> Phí quản lý</th><td>{building.serviceFee || 'Liên hệ'}</td></tr>
                                            <tr><th><FaCar /> Phí gửi ô tô</th><td>{building.carFee || 'Liên hệ'}</td></tr>
                                            <tr><th><FaMotorcycle /> Phí gửi xe máy</th><td>{building.motorbikeFee || 'Liên hệ'}</td></tr>
                                            <tr><th><FaClock /> Phí ngoài giờ</th><td>{building.overtimeFee || 'Thỏa thuận'}</td></tr>
                                            <tr><th><FaBolt /> Tiền điện</th><td>{building.electricityFee || 'Theo giá nhà nước'}</td></tr>
                                            <tr><th><FaWater /> Tiền nước</th><td>{building.waterFee || 'Miễn phí / Theo khối'}</td></tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 5. ĐIỀU KIỆN */}
                        <div className="section-box">
                            <h3 className="sec-title">Điều kiện giao dịch</h3>
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
                                {/* 🔥 Chỉ hiện thời hạn thuê nếu là RENT */}
                                {!isSale && (
                                    <ul>
                                        <li>
                                            <FaClock className="check" />
                                            <span><b>Thời hạn thuê:</b> {building.rentTime || 'Thỏa thuận'}</span>
                                        </li>
                                        <li>
                                            <FaCheckCircle className="check" />
                                            <span><b>TG Trang trí:</b> {building.decorationTime || 'Thỏa thuận'}</span>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* 6. BẢN ĐỒ */}
                        {building.linkOfBuilding && (
                            <div className="section-box">
                                <h3 className="sec-title">Vị trí</h3>
                                <div style={{ width: '100%', padding: '20px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', border: '1px dashed #ccc' }}>
                                    <a href={building.linkOfBuilding} target="_blank" rel="noreferrer" style={{ color: '#0f2557', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <FaMapMarkerAlt /> Xem vị trí thực tế trên Google Maps ↗
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CỘT PHẢI: SIDEBAR --- */}
                    <div className="sidebar">
                        <div className="sticky-card">
                            <div className="cost-breakdown">
                                <h4>{isSale ? 'Giá bán niêm yết' : 'Thông tin giá thuê'}</h4>
                                <div className="price-display">
                                    <span className="p-label">{isSale ? 'Tổng giá:' : 'Giá thuê:'}</span>
                                    <span className="p-value" style={{ color: isSale ? '#d46b08' : '#0f2557' }}>
                                        {formatCurrency(building.rentPrice)}
                                    </span>
                                </div>
                                <p className="note-text">{building.rentPriceDescription || 'Giá có thể thương lượng.'}</p>
                            </div>

                            <div className="agent-box">
                                <div className="agent-icon"><FaUserTie /></div>
                                <div>
                                    <span className="sub">Liên hệ quản lý: </span>
                                    <strong>{building.managerName || 'Hotline BQL'}</strong>
                                </div>
                            </div>

                            {building.managerPhoneNumber ? (
                                <a href={`tel:${building.managerPhoneNumber}`} className="btn-call-action">
                                    <FaPhoneAlt /> {building.managerPhoneNumber}
                                </a>
                            ) : (
                                <button className="btn-call-action disabled" disabled><FaPhoneAlt /> Đang cập nhật SĐT</button>
                            )}

                            <form className="mini-contact-form" onSubmit={handleSendContact}>
                                <h5>{isSale ? 'Liên hệ mua tòa nhà' : 'Yêu cầu báo giá & Tư vấn'}</h5>
                                <input type="text" placeholder="Họ tên của bạn *" value={contactForm.fullName} onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })} required />
                                <input type="tel" placeholder="Số điện thoại liên hệ *" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} required />
                                <textarea placeholder="Nội dung lời nhắn..." value={contactForm.content} onChange={e => setContactForm({ ...contactForm, content: e.target.value })} rows="4"></textarea>
                                <button type="submit" disabled={isSending}>
                                    {isSending ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Ngay'}
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