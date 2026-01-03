import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaSearch, FaMapMarkerAlt, FaBuilding, FaDollarSign,
    FaRulerCombined, FaFilter, FaArrowRight, FaChevronLeft,
    FaChevronRight, FaUndo, FaCheck
} from 'react-icons/fa';
import '../styles/BuildingSearch.css';

// ... (Giữ nguyên SkeletonCard và BUILDING_TYPES) ...
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

const BUILDING_TYPES = [
    { code: 'NOI_THAT', name: 'Nội thất' },
    { code: 'TANG_TRET', name: 'Tầng trệt' },
    { code: 'NGUYEN_CAN', name: 'Nguyên căn' }
];

// --- CẤU HÌNH CHỌN NHANH (QUICK SELECT) ---
const DISTRICTS = [
    { code: 'QUAN_1', name: 'Q.1' },
    { code: 'QUAN_2', name: 'Q.2' },
    { code: 'QUAN_3', name: 'Q.3' },
    { code: 'QUAN_4', name: 'Q.4' },
    { code: 'QUAN_BINH_THANH', name: 'B.Thạnh' },
    { code: 'QUAN_PHU_NHUAN', name: 'P.Nhuận' }
];

const PRICE_RANGES = [
    { label: '< $1k', min: '', max: '1000' },
    { label: '$1k - $3k', min: '1000', max: '3000' },
    { label: '> $3k', min: '3000', max: '' },
];

const BuildingSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        name: '', floorArea: '', district: '', rentPriceFrom: '', rentPriceTo: '', typeCode: []
    });
    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    // --- LOGIC XỬ LÝ (Giữ nguyên logic fetch cũ) ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const districtUrl = params.get('district');
        const initialSearch = { ...formData, district: districtUrl || formData.district };
        if (districtUrl) setFormData(prev => ({ ...prev, district: districtUrl }));
        fetchBuildings(initialSearch, 1);
    }, [location.search]);

    const fetchBuildings = async (searchParams, page = 1) => {
        setIsLoading(true);
        try {
            const cleanParams = {};
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] !== '' && searchParams[key].length !== 0) {
                    cleanParams[key] = searchParams[key];
                }
            });
            cleanParams.page = page - 1;
            cleanParams.size = pageSize;

            const res = await axiosClient.get('/api/buildings', { params: cleanParams });

            if (res && res.content) {
                setBuildings(res.content);
                setTotalPages(res.totalPages || 0);
            } else if (res && res.data) {
                setBuildings(res.data);
                setTotalPages(res.totalPages || 0);
            } else if (Array.isArray(res)) {
                setBuildings(res);
                setTotalPages(1);
            } else {
                setBuildings([]);
            }
            setCurrentPage(page);
        } catch (error) {
            console.error("Lỗi search:", error);
            setBuildings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle Quick Filter (Chọn nhanh giá)
    const applyQuickPrice = (min, max) => {
        setFormData({ ...formData, rentPriceFrom: min, rentPriceTo: max });
    };

    // Handle Quick District (Chọn nhanh quận)
    const toggleDistrict = (code) => {
        // Logic: Nếu đang chọn rồi thì bỏ chọn (reset về rỗng), chưa chọn thì set
        setFormData(prev => ({
            ...prev,
            district: prev.district === code ? '' : code
        }));
    };

    const handleCheckboxChange = (code) => {
        let updatedTypes = [...formData.typeCode];
        if (updatedTypes.includes(code)) updatedTypes = updatedTypes.filter(t => t !== code);
        else updatedTypes.push(code);
        setFormData({ ...formData, typeCode: updatedTypes });
    };

    const handleSearch = () => fetchBuildings(formData, 1);
    const handleReset = () => {
        const resetData = { name: '', floorArea: '', district: '', rentPriceFrom: '', rentPriceTo: '', typeCode: [] };
        setFormData(resetData);
        fetchBuildings(resetData, 1);
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchBuildings(formData, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewDetail = (id) => navigate(`/building/${id}`);

    return (
        <div className="search-page-wrapper">
            <div className="main-content-grid">

                {/* --- SIDEBAR BỘ LỌC HIỆN ĐẠI --- */}
                <div className="filter-sidebar">
                    <div className="sidebar-header">
                        <h3><FaFilter /> Bộ Lọc</h3>
                        <button className="btn-reset" onClick={handleReset} title="Đặt lại"><FaUndo /></button>
                    </div>

                    {/* 1. TÌM TÊN */}
                    <div className="filter-section">
                        <label className="section-label">Từ khóa</label>
                        <div className="input-group">
                            <FaSearch className="input-icon" />
                            <input type="text" name="name" placeholder="Tên tòa nhà..." value={formData.name} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 2. KHU VỰC (QUICK CHIPS) */}
                    {/* 2. KHU VỰC (SỔ XUỐNG - DROPDOWN) */}
                    <div className="filter-section">
                        <label className="section-label">Khu vực</label>
                        <div className="input-group">
                            <FaMapMarkerAlt className="input-icon" />
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="modern-select"
                            >
                                <option value="">-- Tất cả Quận --</option>
                                {DISTRICTS.map(d => (
                                    <option key={d.code} value={d.code}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                            {/* Mũi tên tùy chỉnh (nếu muốn CSS kỹ hơn) */}
                            <div className="select-arrow"></div>
                        </div>
                    </div>

                    {/* 3. KHOẢNG GIÁ (INPUTS + QUICK SELECT) */}
                    <div className="filter-section">
                        <label className="section-label">Mức giá ($)</label>
                        <div className="range-group">
                            <input type="number" name="rentPriceFrom" placeholder="Từ" value={formData.rentPriceFrom} onChange={handleChange} />
                            <span className="separator">-</span>
                            <input type="number" name="rentPriceTo" placeholder="Đến" value={formData.rentPriceTo} onChange={handleChange} />
                        </div>
                        <div className="quick-options">
                            {PRICE_RANGES.map((r, idx) => (
                                <span key={idx} className="quick-link" onClick={() => applyQuickPrice(r.min, r.max)}>
                                    {r.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 4. DIỆN TÍCH */}
                    <div className="filter-section">
                        <label className="section-label">Diện tích (m²)</label>
                        <div className="input-group">
                            <FaRulerCombined className="input-icon" />
                            <input type="number" name="floorArea" placeholder="Nhập diện tích tối thiểu..." value={formData.floorArea} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 5. LOẠI VĂN PHÒNG */}
                    <div className="filter-section">
                        <label className="section-label">Loại hình</label>
                        <div className="checkbox-list">
                            {BUILDING_TYPES.map(type => (
                                <label key={type.code} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.typeCode.includes(type.code)}
                                        onChange={() => handleCheckboxChange(type.code)}
                                    />
                                    <span className="checkmark"></span>
                                    {type.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="btn-search-primary" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? 'Đang tìm...' : 'Tìm Kiếm Ngay'}
                    </button>
                </div>

                {/* --- RIGHT PANEL (Giữ nguyên phần kết quả và phân trang đã làm trước đó) --- */}
                <div className="results-area">
                    {/* ... (Phần Header, Grid Building, Pagination GIỮ NGUYÊN như bài trước) ... */}
                    <div className="results-header">
                        <h2>Văn Phòng Cho Thuê</h2>
                        <span className="result-count">Trang <b>{currentPage}</b> / {totalPages}</span>
                    </div>

                    <div className="building-grid">
                        {isLoading ? (
                            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
                        ) : buildings.length > 0 ? (
                            buildings.map((item) => (
                                <div key={item.id} className="building-card" onClick={() => handleViewDetail(item.id)} style={{ cursor: 'pointer' }}>
                                    <div className="card-image">
                                        {/* Ưu tiên lấy item.avatar, phòng hờ backend trả về item.image thì lấy image */}
                                        {item.avatar || item.image ? (
                                            <img
                                                src={
                                                    (item.avatar || item.image).startsWith("http")
                                                        ? (item.avatar || item.image) // Nếu là link online (Cloudinary/Firebase)
                                                        : `data:image/jpeg;base64,${item.avatar || item.image}` // Nếu là chuỗi Base64 từ DB
                                                }
                                                alt={item.name}
                                            />
                                        ) : (
                                            <div className="no-image"><span>No Image</span></div>
                                        )}

                                        <span className="status-badge">Cho thuê</span>
                                        <div className="overlay-btn">
                                            <button onClick={(e) => { e.stopPropagation(); handleViewDetail(item.id); }}>
                                                Xem Chi Tiết <FaArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-info">
                                        <h3 title={item.name}>{item.name}</h3>
                                        <p className="address"><FaMapMarkerAlt /> {item.address}</p>
                                        <div className="card-meta">
                                            <div className="meta-item"><span className="label">Giá thuê</span><span className="value price">${item.rentPrice}<small>/m²</small></span></div>
                                            <div className="divider"></div>
                                            <div className="meta-item"><span className="label">Diện tích</span><span className="value">{item.floorArea} m²</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Không tìm thấy kết quả.</p>
                                <button onClick={handleReset}>Xóa bộ lọc</button>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button className="btn-page" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><FaChevronLeft /></button>
                            <div className="pagination-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} className={`btn-page-number ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>{page}</button>
                                ))}
                            </div>
                            <button className="btn-page" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><FaChevronRight /></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuildingSearch;