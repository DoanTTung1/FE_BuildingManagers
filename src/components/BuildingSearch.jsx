import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBuilding, FaDollarSign, FaRulerCombined, FaFilter, FaArrowRight } from 'react-icons/fa';
import '../styles/BuildingSearch.css';

// --- Skeleton Loading (Giữ nguyên) ---
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

// Loại tòa nhà
const BUILDING_TYPES = [
    { code: 'NOI_THAT', name: 'Nội thất' },
    { code: 'TANG_TRET', name: 'Tầng trệt' },
    { code: 'NGUYEN_CAN', name: 'Nguyên căn' }
];

const BuildingSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        name: '',
        floorArea: '',
        district: '',
        rentPriceFrom: '',
        rentPriceTo: '',
        typeCode: []
    });

    const [buildings, setBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const districtUrl = params.get('district');
        const initialSearch = {
            ...formData,
            district: districtUrl || formData.district
        };
        if (districtUrl) setFormData(prev => ({ ...prev, district: districtUrl }));
        fetchBuildings(initialSearch);
    }, [location.search]);

    const fetchBuildings = async (searchParams) => {
        setIsLoading(true);
        try {
            const cleanParams = {};
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] !== '' && searchParams[key].length !== 0) {
                    cleanParams[key] = searchParams[key];
                }
            });
            const res = await axiosClient.get('/api/buildings', { params: cleanParams });
            setBuildings(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Lỗi search:", error);
            setBuildings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        fetchBuildings(formData);
    };

    return (
        <div className="search-page-wrapper">
            <div className="main-content-grid">
                
                {/* --- LEFT PANEL: BỘ LỌC NÂNG CAO --- */}
                <div className="filter-sidebar glass-panel">
                    <div className="sidebar-header">
                        <h3><FaFilter /> Bộ Lọc Tìm Kiếm</h3>
                    </div>
                    
                    <div className="filter-group">
                        <label className="f-label"><FaBuilding /> Tên tòa nhà</label>
                        <div className="input-modern">
                            <input type="text" name="name" placeholder="Nhập tên..." value={formData.name} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="f-label"><FaMapMarkerAlt /> Khu vực</label>
                        <div className="select-modern">
                            <select name="district" value={formData.district} onChange={handleChange}>
                                <option value="">Tất cả Quận</option>
                                <option value="QUAN_1">Quận 1</option>
                                <option value="QUAN_2">Quận 2</option>
                                <option value="QUAN_3">Quận 3</option>
                                <option value="QUAN_4">Quận 4</option>
                                <option value="QUAN_BINH_THANH">Bình Thạnh</option>
                                <option value="QUAN_PHU_NHUAN">Phú Nhuận</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="f-label"><FaRulerCombined /> Diện tích sàn (m²)</label>
                        <div className="input-modern">
                            <input type="number" name="floorArea" placeholder="Từ..." value={formData.floorArea} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="f-label"><FaDollarSign /> Khoảng giá ($)</label>
                        <div className="price-range-inputs">
                            <input type="number" name="rentPriceFrom" placeholder="Từ" value={formData.rentPriceFrom} onChange={handleChange} />
                            <span>-</span>
                            <input type="number" name="rentPriceTo" placeholder="Đến" value={formData.rentPriceTo} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="f-label">Loại văn phòng</label>
                        <div className="tags-container">
                            {BUILDING_TYPES.map(type => (
                                <div 
                                    key={type.code} 
                                    className={`tag-item ${formData.typeCode.includes(type.code) ? 'active' : ''}`}
                                    onClick={() => handleCheckboxChange(type.code)}
                                >
                                    {type.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="btn-search-full" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Áp Dụng Bộ Lọc'}
                    </button>
                </div>

                {/* --- RIGHT PANEL: KẾT QUẢ --- */}
                <div className="results-area">
                    <div className="results-header">
                        <h2>Văn Phòng Cho Thuê</h2>
                        <span className="result-count">Tìm thấy <b>{buildings.length}</b> kết quả phù hợp</span>
                    </div>

                    <div className="building-grid">
                        {isLoading ? (
                            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
                        ) : buildings.length > 0 ? (
                            buildings.map((item) => (
                                <div key={item.id} className="building-card">
                                    <div className="card-image">
                                        {item.image ? (
                                            <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} />
                                        ) : (
                                            <div className="no-image"><span>No Image</span></div>
                                        )}
                                        <span className="status-badge">Cho thuê</span>
                                        <div className="overlay-btn">
                                            <button onClick={() => console.log("Detail", item.id)}>Xem Chi Tiết <FaArrowRight /></button>
                                        </div>
                                    </div>

                                    <div className="card-info">
                                        <h3 title={item.name}>{item.name}</h3>
                                        <p className="address"><FaMapMarkerAlt /> {item.address}</p>
                                        
                                        <div className="card-meta">
                                            <div className="meta-item">
                                                <span className="label">Giá thuê</span>
                                                <span className="value price">${item.rentPrice}<small>/m²</small></span>
                                            </div>
                                            <div className="divider"></div>
                                            <div className="meta-item">
                                                <span className="label">Diện tích</span>
                                                <span className="value">{item.floorArea} m²</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Not found" width="100"/>
                                <p>Không tìm thấy văn phòng nào phù hợp với tiêu chí của bạn.</p>
                                <button onClick={() => setFormData({name:'', floorArea:'', district:'', rentPriceFrom:'', rentPriceTo:'', typeCode:[]})}>
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildingSearch;