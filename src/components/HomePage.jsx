import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaArrowRight, FaBuilding, FaSearch, FaMapMarkerAlt,
    FaCheckCircle, FaPhoneAlt
} from 'react-icons/fa';
import '../styles/HomePage.css';

// --- ASSETS & DATA ---
const HERO_BG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80";

const POPULAR_DISTRICTS = [
    { id: 'QUAN_1', name: 'Quận 1', label: 'Financial District', img: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?auto=format&fit=crop&w=600&q=80', count: 120, size: 'span-2' },
    { id: 'QUAN_3', name: 'Quận 3', label: 'Heritage & Green', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80', count: 85, size: 'span-1' },
    { id: 'QUAN_2', name: 'Thủ Thiêm', label: 'New Urban City', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', count: 45, size: 'span-1' },
    { id: 'QUAN_7', name: 'Quận 7', label: 'Phu My Hung', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=600&q=80', count: 60, size: 'span-2' },
];

const FEATURES = [
    { title: "Nguồn hàng độc quyền", desc: "Tiếp cận 500+ sàn văn phòng Off-market không công khai." },
    { title: "Giá thuê tốt nhất", desc: "Cam kết thương lượng giá thuê thấp hơn thị trường 5-10%." },
    { title: "Pháp lý minh bạch", desc: "Đội ngũ luật sư rà soát hợp đồng miễn phí cho khách thuê." }
];

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredBuildings, setFeaturedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search State
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDistrict, setSearchDistrict] = useState('');

    // Contact State
    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm xử lý link ảnh (Fix lỗi ảnh đen)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
        if (imagePath.startsWith("http")) return imagePath;
        // Thay localhost bằng domain thật khi deploy
        return `http://localhost:8080/api/buildings/images/${imagePath}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/api/buildings?page=0&size=6&sort=id,desc');
                if (res.content) setFeaturedBuildings(res.content);
                else if (Array.isArray(res)) setFeaturedBuildings(res.slice(0, 6));
            } catch (error) {
                console.error("Error fetching data:", error);
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
        if (!contactPhone || contactPhone.length < 9) return alert("Vui lòng nhập SĐT hợp lệ");
        setIsSubmitting(true);
        try {
            await axiosClient.post('/api/customers/contact', { fullName: "Guest", phone: contactPhone, demand: "Homepage Request" });
            alert("Đã gửi yêu cầu! Chúng tôi sẽ gọi lại ngay.");
            setContactPhone('');
        } catch (e) { alert("Lỗi hệ thống."); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="home-container">

            {/* 1. HERO SECTION */}
            <section className="hero-modern" style={{ backgroundImage: `url(${HERO_BG})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    
                    <h1 className="hero-heading">
                       Kết Nối Không Gian Sống <br />
                        <span className="text-highlight">& Đầu Tư Giá Trị</span>
                    </h1>
                    <p className="hero-sub">Kết nối doanh nghiệp với 1,500+ tòa nhà văn phòng hạng A, B, C tại TP.HCM.</p>

                    <div className="search-glass-panel">
                        <div className="search-field">
                            <FaSearch className="icon" />
                            <input
                                type="text"
                                placeholder="Tên tòa nhà, đường..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                        <div className="divider"></div>
                        <div className="search-field">
                            <FaMapMarkerAlt className="icon" />
                            <select onChange={(e) => setSearchDistrict(e.target.value)}>
                                <option value="">Tất cả khu vực</option>
                                <option value="QUAN_1">Quận 1</option>
                                <option value="QUAN_2">Thủ Thiêm</option>
                                <option value="QUAN_3">Quận 3</option>
                                <option value="QUAN_7">Quận 7</option>
                                <option value="QUAN_BINH_THANH">Bình Thạnh</option>
                            </select>
                        </div>
                        <button className="btn-search-glow" onClick={handleSearch}>
                            Khám Phá Ngay
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat"><b>1,500+</b> <span>Tòa nhà</span></div>
                        <div className="stat"><b>5,000+</b> <span>Khách hàng</span></div>
                        <div className="stat"><b>98%</b> <span>Hài lòng</span></div>
                    </div>
                </div>
            </section>

            {/* 2. BENTO GRID DISTRICTS */}
            <section className="section-padded">
                <div className="section-header">
                    <h2>Vị Trí Chiến Lược</h2>
                    <p>Văn phòng tại các khu vực kinh tế trọng điểm</p>
                </div>
                <div className="bento-grid">
                    {POPULAR_DISTRICTS.map((d) => (
                        <div key={d.id} className={`bento-card ${d.size}`} onClick={() => navigate(`/search?district=${d.id}`)}>
                            <img src={d.img} alt={d.name} />
                            <div className="bento-overlay">
                                <span className="bento-label">{d.label}</span>
                                <h3>{d.name}</h3>
                                <div className="bento-meta">{d.count} tòa nhà đang cho thuê</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. FEATURED BUILDINGS */}
            <section className="section-padded bg-gray">
                <div className="section-header flex-between">
                    <div>
                        <h2>Tòa Nhà Nổi Bật</h2>
                        <p>Lựa chọn hàng đầu của các doanh nghiệp tuần qua</p>
                    </div>
                    <button className="btn-link" onClick={() => navigate('/search')}>Xem tất cả <FaArrowRight /></button>
                </div>

                <div className="cards-grid">
                    {isLoading ? <div className="loading-dots">Đang tải dữ liệu...</div> :
                        featuredBuildings.map(item => (
                            <div className="premium-card" key={item.id} onClick={() => navigate(`/building/${item.id}`)}>
                                <div className="card-image">
                                    <img
                                        src={getImageUrl(item.avatar || item.image)}
                                        alt={item.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/500x300?text=Updating..."; }}
                                    />
                                    <div className="price-tag">${item.rentPrice} <span>/m²</span></div>
                                    <div className="status-tag">Cho thuê</div>
                                </div>
                                <div className="card-details">
                                    <h3 title={item.name}>{item.name}</h3>
                                    <p className="address">{item.address || `${item.street}, ${item.district}`}</p>
                                    <div className="specs">
                                        <span><FaBuilding /> {item.floorArea}m²</span>
                                        <span><FaCheckCircle /> Hạng A</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* 4. CTA */}
            <section className="cta-mesh-section">
                <div className="cta-grid">
                    <div className="cta-content">
                        <h2>Giải pháp tìm văn phòng <br /> thông minh & miễn phí</h2>
                        <ul className="features-list">
                            {FEATURES.map((f, i) => (
                                <li key={i}>
                                    <div className="check-icon"><FaCheckCircle /></div>
                                    <div>
                                        <h4>{f.title}</h4>
                                        <p>{f.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="cta-form-card">
                        <h3>Nhận báo giá ngay</h3>
                        <p>Để lại SĐT, chuyên viên sẽ gửi list văn phòng phù hợp trong 5 phút.</p>
                        <div className="input-wrap">
                            <FaPhoneAlt className="input-icon" />
                            <input
                                type="text"
                                placeholder="Số điện thoại của bạn"
                                value={contactPhone}
                                onChange={e => setContactPhone(e.target.value)}
                            />
                        </div>
                        <button className="btn-submit-full" onClick={handleContact} disabled={isSubmitting}>
                            {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu Tư Vấn"}
                        </button>
                        <span className="secure-note">🔒 Thông tin được bảo mật 100%</span>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;