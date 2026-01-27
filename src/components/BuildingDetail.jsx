import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext'; // 1. Import AuthContext
import {
    FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle,
    FaCar, FaBolt, FaShieldAlt, FaExpandArrowsAlt, FaClock,
    FaBuilding, FaLayerGroup,
    FaWind, FaMotorcycle, FaWater, FaFileContract, FaMoneyBillWave, FaUserTie,
    FaEye // Thêm icon con mắt
} from 'react-icons/fa';
import '../styles/BuildingDetail.css';
import toast from 'react-hot-toast';

// Helper: Format tiền tệ
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Helper: Format số thường
const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
};

// Helper: Hàm che số điện thoại (0909123456 -> 0909******)
const maskPhone = (phone) => {
    if (!phone || phone.length < 4) return '***';
    return phone.substring(0, 4) + '******';
};

const BuildingDetail = () => {
    const { id } = useParams();

    // 2. Lấy user và hàm mở modal từ Context
    const { user, openModal } = useAuth();

    const [building, setBuilding] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // 3. State kiểm soát việc hiện số (Mặc định là false - ẩn)
    const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

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
        if (!contactForm.phone || !contactForm.fullName) return toast.error("Vui lòng nhập đủ thông tin!");
        setIsSending(true);
        try {
            await axiosClient.post('/api/customers/contact', {
                fullName: contactForm.fullName,
                phone: contactForm.phone,
                demand: `Khách quan tâm ID ${id} [${building.transactionType}]: ${contactForm.content}`
            });
            toast.success("Đã gửi thành công! Chúng tôi sẽ liên hệ sớm.");
            setContactForm({ fullName: '', phone: '', content: '' });
        } catch (error) {
            toast.error("Gửi thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsSending(false);
        }
    };

    const getSafeImageUrl = (url) => {
        return (url && url.startsWith("http")) ? url : "https://placehold.co/800x500?text=No+Image+Available";
    };

    // 4. Xử lý khi bấm vào nút xem số
    const handleRevealPhone = (e) => {
        e.preventDefault();
        if (user) {
            // Nếu đã đăng nhập -> Hiện số
            setIsPhoneRevealed(true);
        } else {
            // Nếu chưa đăng nhập -> Báo lỗi và Mở form đăng nhập
            toast('Vui lòng đăng nhập để xem số điện thoại!', {
                icon: '🔒',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            openModal(); // Gọi hàm mở AuthModal từ Context
        }
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
                        {/* Header */}
                        <div className="header-info">
                            <h1 className="b-title">{building.name}</h1>
                            <div className="header-badges">
                                <span className="badge rank">Hạng {building.level || 'Khác'}</span>
                                {building.managerName && <span className="badge manager">QL: {building.managerName}</span>}
                            </div>
                        </div>

                        {/* Hình ảnh Hero */}
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

                        {/* Thông tin chung */}
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

                        {/* Bảng giá */}
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
                                <div><FaFileContract className="check" /> Đặt cọc: <strong>{building.deposit || 'Thỏa thuận'}</strong></div>
                                <div><FaMoneyBillWave className="check" /> Thanh toán: <strong>{building.payment || 'Thỏa thuận'}</strong></div>
                                {!isSale && (
                                    <>
                                        <div><FaClock className="check" /> Thời hạn thuê: <strong>{building.rentTime || 'Thỏa thuận'}</strong></div>
                                        <div><FaCheckCircle className="check" /> Thời gian trang trí: <strong>{building.decorationTime || 'Thỏa thuận'}</strong></div>
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

                    {/* Sidebar bên phải */}
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

                            {/* --- 5. LOGIC HIỂN THỊ SỐ ĐIỆN THOẠI (QUAN TRỌNG) --- */}
                            {building.managerPhoneNumber ? (
                                <div className="phone-wrapper">
                                    {isPhoneRevealed ? (
                                        // Nếu ĐÃ hiện số -> Nút gọi bình thường
                                        <a href={`tel:${building.managerPhoneNumber}`} className="call-btn">
                                            <FaPhoneAlt /> {building.managerPhoneNumber}
                                        </a>
                                    ) : (
                                        // Nếu ẨN số -> Nút bấm để hiện
                                        <button onClick={handleRevealPhone} className="call-btn blur-btn">
                                            <FaPhoneAlt /> {maskPhone(building.managerPhoneNumber)}
                                            <span className="reveal-text"><FaEye /> Hiện số</span>
                                        </button>
                                    )}
                                    {/* Dòng nhắc nhở nhỏ */}
                                    {!isPhoneRevealed && <small className="auth-hint">* Đăng nhập để xem SĐT</small>}
                                </div>
                            ) : (
                                <div className="call-btn disabled">SĐT đang cập nhật</div>
                            )}

                            <form onSubmit={handleSendContact} className="contact-form">
                                <h5>Liên hệ ngay</h5>
                                <input
                                    type="text"
                                    placeholder="Họ tên *"
                                    value={contactForm.fullName}
                                    onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })}
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="SĐT *"
                                    value={contactForm.phone}
                                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Nội dung..."
                                    value={contactForm.content}
                                    onChange={e => setContactForm({ ...contactForm, content: e.target.value })}
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