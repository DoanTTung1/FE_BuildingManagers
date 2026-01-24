import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaArrowRight, FaBuilding, FaSearch, FaMapMarkerAlt,
    FaCheckCircle, FaPhoneAlt, FaStar, FaRegCompass,
    FaCar, FaExpandArrowsAlt, FaHandshake, FaUserTie
} from 'react-icons/fa';
import '../styles/HomePage.css';

// --- ASSETS & MOCK DATA ---
const HERO_BG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80";

const POPULAR_DISTRICTS = [
    { id: 'QUAN_1', name: 'Quận 1', label: 'Trung tâm tài chính', price: '$30 - $60', img: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?auto=format&fit=crop&w=600&q=80', count: 120, size: 'span-2' },
    { id: 'QUAN_3', name: 'Quận 3', label: 'Văn hóa & Ngoại giao', price: '$20 - $45', img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80', count: 85, size: 'span-1' },
    { id: 'QUAN_2', name: 'Thủ Thiêm', label: 'Khu đô thị mới', price: '$25 - $50', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', count: 45, size: 'span-1' },
    { id: 'QUAN_7', name: 'Quận 7', label: 'Phú Mỹ Hưng', price: '$15 - $35', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=600&q=80', count: 60, size: 'span-2' },
];

const PROCESS_STEPS = [
    { icon: <FaSearch />, title: "Tìm kiếm & Lọc", desc: "Hệ thống AI gợi ý văn phòng theo nhu cầu." },
    { icon: <FaUserTie />, title: "Tư vấn & Khảo sát", desc: "Chuyên viên hỗ trợ xem thực tế miễn phí." },
    { icon: <FaHandshake />, title: "Đàm phán & Ký kết", desc: "Hỗ trợ deal giá tốt hơn thị trường 10%." }
];

const PARTNERS = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
];

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredBuildings, setFeaturedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Advanced Search State
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDistrict, setSearchDistrict] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [areaRange, setAreaRange] = useState('');

    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/600x400?text=Building+Image";
        if (imagePath.startsWith("http")) return imagePath;
        return `http://localhost:8080/api/buildings/images/${imagePath}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API lấy nhiều trường dữ liệu hơn
                const res = await axiosClient.get('/api/buildings?page=0&size=6&sort=rentPrice,desc');
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
        if (searchDistrict) query += `district=${searchDistrict}&`;
        if (priceRange) query += `price=${priceRange}&`;
        if (areaRange) query += `area=${areaRange}`;
        navigate(query);
    };

    const handleContact = async () => {
        if (!contactPhone || contactPhone.length < 9) return alert("Vui lòng nhập SĐT hợp lệ");
        setIsSubmitting(true);
        try {
            await axiosClient.post('/api/customers/contact', { fullName: "Guest Homepage", phone: contactPhone, demand: "Yêu cầu báo giá nhanh" });
            alert("Đã gửi yêu cầu! Chuyên viên sẽ gọi lại trong 5 phút.");
            setContactPhone('');
        } catch (e) { alert("Lỗi kết nối server."); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="home-container">

            {/* 1. HERO SECTION CAO CẤP */}
            <section className="hero-modern" style={{ backgroundImage: `url(${HERO_BG})` }}>
                <div className="hero-overlay-gradient"></div>
                <div className="hero-content">
                    <span className="hero-tag">#1 Nền tảng cho thuê văn phòng TP.HCM</span>
                    <h1 className="hero-heading">
                        Nâng Tầm <span className="text-highlight">Vị Thế Doanh Nghiệp</span>
                    </h1>
                    <p className="hero-sub">Hệ thống dữ liệu minh bạch 1,500+ tòa nhà. Cam kết giá thuê tốt nhất thị trường.</p>

                    {/* Advanced Search Box */}
                    <div className="advanced-search-box">
                        <div className="search-row top">
                            <div className="input-group flex-grow">
                                <FaSearch className="icon" />
                                <input
                                    type="text"
                                    placeholder="Nhập tên tòa nhà, đường..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <FaMapMarkerAlt className="icon" />
                                <select onChange={(e) => setSearchDistrict(e.target.value)}>
                                    <option value="">Toàn bộ TP.HCM</option>
                                    <option value="QUAN_1">Quận 1</option>
                                    <option value="QUAN_3">Quận 3</option>
                                    <option value="QUAN_2">Thủ Thiêm</option>
                                    <option value="QUAN_BINH_THANH">Bình Thạnh</option>
                                    <option value="QUAN_7">Quận 7</option>
                                </select>
                            </div>
                        </div>
                        <div className="search-row bottom">
                            <div className="input-group">
                                <span className="label">Mức giá ($)</span>
                                <select onChange={(e) => setPriceRange(e.target.value)}>
                                    <option value="">Tất cả mức giá</option>
                                    <option value="0-20">Dưới $20</option>
                                    <option value="20-40">$20 - $40</option>
                                    <option value="40-100">Trên $40 (Hạng A)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <span className="label">Diện tích (m²)</span>
                                <select onChange={(e) => setAreaRange(e.target.value)}>
                                    <option value="">Mọi diện tích</option>
                                    <option value="0-100">Dưới 100m²</option>
                                    <option value="100-300">100 - 300m²</option>
                                    <option value="300-1000">Trên 300m²</option>
                                </select>
                            </div>
                            <button className="btn-search-primary" onClick={handleSearch}>
                                Tìm Kiếm Ngay
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. TRUST STRIP (Đối tác) */}
            <div className="trust-strip">
                <div className="container">
                    <p>Được tin tưởng bởi 500+ doanh nghiệp hàng đầu</p>
                    <div className="logos-grid">
                        {PARTNERS.map((logo, index) => (
                            <img key={index} src={logo} alt="Partner Logo" className="partner-logo" />
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. FEATURED BUILDINGS (Thẻ chi tiết) */}
            <section className="section-padded bg-light">
                <div className="container">
                    <div className="section-header flex-between">
                        <div>
                            <span className="sub-title">Lựa chọn tốt nhất</span>
                            <h2>Văn Phòng Hạng A & B Nổi Bật</h2>
                        </div>
                        <button className="btn-outline" onClick={() => navigate('/search')}>Xem tất cả dự án <FaArrowRight /></button>
                    </div>

                    <div className="cards-grid">
                        {isLoading ? <div className="loading-spinner"></div> :
                            featuredBuildings.map(item => (
                                <div className="property-card" key={item.id} onClick={() => navigate(`/building/${item.id}`)}>
                                    <div className="card-thumb">
                                        <img
                                            src={getImageUrl(item.avatar)}
                                            alt={item.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/500x300?text=Building"; }}
                                        />
                                        <div className="badges">
                                            {/* Logic giả định hạng dựa trên giá */}
                                            <span className={`badge ${item.rentPrice >= 30 ? 'grade-a' : 'grade-b'}`}>
                                                {item.rentPrice >= 30 ? 'Hạng A' : 'Hạng B'}
                                            </span>
                                            {item.managerName && <span className="badge managed">Managed</span>}
                                        </div>
                                        <div className="price-overlay">
                                            ${item.rentPrice} <small>/m²</small>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h3 title={item.name}>{item.name}</h3>
                                        <p className="location"><FaMapMarkerAlt /> {item.street}, {item.district}</p>

                                        <div className="card-specs">
                                            <div className="spec-item" title="Diện tích sàn">
                                                <FaExpandArrowsAlt /> <span>{item.floorArea} m²</span>
                                            </div>
                                            <div className="spec-item" title="Hướng tòa nhà">
                                                <FaRegCompass /> <span>{item.direction || 'Đông Nam'}</span>
                                            </div>
                                            <div className="spec-item" title="Phí dịch vụ">
                                                <FaStar /> <span>+${item.serviceFee || '5'} phí DV</span>
                                            </div>
                                            <div className="spec-item" title="Chỗ đậu xe">
                                                <FaCar /> <span>{item.carFees ? 'Có hầm' : 'Liên hệ'}</span>
                                            </div>
                                        </div>

                                        <div className="card-footer">
                                            <div className="manager-info">
                                                <small>Quản lý bởi:</small>
                                                <strong>{item.managerName || "Building Management"}</strong>
                                            </div>
                                            <button className="btn-view">Chi tiết</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>

            {/* 4. DISTRICTS (Bento Grid nâng cấp) */}
            <section className="section-padded">
                <div className="container">
                    <div className="section-header center">
                        <span className="sub-title">Khu vực trọng điểm</span>
                        <h2>Khám Phá Theo Quận</h2>
                    </div>
                    <div className="bento-grid">
                        {POPULAR_DISTRICTS.map((d) => (
                            <div key={d.id} className={`bento-card ${d.size}`} onClick={() => navigate(`/search?district=${d.id}`)}>
                                <img src={d.img} alt={d.name} />
                                <div className="bento-content">
                                    <div className="bento-top">
                                        <span className="district-tag">{d.count} Tòa nhà</span>
                                    </div>
                                    <div className="bento-bottom">
                                        <h3>{d.name}</h3>
                                        <p>{d.label}</p>
                                        <div className="price-range">Giá TB: {d.price}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. PROCESS (Quy trình) */}
            <section className="process-section">
                <div className="container">
                    <div className="section-header center">
                        <h2>Quy Trình Thuê Dễ Dàng</h2>
                    </div>
                    <div className="process-steps">
                        {PROCESS_STEPS.map((step, index) => (
                            <div className="step-item" key={index}>
                                <div className="step-icon">{step.icon}</div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                                {index < PROCESS_STEPS.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. CONTACT CTA */}
            <section className="cta-modern">
                <div className="container cta-inner">
                    <div className="cta-text">
                        <h2>Bạn cần tư vấn báo giá ngay?</h2>
                        <p>Để lại số điện thoại, chúng tôi sẽ gửi danh sách văn phòng trống kèm báo giá chi tiết qua Zalo trong 5 phút.</p>
                        <ul className="benefits">
                            <li><FaCheckCircle /> Báo giá minh bạch, không chênh lệch</li>
                            <li><FaCheckCircle /> Hỗ trợ xe đưa đón xem văn phòng</li>
                        </ul>
                    </div>
                    <div className="cta-form">
                        <div className="input-wrap-lg">
                            <FaPhoneAlt />
                            <input
                                type="text"
                                placeholder="Nhập số điện thoại của bạn..."
                                value={contactPhone}
                                onChange={e => setContactPhone(e.target.value)}
                            />
                            <button onClick={handleContact} disabled={isSubmitting}>
                                {isSubmitting ? "..." : "Gửi Yêu Cầu"}
                            </button>
                        </div>
                        <small>Cam kết bảo mật thông tin khách hàng.</small>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;