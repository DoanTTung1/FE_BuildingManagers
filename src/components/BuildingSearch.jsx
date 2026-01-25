import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaSearch, FaMapMarkerAlt, FaFilter, FaArrowRight, FaChevronLeft,
    FaChevronRight, FaUndo, FaRulerCombined, FaMoneyBillWave, FaBuilding, FaSortAmountDown
} from 'react-icons/fa';
import '../styles/BuildingSearch.css';

// --- COMPONENT SKELETON ---
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

const DISTRICTS = [
    { id: 1, name: 'Quận 1' }, { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' }, { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận Bình Thạnh' }, { id: 6, name: 'Quận Phú Nhuận' }
];

// Helper format tiền tệ VNĐ
const formatCurrency = (value) => {
    if (!value) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

const BuildingSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State bộ lọc
    const [formData, setFormData] = useState({
        name: '',
        floorArea: '',
        district: '',
        rentPriceFrom: '',
        rentPriceTo: '',
        typeCode: [],
        transactionType: '',
        sortBy: '' // 🔥 [MỚI] Thêm state sắp xếp
    });

    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    // --- EFFECT: LOAD URL PARAMS ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const districtUrl = params.get('district');
        const nameUrl = params.get('name');
        const typeUrl = params.get('transactionType');
        const sortUrl = params.get('sortBy'); // 🔥 Lấy sort từ URL

        const initialSearch = {
            ...formData,
            district: districtUrl || formData.district,
            name: nameUrl || formData.name,
            transactionType: typeUrl || formData.transactionType,
            sortBy: sortUrl || formData.sortBy
        };

        if (districtUrl || nameUrl || typeUrl || sortUrl) {
            setFormData(prev => ({
                ...prev,
                district: districtUrl || prev.district,
                name: nameUrl || prev.name,
                transactionType: typeUrl || prev.transactionType,
                sortBy: sortUrl || prev.sortBy
            }));
        }

        fetchBuildings(initialSearch, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    // --- GỌI API ---
    const fetchBuildings = async (searchParams, page = 1) => {
        setIsLoading(true);
        try {
            const cleanParams = {};

            if (searchParams.district && searchParams.district !== '') {
                cleanParams.districtId = Number(searchParams.district);
            }
            if (searchParams.floorArea) cleanParams.floorArea = Number(searchParams.floorArea);
            if (searchParams.rentPriceFrom) cleanParams.rentPriceFrom = Number(searchParams.rentPriceFrom);
            if (searchParams.rentPriceTo) cleanParams.rentPriceTo = Number(searchParams.rentPriceTo);
            if (searchParams.name) cleanParams.name = searchParams.name;
            if (searchParams.transactionType) cleanParams.transactionType = searchParams.transactionType;

            // 🔥 [MỚI] Gửi tham số sắp xếp
            if (searchParams.sortBy) cleanParams.sortBy = searchParams.sortBy;

            if (searchParams.typeCode && searchParams.typeCode.length > 0) {
                cleanParams.typeCode = searchParams.typeCode;
            }

            cleanParams.page = page - 1;
            cleanParams.size = pageSize;

            console.log("Searching with:", cleanParams);

            const res = await axiosClient.get('/api/buildings', {
                params: cleanParams,
                paramsSerializer: { indexes: null }
            });

            if (res && res.content) {
                setBuildings(res.content);
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

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔥 [MỚI] Xử lý khi chọn Sắp xếp -> Gọi API ngay lập tức
    const handleSortChange = (e) => {
        const newSort = e.target.value;
        const newData = { ...formData, sortBy: newSort };
        setFormData(newData);
        fetchBuildings(newData, 1); // Gọi API luôn khi chọn
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
        fetchBuildings(formData, 1);
    };

    const handleReset = () => {
        const resetData = {
            name: '', floorArea: '', district: '',
            rentPriceFrom: '', rentPriceTo: '', typeCode: [],
            transactionType: '', sortBy: ''
        };
        setFormData(resetData);
        navigate('/search', { replace: true });
        fetchBuildings(resetData, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchBuildings(formData, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleViewDetail = (id) => navigate(`/building/${id}`);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/400x300?text=No+Image";
        if (imagePath.startsWith("http")) return imagePath;
        return imagePath;
    };

    const formatAddress = (item) => {
        if (item.address) return item.address;
        return [item.street, item.ward, item.district].filter(Boolean).join(', ');
    };

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

                    <div className="filter-section">
                        <label className="section-label">Từ khóa</label>
                        <div className="input-group">
                            <FaSearch className="input-icon" />
                            <input type="text" name="name" placeholder="Tên tòa nhà..." value={formData.name} onChange={handleChange} />
                        </div>
                    </div>

                    {/* BỘ LỌC LOẠI GIAO DỊCH */}
                    <div className="filter-section">
                        <label className="section-label">Nhu cầu</label>
                        <select name="transactionType" value={formData.transactionType} onChange={handleChange} className="modern-select">
                            <option value="">-- Tất cả --</option>
                            <option value="RENT">Thuê Tòa Nhà</option>
                            <option value="SALE">Mua Tòa Nhà</option>
                        </select>
                        <div className="select-arrow"></div>
                    </div>

                    <div className="filter-section">
                        <label className="section-label">Khu vực</label>
                        <div className="input-group">
                            <FaMapMarkerAlt className="input-icon" />
                            <select name="district" value={formData.district} onChange={handleChange} className="modern-select">
                                <option value="">-- Tất cả Quận --</option>
                                {DISTRICTS.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            <div className="select-arrow"></div>
                        </div>
                    </div>

                    {/* BỘ LỌC GIÁ (VNĐ) */}
                    <div className="filter-section">
                        <label className="section-label">Mức giá (VNĐ)</label>
                        <div className="range-group">
                            <input type="number" name="rentPriceFrom" placeholder="Từ..." value={formData.rentPriceFrom} onChange={handleChange} />
                            <span className="separator">-</span>
                            <input type="number" name="rentPriceTo" placeholder="Đến..." value={formData.rentPriceTo} onChange={handleChange} />
                        </div>
                        <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                            Nhập số tiền đầy đủ (VD: 10000000)
                        </small>
                    </div>

                    <div className="filter-section">
                        <label className="section-label">Diện tích (m²)</label>
                        <div className="input-group">
                            <FaRulerCombined className="input-icon" />
                            <input type="number" name="floorArea" placeholder="Tối thiểu..." value={formData.floorArea} onChange={handleChange} />
                        </div>
                    </div>

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

                    <button className="btn-search-primary" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? 'Đang tìm...' : 'Tìm Kiếm Ngay'}
                    </button>
                </div>

                {/* --- RIGHT PANEL: KẾT QUẢ --- */}
                <div className="results-area">
                    <div className="results-header">
                        <div className="header-left">
                            <h2>
                                {formData.transactionType === 'SALE' ? 'Tòa Nhà Đang Bán' :
                                    formData.transactionType === 'RENT' ? 'Văn Phòng Cho Thuê' :
                                        'Tất Cả Tòa Nhà'}
                            </h2>
                            <span className="result-count">Trang <b>{currentPage}</b> / {totalPages || 1}</span>
                        </div>

                        {/* 🔥 [MỚI] DROPDOWN SẮP XẾP */}
                        <div className="header-right">
                            <div className="sort-box">
                                <FaSortAmountDown className="sort-icon" />
                                <select
                                    name="sortBy"
                                    value={formData.sortBy}
                                    onChange={handleSortChange}
                                    className="sort-select"
                                >
                                    <option value="">Sắp xếp: Mặc định</option>
                                    <option value="price_asc">Giá: Thấp đến Cao</option>
                                    <option value="price_desc">Giá: Cao đến Thấp</option>
                                    <option value="newest">Mới nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="building-grid">
                        {isLoading ? (
                            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
                        ) : buildings.length > 0 ? (
                            buildings.map((item) => {
                                const isSale = item.transactionType === 'SALE';
                                return (
                                    <div key={item.id} className="building-card" onClick={() => handleViewDetail(item.id)}>
                                        <div className="card-image">
                                            <img
                                                src={getImageUrl(item.avatar || item.image)}
                                                alt={item.name}
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                                            />
                                            <span className={`status-badge ${isSale ? 'sale' : 'rent'}`}
                                                style={{ backgroundColor: isSale ? '#f97316' : '#10b981' }}>
                                                {isSale ? 'Đang Bán' : 'Cho Thuê'}
                                            </span>

                                            <div className="overlay-btn">
                                                <button>Xem Chi Tiết <FaArrowRight /></button>
                                            </div>
                                        </div>

                                        <div className="card-info">
                                            <h3 title={item.name}>{item.name}</h3>

                                            <p className="address">
                                                <FaMapMarkerAlt /> {formatAddress(item)}
                                            </p>

                                            <div className="card-meta">
                                                <div className="meta-item">
                                                    <span className="label">
                                                        <FaMoneyBillWave /> {isSale ? 'Giá bán' : 'Giá thuê'}
                                                    </span>
                                                    <span className="value price" style={{ color: isSale ? '#ea580c' : '#0f2557' }}>
                                                        {formatCurrency(item.rentPrice)}
                                                    </span>
                                                </div>
                                                <div className="divider"></div>
                                                <div className="meta-item">
                                                    <span className="label">
                                                        <FaRulerCombined /> Diện tích
                                                    </span>
                                                    <span className="value">{item.floorArea || 0} m²</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-results">
                                <FaBuilding size={50} color="#ccc" style={{ marginBottom: '15px' }} />
                                <p>Không tìm thấy kết quả nào phù hợp.</p>
                                <button onClick={handleReset}>Xóa bộ lọc & Thử lại</button>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button className="btn-page" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
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
                            <button className="btn-page" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
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