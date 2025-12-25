import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/BuildingSearch.css';

// --- Component Skeleton (Hiển thị khi đang tải) ---
const SkeletonCard = () => (
    <div className="building-card skeleton">
        <div className="card-img-wrapper shimmer"></div>
        <div className="card-body">
            <div className="skeleton-text title shimmer"></div>
            <div className="skeleton-text addr shimmer"></div>
            <div className="skeleton-row">
                <div className="skeleton-text half shimmer"></div>
                <div className="skeleton-text half shimmer"></div>
            </div>
        </div>
    </div>
);
// --------------------------------------------------

const BuildingSearch = () => {
    const [formData, setFormData] = useState({
        name: '', floorArea: '', district: '', rentPriceFrom: '', rentPriceTo: ''
    });
    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Mặc định là true để hiện skeleton ngay

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/api/building', { params: formData });
            // Thêm delay nhẹ 0.5s để người dùng kịp nhìn thấy hiệu ứng skeleton đẹp mắt
            setTimeout(() => {
                setBuildings(res);
                setIsLoading(false);
            }, 500);
            
        } catch (error) {
            console.error("Lỗi:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="search-page-wrapper">
            <div className="search-container glass-effect">
                {/* --- PANEL TÌM KIẾM --- */}
                <div className="search-panel">
                    <div className="panel-header">
                        <h2 className="title">🏢 Khám Phá Không Gian Mơ Ước</h2>
                        <p className="subtitle">Tìm kiếm văn phòng, tòa nhà phù hợp nhất với bạn</p>
                    </div>
                    
                    <div className="search-inputs-grid">
                        {/* Các ô input giữ nguyên logic, chỉ thay đổi class để style */}
                        <div className="input-group floating-label">
                            <input type="text" id="name" name="name" placeholder=" " value={formData.name} onChange={handleChange} />
                            <label htmlFor="name">Tên tòa nhà</label>
                        </div>
                        <div className="input-group floating-label">
                            <input type="number" id="floorArea" name="floorArea" placeholder=" " value={formData.floorArea} onChange={handleChange} />
                            <label htmlFor="floorArea">Diện tích sàn (m²)</label>
                        </div>
                        <div className="input-group">
                             <select name="district" value={formData.district} onChange={handleChange} className="custom-select">
                                <option value="">📍 Tất cả Quận</option>
                                <option value="Q1">Quận 1</option>
                                <option value="Q2">Quận 2</option>
                                <option value="Q3">Quận 3</option>
                                <option value="Q_PN">Quận Phú Nhuận</option>
                                <option value="Q_TB">Quận Tân Bình</option>
                            </select>
                        </div>
                        <div className="price-range-group">
                            <div className="input-group floating-label input-short">
                                <input type="number" id="priceFrom" name="rentPriceFrom" placeholder=" " value={formData.rentPriceFrom} onChange={handleChange} />
                                <label htmlFor="priceFrom">$ Giá từ</label>
                            </div>
                            <span className="separator">-</span>
                            <div className="input-group floating-label input-short">
                                <input type="number" id="priceTo" name="rentPriceTo" placeholder=" " value={formData.rentPriceTo} onChange={handleChange} />
                                <label htmlFor="priceTo">$ Đến giá</label>
                            </div>
                        </div>
                    </div>
                    <div className="btn-container">
                        <button className="btn-search glow-on-hover" onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : '🔍 Tìm Kiếm Ngay'}
                        </button>
                    </div>
                </div>

                {/* --- DANH SÁCH KẾT QUẢ --- */}
                <div className="result-container">
                    <h3 className="result-title">
                        {isLoading ? "Đang tìm kiếm..." : `Kết quả (${buildings.length} tòa nhà)`}
                    </h3>
                    
                    <div className="building-grid">
                        {isLoading ? (
                            // Hiển thị 6 cái skeleton khi đang tải
                            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
                        ) : buildings.length > 0 ? (
                            buildings.map((item) => (
                                <div key={item.id} className="building-card fade-in">
                                    {/* Wrapper cho hình ảnh để làm hiệu ứng zoom */}
                                    <div className="card-img-wrapper">
                                        <img 
                                            src={item.image ? `data:image/jpeg;base64,${item.image}` : "https://source.unsplash.com/random/400x300/?office,building"} 
                                            alt={item.name} 
                                        />
                                        {/* Badge trạng thái (ví dụ) */}
                                        <div className="img-badge">Cho thuê</div>
                                    </div>
                                    
                                    <div className="card-body">
                                        <div className="card-header-flex">
                                            <h4 className="b-name" title={item.name}>{item.name}</h4>
                                            <span className="price-tag">{item.rentPrice}$<small>/m²</small></span>
                                        </div>
                                        
                                        <p className="b-addr">📍 {item.address}</p>
                                        
                                        <div className="b-specs-grid">
                                            <div className="spec-item">
                                                <i className="spec-icon">📐</i>
                                                <span>Sàn: <b>{item.floorArea}m²</b></span>
                                            </div>
                                            <div className="spec-item">
                                                <i className="spec-icon">🏢</i>
                                                <span>Trống: <b>{item.emptyArea || "LH"}</b></span>
                                            </div>
                                        </div>

                                        <div className="b-footer">
                                            <div className="manager-info">
                                                <div className="manager-avatar">👤</div>
                                                <div className="manager-details">
                                                    <span className="m-name">{item.managerName || "Tư vấn viên"}</span>
                                                    <span className="m-phone">{item.managerPhone || "Liên hệ ngay"}</span>
                                                </div>
                                            </div>
                                            <button className="btn-detail-outline">Xem Chi Tiết →</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data-found">
                                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Not found" width="100" />
                                <p>Không tìm thấy tòa nhà nào phù hợp tiêu chí!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildingSearch;