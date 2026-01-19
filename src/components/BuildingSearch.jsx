import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaSearch, FaMapMarkerAlt, FaFilter, FaArrowRight, FaChevronLeft,
    FaChevronRight, FaUndo, FaRulerCombined
} from 'react-icons/fa';
import '../styles/BuildingSearch.css';

// --- COMPONENT SKELETON (Hiệu ứng loading) ---
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

// --- CONSTANTS ---
const BUILDING_TYPES = [
    { code: 'NOI_THAT', name: 'Nội thất' },
    { code: 'TANG_TRET', name: 'Tầng trệt' },
    { code: 'NGUYEN_CAN', name: 'Nguyên căn' }
];

// LƯU Ý: ID ở đây phải khớp với ID trong bảng "district" của Database
const DISTRICTS = [
    { id: 1, name: 'Quận 1' },
    { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' },
    { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận Bình Thạnh' },
    { id: 6, name: 'Quận Phú Nhuận' }
];

const PRICE_RANGES = [
    { label: '< $1k', min: '', max: '1000' },
    { label: '$1k - $3k', min: '1000', max: '3000' },
    { label: '> $3k', min: '3000', max: '' },
];

const BuildingSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State lưu trữ bộ lọc
    const [formData, setFormData] = useState({
        name: '',
        floorArea: '',
        district: '',      // Lưu ID quận (dạng chuỗi hoặc số)
        rentPriceFrom: '',
        rentPriceTo: '',
        typeCode: []       // Lưu mảng các code loại hình
    });

    // State dữ liệu và phân trang
    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    // --- EFFECT: LẤY DỮ LIỆU KHI URL HOẶC COMPONENT LOAD ---
    useEffect(() => {
        // Hỗ trợ chia sẻ link tìm kiếm (VD: ?district=1)
        const params = new URLSearchParams(location.search);
        const districtUrl = params.get('district');

        // Merge params từ URL vào state ban đầu
        const initialSearch = {
            ...formData,
            district: districtUrl || formData.district
        };

        if (districtUrl) {
            setFormData(prev => ({ ...prev, district: districtUrl }));
        }

        // Gọi API lần đầu
        fetchBuildings(initialSearch, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    // --- HÀM GỌI API (QUAN TRỌNG NHẤT) ---
    const fetchBuildings = async (searchParams, page = 1) => {
        setIsLoading(true);
        try {
            const cleanParams = {};

            // 1. Xử lý QUẬN: Frontend dùng 'district', Backend cần 'districtId'
            if (searchParams.district) {
                cleanParams.districtId = searchParams.district;
            }

            // 2. Xử lý LOẠI HÌNH: Backend cần List<String>
            if (searchParams.typeCode && searchParams.typeCode.length > 0) {
                cleanParams.typeCode = searchParams.typeCode;
            }

            // 3. Các trường cơ bản
            if (searchParams.name) cleanParams.name = searchParams.name;
            if (searchParams.floorArea) cleanParams.floorArea = searchParams.floorArea;
            if (searchParams.rentPriceFrom) cleanParams.rentPriceFrom = searchParams.rentPriceFrom;
            if (searchParams.rentPriceTo) cleanParams.rentPriceTo = searchParams.rentPriceTo;

            // 4. Phân trang
            cleanParams.page = page - 1; // Backend thường bắt đầu từ 0
            cleanParams.size = pageSize;

            console.log("Params gửi đi API:", cleanParams);

            const res = await axiosClient.get('/api/buildings', {
                params: cleanParams,
                // paramsSerializer giúp gửi mảng đúng chuẩn: typeCode=A&typeCode=B
                paramsSerializer: { indexes: null }
            });

            // Xử lý kết quả trả về (đề phòng cấu trúc khác nhau)
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

    // --- HANDLERS XỬ LÝ SỰ KIỆN ---

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const applyQuickPrice = (min, max) => {
        setFormData({ ...formData, rentPriceFrom: min, rentPriceTo: max });
    };

    const handleCheckboxChange = (code) => {
        let updatedTypes = [...formData.typeCode];
        if (updatedTypes.includes(code)) {
            updatedTypes = updatedTypes.filter(t => t !== code);
        } else {
            updatedTypes.push(code);
        }
        setFormData({ ...formData, typeCode: updatedTypes });
    };

    const handleSearch = () => {
        // Reset về trang 1 khi nhấn Tìm kiếm
        fetchBuildings(formData, 1);
    };

    const handleReset = () => {
        const resetData = {
            name: '', floorArea: '', district: '',
            rentPriceFrom: '', rentPriceTo: '', typeCode: []
        };
        setFormData(resetData);
        fetchBuildings(resetData, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchBuildings(formData, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewDetail = (id) => navigate(`/building/${id}`);

    // --- RENDER GIAO DIỆN ---
    return (
        <div className="search-page-wrapper">
            <div className="main-content-grid">

                {/* --- LEFT SIDEBAR: BỘ LỌC --- */}
                <div className="filter-sidebar">
                    <div className="sidebar-header">
                        <h3><FaFilter /> Bộ Lọc</h3>
                        <button className="btn-reset" onClick={handleReset} title="Đặt lại">
                            <FaUndo />
                        </button>
                    </div>

                    {/* 1. TỪ KHÓA */}
                    <div className="filter-section">
                        <label className="section-label">Từ khóa</label>
                        <div className="input-group">
                            <FaSearch className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Tên tòa nhà..."
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 2. KHU VỰC (DROPDOWN) */}
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
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                            <div className="select-arrow"></div>
                        </div>
                    </div>

                    {/* 3. MỨC GIÁ */}
                    <div className="filter-section">
                        <label className="section-label">Mức giá ($)</label>
                        <div className="range-group">
                            <input
                                type="number"
                                name="rentPriceFrom"
                                placeholder="Từ"
                                value={formData.rentPriceFrom}
                                onChange={handleChange}
                            />
                            <span className="separator">-</span>
                            <input
                                type="number"
                                name="rentPriceTo"
                                placeholder="Đến"
                                value={formData.rentPriceTo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="quick-options">
                            {PRICE_RANGES.map((r, idx) => (
                                <span
                                    key={idx}
                                    className="quick-link"
                                    onClick={() => applyQuickPrice(r.min, r.max)}
                                >
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
                            <input
                                type="number"
                                name="floorArea"
                                placeholder="Tối thiểu..."
                                value={formData.floorArea}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 5. LOẠI HÌNH (CHECKBOX) */}
                    {/* Cấu trúc HTML này khớp với CSS fix lỗi 2 ô tích */}
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
                                    <span className="checkbox-label">{type.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn-search-primary"
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang tìm...' : 'Tìm Kiếm Ngay'}
                    </button>
                </div>

                {/* --- RIGHT PANEL: KẾT QUẢ --- */}
                <div className="results-area">
                    <div className="results-header">
                        <h2>Văn Phòng Cho Thuê</h2>
                        <span className="result-count">
                            Trang <b>{currentPage}</b> / {totalPages || 1}
                        </span>
                    </div>

                    <div className="building-grid">
                        {isLoading ? (
                            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
                        ) : buildings.length > 0 ? (
                            buildings.map((item) => (
                                <div
                                    key={item.id}
                                    className="building-card"
                                    onClick={() => handleViewDetail(item.id)}
                                >
                                    <div className="card-image">
                                        {/* Logic hiển thị ảnh ưu tiên avatar -> image -> no-image */}
                                        {item.avatar || item.image ? (
                                            <img
                                                src={(item.avatar || item.image).startsWith("http")
                                                    ? (item.avatar || item.image)
                                                    : `data:image/jpeg;base64,${item.avatar || item.image}`
                                                }
                                                alt={item.name}
                                            />
                                        ) : (
                                            <div className="no-image"><span>No Image</span></div>
                                        )}

                                        <span className="status-badge">Cho thuê</span>

                                        <div className="overlay-btn">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetail(item.id);
                                            }}>
                                                Xem Chi Tiết <FaArrowRight />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card-info">
                                        <h3 title={item.name}>{item.name}</h3>
                                        <p className="address">
                                            <FaMapMarkerAlt /> {item.address || 'Đang cập nhật'}
                                        </p>
                                        <div className="card-meta">
                                            <div className="meta-item">
                                                <span className="label">Giá thuê</span>
                                                <span className="value price">
                                                    ${item.rentPrice}<small>/m²</small>
                                                </span>
                                            </div>
                                            <div className="divider"></div>
                                            <div className="meta-item">
                                                <span className="label">Diện tích</span>
                                                <span className="value">
                                                    {item.floorArea || 0} m²
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Không tìm thấy kết quả nào phù hợp.</p>
                                <button onClick={handleReset}>Xóa bộ lọc & Thử lại</button>
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                className="btn-page"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <FaChevronLeft />
                            </button>

                            <div className="pagination-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`btn-page-number ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="btn-page"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuildingSearch;