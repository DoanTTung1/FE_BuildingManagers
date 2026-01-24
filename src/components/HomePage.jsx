import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaSearch, FaMapMarkerAlt, FaArrowRight, FaBuilding,
    FaExpandArrowsAlt, FaCar, FaStar, FaCheckCircle, FaPhoneAlt,
    FaLongArrowAltRight // <--- Import thêm icon này cho đẹp
} from 'react-icons/fa';
import '../styles/HomePage.css';

// --- ASSETS & CONFIG ---
const HERO_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80";

// Dữ liệu mới cho phần Accordion (Thêm mô tả và Tag)
// Dữ liệu Quận khớp với Database (ID là số)
const POPULAR_DISTRICTS = [
    {
        id: 1,  // ID trong DB là số 1
        name: 'Quận 1',
        tag: 'Financial Hub',
        desc: 'Trung tâm tài chính, nơi quy tụ các tập đoàn đa quốc gia và văn phòng hạng A.',
        img: 'https://images.unsplash.com/photo-1657644096992-62b43ea8ae30?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        total: '120 Tòa'
    },
    {
        id: 3,  // ID trong DB là số 3
        name: 'Quận 3',
        tag: 'Heritage & Culture',
        desc: 'Sự giao thoa hoàn hảo giữa kiến trúc Pháp cổ điển và không gian hiện đại.',
        img: 'https://plus.unsplash.com/premium_photo-1680777484547-de735ff024a4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        total: '85 Tòa'
    },
    {
        id: 5,  // ID trong DB là số 5 (Bình Thạnh)
        name: 'Bình Thạnh',
        tag: 'The Gateway',
        desc: 'Cửa ngõ phía Đông sầm uất, kết nối nhanh chóng giữa Quận 1 và khu đô thị mới.',
        img: 'https://plus.unsplash.com/premium_photo-1678903964473-1271ecfb0288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        total: '60 Tòa'
    },
    {
        id: 6,  // ID trong DB là số 6 (Phú Nhuận)
        name: 'Phú Nhuận',
        tag: 'Airport Connection',
        desc: 'Vị trí chiến lược kết nối sân bay, môi trường làm việc nhiều cây xanh và yên tĩnh.',
        img: 'https://images.unsplash.com/photo-1725891025293-16981168203d?q=80&w=628&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        total: '40 Tòa'
    },
];

const FEATURES_LIST = [
    { title: "Nguồn hàng độc quyền", desc: "Truy cập 500+ sàn văn phòng Off-market chưa công bố." },
    { title: "Thương lượng giá tốt", desc: "Cam kết deal giá thấp hơn thị trường từ 5-10%." },
    { title: "Pháp lý minh bạch", desc: "Hỗ trợ rà soát hợp đồng và thủ tục pháp lý miễn phí." }
];

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredBuildings, setFeaturedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDistrict, setSearchDistrict] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/600x400?text=Building";
        if (imagePath.startsWith("http")) return imagePath;
        return `http://localhost:8080/api/buildings/images/${imagePath}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/api/buildings?page=0&size=6&sort=rentPrice,desc');
                if (res.content) setFeaturedBuildings(res.content);
                else if (Array.isArray(res)) setFeaturedBuildings(res.slice(0, 6));
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = () => {
        let query = `/search?`;
        if (searchKeyword) query += `name=${searchKeyword}&`;
        if (searchDistrict) query += `district=${searchDistrict}`;
        navigate(query);
    };

    const handleContact = async () => {
        if (!contactPhone || contactPhone.length < 9) return alert("Vui lòng nhập số điện thoại hợp lệ");
        setIsSubmitting(true);
        try {
            await axiosClient.post('/api/customers/contact', {
                fullName: "Khách từ Trang Chủ",
                phone: contactPhone,
                demand: "Yêu cầu tư vấn nhanh"
            });
            alert("Đã gửi yêu cầu thành công!");
            setContactPhone('');
        } catch (e) {
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="home-container">

            {/* --- 1. HERO SECTION --- */}
            <section className="hero-modern" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">#1 Nền Tảng Cho Thuê Văn Phòng</span>
                    <h1 className="hero-heading">Nâng Tầm <br /><span className="text-highlight">Vị Thế Doanh Nghiệp</span></h1>
                    <p className="hero-sub">Kết nối doanh nghiệp với 1,500+ tòa nhà văn phòng hạng A, B, C tại TP.HCM.</p>

                    <div className="search-glass-panel">
                        <div className="search-field">
                            <FaSearch className="icon" />
                            <input type="text" placeholder="Tên tòa nhà, đường..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                        </div>
                        <div className="divider"></div>
                        <div className="search-field">
                            <FaMapMarkerAlt className="icon" />
                            <select value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)}>
                                <option value="">Tất cả khu vực</option>
                                <option value="QUAN_1">Quận 1</option>
                                <option value="QUAN_3">Quận 3</option>
                                <option value="QUAN_2">Thủ Thiêm</option>
                                <option value="QUAN_BINH_THANH">Bình Thạnh</option>
                                <option value="QUAN_7">Quận 7</option>
                            </select>
                        </div>
                        <button className="btn-search-glow" onClick={handleSearch}>Khám Phá</button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat"><b>1,500+</b><span>Tòa nhà</span></div>
                        <div className="stat"><b>500+</b><span>Đối tác</span></div>
                        <div className="stat"><b>98%</b><span>Hài lòng</span></div>
                    </div>
                </div>
            </section>

            {/* --- 2. STRATEGIC LOCATIONS (ACCORDION ULTRA) --- */}
            {/* Đây là phần bạn muốn làm đẹp hơn */}
            <section className="section-locations-ultra">
                <div className="section-header">
                    <h2>Vị Trí Chiến Lược</h2>
                    <p style={{ color: 'var(--text-sub)' }}>Khám phá văn phòng tại các khu vực kinh tế trọng điểm</p>
                </div>

                <div className="accordion-gallery">
                    {POPULAR_DISTRICTS.map((d, index) => (
                        <div key={d.id} className="accordion-card" onClick={() => navigate(`/search?district=${d.id}`)}>
                            {/* Ảnh nền */}
                            <div className="acc-img" style={{ backgroundImage: `url(${d.img})` }}></div>
                            <div className="acc-overlay"></div>

                            {/* Số thứ tự */}
                            <div className="acc-index">0{index + 1}</div>

                            {/* Nội dung khi đóng (Chữ dọc) */}
                            <div className="acc-content-collapsed">
                                <h3>{d.name}</h3>
                            </div>

                            {/* Nội dung khi mở (Mô tả chi tiết) */}
                            <div className="acc-content-expanded">
                                <span className="acc-tag">{d.tag}</span>
                                <h3>{d.name}</h3>
                                <p>{d.desc}</p>
                                <div className="acc-meta">
                                    <span className="acc-total">{d.total}</span>
                                    <span className="btn-arrow"><FaLongArrowAltRight /></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 3. PREMIUM CARDS --- */}
            <section className="section-padded bg-gray">
                <div className="section-header-flex">
                    <div>
                        <h2>Tòa Nhà Nổi Bật</h2>
                        <p style={{ color: 'var(--text-sub)' }}>Lựa chọn hàng đầu của các doanh nghiệp tuần qua</p>
                    </div>
                    <button className="btn-link" onClick={() => navigate('/search')}>Xem tất cả <FaArrowRight /></button>
                </div>

                <div className="cards-grid">
                    {isLoading ? <p>Đang tải dữ liệu...</p> : featuredBuildings.map(item => (
                        <div className="premium-card" key={item.id} onClick={() => navigate(`/building/${item.id}`)}>
                            <div className="card-image">
                                <img src={getImageUrl(item.avatar || item.image)} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x400?text=Building"; }} />
                                <div className="price-tag">${item.rentPrice} <span>/m²</span></div>
                                <div className="status-tag">Cho thuê</div>
                            </div>
                            <div className="card-details">
                                <h3 title={item.name}>{item.name}</h3>
                                <p className="address"><FaMapMarkerAlt style={{ marginRight: '5px', color: 'var(--blue)' }} /> {item.street}, {item.district}</p>
                                <div className="specs">
                                    <span><FaExpandArrowsAlt /> {item.floorArea}m²</span>
                                    <span><FaCar /> {item.carFee ? 'Có hầm' : 'Liên hệ'}</span>
                                    <span><FaStar /> Hạng A</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 4. CTA MESH --- */}
            <section className="cta-mesh-section">
                <div className="cta-grid">
                    <div className="cta-content">
                        <h2>Giải pháp tìm văn phòng <br /> thông minh & miễn phí</h2>
                        <ul className="features-list">
                            {FEATURES_LIST.map((f, i) => (
                                <li key={i}>
                                    <div className="check-icon"><FaCheckCircle /></div>
                                    <div><h4>{f.title}</h4><p>{f.desc}</p></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="cta-form-card">
                        <h3>Nhận báo giá ngay</h3>
                        <p>Để lại số điện thoại, chuyên viên sẽ gửi list văn phòng phù hợp trong 5 phút.</p>
                        <div className="input-wrap">
                            <FaPhoneAlt className="input-icon" />
                            <input type="text" placeholder="Số điện thoại của bạn..." value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                        </div>
                        <button className="btn-submit-full" onClick={handleContact} disabled={isSubmitting}>{isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu Tư Vấn"}</button>
                        <span className="secure-note">🔒 Thông tin được bảo mật 100%</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;