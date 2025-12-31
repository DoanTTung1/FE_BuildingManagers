import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaBuilding, FaDollarSign, FaImage, FaCheck, FaUserTie,
    FaListUl, FaSpinner, FaTimes, FaCloudUploadAlt
} from 'react-icons/fa';
import '../styles/CreateBuilding.css';

// Danh sách Quận & Loại tòa nhà (Giữ nguyên)
const DISTRICTS = [
    { id: 1, name: 'Quận 1' }, { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' }, { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận Bình Thạnh' }, { id: 6, name: 'Quận Phú Nhuận' }
];
const BUILDING_TYPES = [
    { code: 'NOI_THAT', name: 'Nội thất' },
    { code: 'TANG_TRET', name: 'Tầng trệt' },
    { code: 'NGUYEN_CAN', name: 'Nguyên căn' }
];

const CreateBuilding = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(''); // Hiện thông báo chi tiết

    // --- 1. STATE QUẢN LÝ FILE RAW (CHƯA UPLOAD) ---
    // File object thực tế để gửi lên server khi submit
    const [rawAvatarFile, setRawAvatarFile] = useState(null);
    const [rawAlbumFiles, setRawAlbumFiles] = useState([]);

    // URL ảo (blob:http...) để hiển thị preview
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState('');
    const [previewAlbumUrls, setPreviewAlbumUrls] = useState([]);

    // --- 2. STATE FORM DATA (CHỈ CHỨA TEXT) ---
    const [formData, setFormData] = useState({
        name: '', street: '', ward: '', districtId: '',
        structure: '', numberOfBasement: 0, floorArea: 0,
        direction: '', level: '', rentPrice: 0,
        rentPriceDescription: '', serviceFee: '', carFee: '',
        motorbikeFee: '', overtimeFee: '', waterFee: '',
        electricityFee: '', deposit: '', payment: '',
        rentTime: '', decorationTime: '', brokerageFee: 0.0,
        note: '', linkOfBuilding: '', map: '',
        managerName: '', managerPhoneNumber: '',
        rentArea: '', typeCode: []
        // avatar và imageList sẽ được gộp vào lúc submit
    });

    // Cleanup URL ảo để tránh rò rỉ bộ nhớ khi component unmount
    useEffect(() => {
        return () => {
            if (previewAvatarUrl) URL.revokeObjectURL(previewAvatarUrl);
            previewAlbumUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTypeChange = (code) => {
        let updatedTypes = [...formData.typeCode];
        if (updatedTypes.includes(code)) {
            updatedTypes = updatedTypes.filter(t => t !== code);
        } else {
            updatedTypes.push(code);
        }
        setFormData({ ...formData, typeCode: updatedTypes });
    };

    // ==========================================================
    // 3. XỬ LÝ CHỌN ẢNH (CHỈ PREVIEW - KHÔNG UPLOAD)
    // ==========================================================

    // --- AVATAR ---
    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Lưu file gốc
        setRawAvatarFile(file);

        // 2. Tạo preview url
        const objectUrl = URL.createObjectURL(file);
        setPreviewAvatarUrl(objectUrl);
    };

    const handleRemoveAvatar = () => {
        setRawAvatarFile(null);
        setPreviewAvatarUrl('');
    };

    // --- ALBUM ---
    const handleAlbumSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // 1. Lưu file gốc (Nối thêm vào danh sách cũ)
        setRawAlbumFiles(prev => [...prev, ...files]);

        // 2. Tạo preview url (Nối thêm)
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewAlbumUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const handleRemoveAlbumImage = (indexToRemove) => {
        // Xóa file gốc tại index
        setRawAlbumFiles(prev => prev.filter((_, i) => i !== indexToRemove));

        // Xóa preview url tại index
        setPreviewAlbumUrls(prev => {
            URL.revokeObjectURL(prev[indexToRemove]); // Giải phóng bộ nhớ
            return prev.filter((_, i) => i !== indexToRemove);
        });
    };

    // ==========================================================
    // 4. HÀM UPLOAD THỰC SỰ (CHỈ GỌI KHI SUBMIT)
    // ==========================================================
    const uploadSingleFile = async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const token = localStorage.getItem("token");

        const res = await axiosClient.post('/api/upload/image', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
        return res; // Trả về URL String
    };

    // ==========================================================
    // 5. SUBMIT FORM (UPLOAD RỒI MỚI SAVE DB)
    // ==========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.name || !formData.districtId || !formData.rentPrice) {
            alert("Vui lòng điền các trường bắt buộc (*)");
            return;
        }

        setIsLoading(true);
        try {
            // --- BƯỚC 1: UPLOAD AVATAR (NẾU CÓ) ---
            let finalAvatarUrl = "";
            if (rawAvatarFile) {
                setLoadingMessage("Đang tải lên ảnh đại diện...");
                finalAvatarUrl = await uploadSingleFile(rawAvatarFile);
            }

            // --- BƯỚC 2: UPLOAD ALBUM (NẾU CÓ) ---
            let finalImageList = [];
            if (rawAlbumFiles.length > 0) {
                setLoadingMessage(`Đang tải lên ${rawAlbumFiles.length} ảnh chi tiết...`);
                // Upload song song (Promise.all) cho nhanh
                const uploadPromises = rawAlbumFiles.map(file => uploadSingleFile(file));
                finalImageList = await Promise.all(uploadPromises);
            }

            // --- BƯỚC 3: GỘP DỮ LIỆU VÀ GỌI API TẠO TÒA NHÀ ---
            setLoadingMessage("Đang lưu thông tin...");

            const finalPayload = {
                ...formData,
                avatar: finalAvatarUrl,     // Gán URL thật vừa nhận được
                imageList: finalImageList   // Gán List URL thật
            };

            await axiosClient.post('/api/buildings', finalPayload);

            alert("Đăng tin thành công!");
            navigate('/admin/buildings');

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="create-page-wrapper">
            <div className="create-container">
                <div className="form-header">
                    <h2>📝 Đăng Tin Tòa Nhà Mới</h2>
                    <p>Nhập thông tin chi tiết & hình ảnh</p>
                </div>

                <form className="create-form" onSubmit={handleSubmit}>

                    {/* 1. THÔNG TIN CHUNG */}
                    <div className="form-section">
                        <h3 className="section-title"><FaBuilding /> Thông tin chung</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tên tòa nhà *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="VD: Bitexco Financial Tower" />
                            </div>
                            <div className="form-group"><label>Đường</label><input type="text" name="street" value={formData.street} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phường</label><input type="text" name="ward" value={formData.ward} onChange={handleChange} /></div>
                            <div className="form-group">
                                <label>Quận *</label>
                                <select name="districtId" value={formData.districtId} onChange={handleChange} required>
                                    <option value="">-- Chọn Quận --</option>
                                    {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Kết cấu</label><input type="text" name="structure" value={formData.structure} onChange={handleChange} /></div>
                            <div className="form-group"><label>Số tầng hầm</label><input type="number" name="numberOfBasement" value={formData.numberOfBasement} onChange={handleChange} /></div>
                            <div className="form-group"><label>Diện tích sàn (m²)</label><input type="number" name="floorArea" value={formData.floorArea} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hướng</label><input type="text" name="direction" value={formData.direction} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hạng</label><input type="text" name="level" value={formData.level} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 2. GIÁ & PHÍ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaDollarSign /> Giá thuê & Diện tích</h3>
                        <div className="form-grid">
                            <div className="form-group full-width"><label>Diện tích thuê (VD: 100, 200)</label><input type="text" name="rentArea" value={formData.rentArea} onChange={handleChange} /></div>
                            <div className="form-group"><label>Giá thuê ($/m²) *</label><input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Mô tả giá</label><input type="text" name="rentPriceDescription" value={formData.rentPriceDescription} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí dịch vụ</label><input type="text" name="serviceFee" value={formData.serviceFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí môi giới</label><input type="number" name="brokerageFee" value={formData.brokerageFee} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 3. PHÍ KHÁC */}
                    <div className="form-section">
                        <h3 className="section-title"><FaListUl /> Phí & Điều kiện</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Phí ô tô</label><input type="text" name="carFee" value={formData.carFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí xe máy</label><input type="text" name="motorbikeFee" value={formData.motorbikeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí ngoài giờ</label><input type="text" name="overtimeFee" value={formData.overtimeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền điện</label><input type="text" name="electricityFee" value={formData.electricityFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền nước</label><input type="text" name="waterFee" value={formData.waterFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Đặt cọc</label><input type="text" name="deposit" value={formData.deposit} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thanh toán</label><input type="text" name="payment" value={formData.payment} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thời hạn thuê</label><input type="text" name="rentTime" value={formData.rentTime} onChange={handleChange} /></div>
                            <div className="form-group"><label>TG Trang trí</label><input type="text" name="decorationTime" value={formData.decorationTime} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 4. HÌNH ẢNH (LOGIC MỚI: UPLOAD ON SUBMIT) */}
                    <div className="form-section">
                        <h3 className="section-title"><FaImage /> Hình ảnh & Loại</h3>

                        {/* A. AVATAR */}
                        <div className="form-group full-width">
                            <label>Ảnh đại diện (Avatar) *</label>

                            {/* Nếu chưa chọn ảnh -> Hiện nút Chọn */}
                            {!previewAvatarUrl && (
                                <div className="upload-box">
                                    <label className="custom-file-upload">
                                        <FaCloudUploadAlt size={24} /> Chọn ảnh đại diện
                                        <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            )}

                            {/* Nếu đã chọn -> Hiện Preview */}
                            {previewAvatarUrl && (
                                <div className="image-preview-item" style={{ maxWidth: '200px' }}>
                                    <img src={previewAvatarUrl} alt="Avatar Preview" />
                                    <button type="button" className="btn-remove-img" onClick={handleRemoveAvatar}>
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* B. ALBUM ẢNH */}
                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Album ảnh chi tiết (Chọn nhiều ảnh)</label>

                            <div className="upload-box">
                                <label className="custom-file-upload">
                                    <FaCloudUploadAlt size={24} /> Thêm ảnh vào album
                                    <input type="file" multiple accept="image/*" onChange={handleAlbumSelect} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {/* Grid hiển thị Album Preview */}
                            {previewAlbumUrls.length > 0 && (
                                <div className="album-grid">
                                    {previewAlbumUrls.map((url, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img src={url} alt={`Album Preview ${index}`} />
                                            <button type="button" className="btn-remove-img" onClick={() => handleRemoveAlbumImage(index)}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* C. LOẠI TÒA NHÀ */}
                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Loại tòa nhà:</label>
                            <div className="checkbox-group">
                                {BUILDING_TYPES.map(type => (
                                    <label key={type.code} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.typeCode.includes(type.code)}
                                            onChange={() => handleTypeChange(type.code)}
                                        />
                                        {type.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. QUẢN LÝ & GHI CHÚ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaUserTie /> Liên hệ & Khác</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Tên quản lý</label><input type="text" name="managerName" value={formData.managerName} onChange={handleChange} /></div>
                            <div className="form-group"><label>SĐT quản lý</label><input type="text" name="managerPhoneNumber" value={formData.managerPhoneNumber} onChange={handleChange} /></div>
                            <div className="form-group full-width">
                                <label>Ghi chú</label>
                                <textarea name="note" value={formData.note} onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/admin/buildings')}>Hủy bỏ</button>
                        <button type="submit" className="btn-submit-form" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span style={{ marginLeft: '10px' }}>{loadingMessage || 'Đang xử lý...'}</span>
                                </>
                            ) : (
                                <><FaCheck /> Đăng Tin</>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateBuilding;