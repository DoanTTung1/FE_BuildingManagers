import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaArrowRight, FaBuilding, FaHandshake, FaBalanceScale, FaDraftingCompass } from 'react-icons/fa';
import '../styles/HomePage.css';

// --- DỮ LIỆU TĨNH (Banner, Quận, Dịch vụ) ---
const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
];

// ID phải khớp với Enum/String District trong Database
const POPULAR_DISTRICTS = [
    { id: 'QUAN_1', name: 'Quận 1 - Trung Tâm', desc: 'Trái tim tài chính sầm uất', img: 'https://canhonewcity.com/wp-content/uploads/2017/03/can-ho-chung-cu-new-city-quan-2.jpg', count: 120, size: 'large' },
    { id: 'QUAN_2', name: 'Thủ Thiêm (Q2)', desc: 'Khu đô thị mới hiện đại', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', count: 45, size: 'small' },
    { id: 'QUAN_3', name: 'Quận 3', desc: 'Không gian xanh, biệt thự cổ', img: 'https://khonggianxanh.com/wp-content/uploads/2023/04/kien-truc-biet-thu-xanh-2.jpg', count: 85, size: 'medium' },
    { id: 'QUAN_PHU_NHUAN', name: 'Phú Nhuận', desc: 'Cửa ngõ sân bay', img: 'https://datxanhkhudong.vn/wp-content/uploads/2021/06/can-ho-chung-cu-nhu-cau-tang-cao-2021.jpg', count: 32, size: 'small' },
];

const SERVICES = [
    { icon: <FaBuilding />, title: "Tòa nhà trọn gói", desc: "Không gian làm việc đầy đủ tiện nghi, chỉ cần xách máy tính vào làm ngay." },
    { icon: <FaHandshake />, title: "Môi giới miễn phí", desc: "Hỗ trợ doanh nghiệp tìm kiếm, thương lượng giá thuê tốt nhất thị trường." },
    { icon: <FaBalanceScale />, title: "Hỗ trợ pháp lý", desc: "Tư vấn hợp đồng chặt chẽ, minh bạch, bảo vệ quyền lợi khách thuê." },
    { icon: <FaDraftingCompass />, title: "Thiết kế thi công", desc: "Kết nối các đơn vị thiết kế nội thất văn phòng uy tín, giá ưu đãi." },
];

const HomePage = () => {
    const navigate = useNavigate();

    // State dữ liệu
    const [featuredBuildings, setFeaturedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State hiệu ứng số (Stats)
    const [stats, setStats] = useState({ buildings: 0, clients: 0, satisfaction: 0 });

    // 1. Gọi API lấy danh sách tòa nhà nổi bật
    useEffect(() => {
        const fetchFeaturedData = async () => {
            try {
                // Gọi API số nhiều: /api/buildings
                const res = await axiosClient.get('/api/buildings');
                if (res && Array.isArray(res)) {
                    setFeaturedBuildings(res.slice(0, 4)); // Lấy 4 cái đầu tiên
                }
            } catch (error) {
                console.error("Lỗi tải trang chủ:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeaturedData();

        // Hiệu ứng số nhảy
        const timer = setInterval(() => {
            setStats(prev => ({
                buildings: prev.buildings < 1500 ? prev.buildings + 50 : 1500,
                clients: prev.clients < 800 ? prev.clients + 20 : 800,
                satisfaction: 99
            }));
        }, 50);
        return () => clearInterval(timer);
    }, []);

    // 2. Xử lý gửi liên hệ
    const handleSendContact = async () => {
        if (!contactPhone.trim()) {
            alert("Vui lòng nhập số điện thoại!");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                fullName: "Khách từ Website",
                phone: contactPhone,
                email: "",
                demand: "Yêu cầu tư vấn nhanh từ Trang chủ"
            };
            await axiosClient.post('/api/customers/contact', payload);
            alert("Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.");
            setContactPhone('');
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigateSearch = (districtCode = '') => {
        navigate(`/search${districtCode ? `?district=${districtCode}` : ''}`);
    };

    return (
        <div className="homepage-wrapper">
            {/* --- HERO SECTION --- */}
            <section className="hero-section" style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content fade-in-up">
                    <h1 className="hero-title">
                        Nâng Tầm Vị Thế <br />
                        <span className="highlight-text">Doanh Nghiệp Của Bạn</span>
                    </h1>
                    <p className="hero-subtitle">
                        Hệ thống quản lý và cho thuê văn phòng hàng đầu Việt Nam.<br />
                        Kết nối ngay với không gian làm việc lý tưởng.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary-lg glow-on-hover" onClick={() => handleNavigateSearch()}>
                            🏢 Tìm Tòa Nhà Ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="stats-section glass-effect-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3 className="stat-number">{stats.buildings}+</h3>
                        <p className="stat-label">Tòa nhà cho thuê</p>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-item">
                        <h3 className="stat-number">{stats.clients}+</h3>
                        <p className="stat-label">Khách hàng tin dùng</p>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-item">
                        <h3 className="stat-number">{stats.satisfaction}%</h3>
                        <p className="stat-label">Hài lòng tuyệt đối</p>
                    </div>
                </div>
            </section>

            {/* --- DISTRICT BENTO GRID --- */}
            <section className="section-container district-section">
                <div className="section-header text-center">
                    <h2 className="section-title">🗺️ Tọa Độ Vàng Doanh Nghiệp</h2>
                    <p className="section-desc">Khám phá văn phòng tại các khu vực trọng điểm</p>
                </div>

                <div className="bento-grid">
                    {POPULAR_DISTRICTS.map((district) => (
                        <div
                            key={district.id}
                            className={`bento-item ${district.size === 'large' ? 'item-large' : ''} ${district.size === 'medium' ? 'item-medium' : ''}`}
                            onClick={() => handleNavigateSearch(district.id)}
                        >
                            <img src={district.img} alt={district.name} className="bento-bg" />
                            <div className="bento-overlay"></div>
                            <div className="bento-content">
                                <span className="bento-count">{district.count} tòa nhà</span>
                                <h3 className="bento-title">{district.name}</h3>
                                <p className="bento-desc">{district.desc}</p>
                                <div className="bento-arrow"><FaArrowRight /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- FEATURED BUILDINGS --- */}
            <section className="section-container featured-section">
                <div className="section-header">
                    <h2 className="section-title">🌟 Tòa Nhà Mới Nhất</h2>
                    <p className="section-desc">Dữ liệu được cập nhật liên tục từ hệ thống</p>
                </div>

                <div className="featured-grid">
                    {isLoading ? (
                        <div className="loading-state">Đang tải dữ liệu...</div>
                    ) : featuredBuildings.length > 0 ? (
                        featuredBuildings.map(item => (
                            <div key={item.id} className="featured-card" onClick={() => navigate(`/building/${item.id}`)}>
                                <div className="f-card-img">
                                    {item.image ? (
                                        <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} />
                                    ) : (
                                        <div className="no-image-placeholder"><span>No Image</span></div>
                                    )}
                                    <span className="badge-hot">MỚI</span>
                                </div>
                                <div className="f-card-body">
                                    <h3 title={item.name}>{item.name}</h3>
                                    <p className="f-address">📍 {item.address}</p>
                                    <div className="f-specs">
                                        <span>📐 {item.floorArea}m²</span>
                                        <span className="f-price">${item.rentPrice}<small>/m²</small></span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">Chưa có tòa nhà nào được cập nhật.</div>
                    )}
                </div>

                <div className="view-more-container">
                    <button className="btn-view-more" onClick={() => handleNavigateSearch()}>Xem tất cả tòa nhà →</button>
                </div>
            </section>

            {/* --- SERVICES --- */}
            <section className="section-container services-section">
                <div className="services-wrapper">
                    <div className="services-header">
                        <h2 className="section-title">Giải Pháp Toàn Diện</h2>
                        <p>Đồng hành cùng bạn từ khâu tìm kiếm đến khi ổn định văn phòng.</p>
                    </div>
                    <div className="services-list">
                        {SERVICES.map((s, index) => (
                            <div key={index} className="service-box">
                                <div className="service-icon-wrapper">{s.icon}</div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="cta-modern-section">
                <div className="cta-modern-container">
                    <div className="cta-text">
                        <h2>Sẵn sàng nâng tầm không gian làm việc?</h2>
                        <p>Để lại thông tin, chuyên gia của chúng tôi sẽ gọi lại tư vấn ngay.</p>
                    </div>
                    <div className="cta-form-wrapper">
                        <div className="input-with-button">
                            <input
                                type="text"
                                placeholder="Nhập số điện thoại..."
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                            />
                            <button onClick={handleSendContact} disabled={isSubmitting}>
                                {isSubmitting ? 'Đang Gửi...' : 'Nhận Tư Vấn'}
                            </button>
                        </div>
                        <span className="cta-note">*Cam kết bảo mật thông tin 100%</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;