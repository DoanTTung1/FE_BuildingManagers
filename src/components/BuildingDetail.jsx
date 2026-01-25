import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle,
    FaCar, FaBolt, FaShieldAlt, FaExpandArrowsAlt, FaClock,
    FaBuilding, FaLayerGroup,
    FaWind, FaMotorcycle, FaWater, FaFileContract, FaMoneyBillWave, FaUserTie
} from 'react-icons/fa';
import '../styles/BuildingDetail.css';

// Helpers
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

const BuildingDetail = () => {
    const { id } = useParams();

    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [contactForm, setContactForm] = useState({ fullName: '', phone: '', content: '' });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axiosClient.get(`/api/buildings/${id}`);
                setBuilding(res.data || res);
                setSelectedImage(res.data?.image || res.image);

                const action = (res.data?.transactionType || res.transactionType) === 'SALE' ? 'mua' : 'thuê';
                setContactForm(prev => ({
                    ...prev,
                    content: `Tôi quan tâm đến tòa nhà ${res.data?.name || res.name} (Mã: ${id}). Vui lòng tư vấn thêm về giá ${action}.`
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

    const galleryImages = building
        ? [...new Set([building.image, ...(building.imageList || [])].filter(Boolean))]
        : [];

    if (isLoading) return <div className="loading">Đang tải...</div>;
    if (!building) return <div className="error">Không tìm thấy tòa nhà</div>;

    const isSale = building.transactionType === 'SALE';

    return (
        <div className="detail-page-wrapper">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> / <Link to="/search">Tòa nhà</Link> / <span>{building.name}</span>
                </div>

                <div className="detail-container">
                    <div className="main-content">
                        {/* Header – tên + badges ngay dưới */}
                        <div className="header-info">
                            <h1 className="b-title">{building.name}</h1>
                            <div className="header-badges">
                                <span className="badge rank">Hạng {building.level || 'Khác'}</span>
                                {building.managerName && <span className="badge manager">QL: {building.managerName}</span>}
                            </div>
                        </div>

                        {/* Hero + thumbnails */}
                        <div className="hero-section">
                            <div className="hero-image-box">
                                <img
                                    src={getSafeImageUrl(selectedImage)}
                                    alt={building.name}
                                    className="hero-img"
                                    onError={e => e.target.src = "https://placehold.co/800x500?text=Image+Error"}
                                />
                                <span className={`status-label ${isSale ? 'sale' : 'rent'}`}>
                                    {isSale ? 'Đang bán' : 'Cho thuê'}
                                </span>
                            </div>

                            {galleryImages.length > 1 && (
                                <div className="thumbnails">
                                    {galleryImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getSafeImageUrl(img)}
                                            alt={`thumb-${idx}`}
                                            className={selectedImage === img ? 'active' : ''}
                                            onClick={() => setSelectedImage(img)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tổng quan – địa chỉ đơn giản */}
                        <div className="section">
                            <h3 className="section-title">Tổng quan tòa nhà</h3>

                            <div className="address-simple">
                                <FaMapMarkerAlt className="marker-icon" />
                                <span>
                                    {building.address}
                                    {building.districtName && `, ${building.districtName}`}
                                </span>
                            </div>

                            <div className="highlights">
                                <div className="highlight-item">
                                    <FaExpandArrowsAlt />
                                    <div>Diện tích sàn<br /><strong>{formatNumber(building.floorArea)} m²</strong></div>
                                </div>
                                <div className="highlight-item">
                                    <FaLayerGroup />
                                    <div>Kết cấu<br /><strong>{building.structure || '—'}</strong></div>
                                </div>
                                <div className="highlight-item">
                                    <FaBuilding />
                                    <div>Số hầm<br /><strong>{building.numberOfBasement || 0}</strong></div>
                                </div>
                                <div className="highlight-item">
                                    <FaWind />
                                    <div>Hướng<br /><strong>{building.direction || '—'}</strong></div>
                                </div>
                            </div>

                            {!isSale && building.rentAreaResult && (
                                <div className="rent-area">
                                    Diện tích trống: <strong>{building.rentAreaResult}</strong>
                                </div>
                            )}

                            <div className="description">
                                {building.note || 'Thông tin chi tiết vui lòng liên hệ ban quản lý.'}
                            </div>
                        </div>

                        {/* Giá & phí */}
                        <div className="section">
                            <h3 className="section-title">{isSale ? 'Giá bán' : 'Chi phí thuê'}</h3>
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        <th>{isSale ? 'Giá bán' : 'Giá thuê'}</th>
                                        <td className="price">
                                            {formatCurrency(building.rentPrice)}
                                            {!isSale && <small>/tháng</small>}
                                            <small className="note">({building.rentPriceDescription || 'Chưa VAT'})</small>
                                        </td>
                                    </tr>
                                    {!isSale && (
                                        <>
                                            <tr><th>Phí quản lý</th><td>{building.serviceFee || 'Liên hệ'}</td></tr>
                                            <tr><th>Phí ô tô</th><td>{building.carFee || 'Liên hệ'}</td></tr>
                                            <tr><th>Phí xe máy</th><td>{building.motorbikeFee || 'Liên hệ'}</td></tr>
                                            <tr><th>Phí ngoài giờ</th><td>{building.overtimeFee || 'Thỏa thuận'}</td></tr>
                                            <tr><th>Điện</th><td>{building.electricityFee || 'Theo EVN'}</td></tr>
                                            <tr><th>Nước</th><td>{building.waterFee || 'Theo đồng hồ'}</td></tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Điều kiện */}
                        <div className="section">
                            <h3 className="section-title">Điều kiện giao dịch</h3>
                            <div className="conditions">
                                <div>
                                    <FaFileContract className="check" /> Đặt cọc: <strong>{building.deposit || 'Thỏa thuận'}</strong>
                                </div>
                                <div>
                                    <FaMoneyBillWave className="check" /> Thanh toán: <strong>{building.payment || 'Thỏa thuận'}</strong>
                                </div>
                                {!isSale && (
                                    <>
                                        <div>
                                            <FaClock className="check" /> Thời hạn thuê: <strong>{building.rentTime || 'Thỏa thuận'}</strong>
                                        </div>
                                        <div>
                                            <FaCheckCircle className="check" /> Thời gian trang trí: <strong>{building.decorationTime || 'Thỏa thuận'}</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bản đồ */}
                        {building.linkOfBuilding && (
                            <div className="section">
                                <h3 className="section-title">Vị trí</h3>
                                <a href={building.linkOfBuilding} target="_blank" rel="noopener noreferrer" className="map-link">
                                    <FaMapMarkerAlt /> Xem trên Google Maps
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="sticky-sidebar">
                            <div className="price-box">
                                <h4>{isSale ? 'Giá bán' : 'Giá thuê'}</h4>
                                <div className="big-price">{formatCurrency(building.rentPrice)}</div>
                                <p className="note">{building.rentPriceDescription || 'Có thể thương lượng'}</p>
                            </div>

                            <div className="agent">
                                <FaUserTie className="agent-icon" />
                                <div>
                                    Quản lý: <strong>{building.managerName || 'BQL'}</strong>
                                </div>
                            </div>

                            {building.managerPhoneNumber ? (
                                <a href={`tel:${building.managerPhoneNumber}`} className="call-btn">
                                    <FaPhoneAlt /> {building.managerPhoneNumber}
                                </a>
                            ) : (
                                <div className="call-btn disabled">SĐT đang cập nhật</div>
                            )}

                            <form onSubmit={handleSendContact} className="contact-form">
                                <h5>Liên hệ ngay</h5>
                                <input
                                    type="text"
                                    placeholder="Họ tên *"
                                    value={contactForm.fullName}
                                    onChange={e => setContactForm({...contactForm, fullName: e.target.value})}
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="SĐT *"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                                    required
                                />
                                <textarea
                                    placeholder="Nội dung..."
                                    value={contactForm.content}
                                    onChange={e => setContactForm({...contactForm, content: e.target.value})}
                                    rows={4}
                                />
                                <button type="submit" disabled={isSending}>
                                    {isSending ? 'Đang gửi...' : 'Gửi yêu cầu'}
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