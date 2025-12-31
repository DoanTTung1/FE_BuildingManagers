import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    FaBuilding, FaDollarSign, FaImage, FaCheck, FaUserTie,
    FaListUl, FaSpinner, FaTimes, FaCloudUploadAlt
} from 'react-icons/fa';
import '../styles/CreateBuilding.css';

// Danh sách Quận
const DISTRICTS = [
    { id: 1, name: 'Quận 1' },
    { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' },
    { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận Bình Thạnh' },
    { id: 6, name: 'Quận Phú Nhuận' }
];

// Loại tòa nhà
const BUILDING_TYPES = [
    { code: 'NOI_THAT', name: 'Nội thất' },
    { code: 'TANG_TRET', name: 'Tầng trệt' },
    { code: 'NGUYEN_CAN', name: 'Nguyên căn' }
];

const CreateBuilding = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Trạng thái upload riêng biệt
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);

    // State form khớp với DTO Backend
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
        rentArea: '', typeCode: [],
        avatar: '',         // Ảnh đại diện (String)
        imageList: []       // Album ảnh (List<String>)
    });

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

    // --- HÀM HỖ TRỢ UPLOAD FILE LÊN SERVER ---
    const uploadFile = async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const token = localStorage.getItem("token");

        const res = await axiosClient.post('/api/upload/image', uploadData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return res; // Trả về URL string
    };

    // ==========================================================
    // 1. XỬ LÝ AVATAR (ẢNH ĐẠI DIỆN)
    // ==========================================================
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const url = await uploadFile(file);
            setFormData(prev => ({ ...prev, avatar: url }));
        } catch (error) {
            alert("Lỗi upload Avatar: " + (error.response?.status === 403 ? "Không có quyền!" : "Thử lại sau"));
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setFormData(prev => ({ ...prev, avatar: '' }));
        // (Optional) Gọi API deleteFile(url) nếu muốn xóa luôn trên Cloud
    };

    // ==========================================================
    // 2. XỬ LÝ ALBUM ẢNH (DANH SÁCH NHIỀU ẢNH)
    // ==========================================================
    const handleAlbumChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploadingAlbum(true);
        try {
            // Upload song song tất cả ảnh
            const uploadPromises = files.map(file => uploadFile(file));
            const urls = await Promise.all(uploadPromises);

            // Gộp URL mới vào danh sách cũ
            setFormData(prev => ({
                ...prev,
                imageList: [...prev.imageList, ...urls]
            }));
        } catch (error) {
            alert("Có lỗi khi upload một số ảnh trong album.");
        } finally {
            setIsUploadingAlbum(false);
        }
    };

    const handleRemoveAlbumImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            imageList: prev.imageList.filter((_, index) => index !== indexToRemove)
        }));
    };

    // ==========================================================
    // 3. SUBMIT FORM
    // ==========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.districtId || !formData.rentPrice) {
            alert("Vui lòng điền các trường bắt buộc (*)");
            return;
        }

        if (isUploadingAvatar || isUploadingAlbum) {
            alert("Đang tải ảnh lên, vui lòng đợi...");
            return;
        }

        setIsLoading(true);
        try {
            await axiosClient.post('/api/buildings', formData);
            alert("Đăng tin thành công!");
            navigate('/admin/buildings');
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi khi lưu: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
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

                    {/* 1. THÔNG TIN CHUNG (Giữ nguyên) */}
                    <div className="form-section">
                        <h3 className="section-title"><FaBuilding /> Thông tin chung</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tên tòa nhà *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="VD: Bitexco Financial Tower" />
                            </div>
                            <div className="form-group">
                                <label>Đường</label>
                                <input type="text" name="street" value={formData.street} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phường</label>
                                <input type="text" name="ward" value={formData.ward} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Quận *</label>
                                <select name="districtId" value={formData.districtId} onChange={handleChange} required>
                                    <option value="">-- Chọn Quận --</option>
                                    {DISTRICTS.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group"><label>Kết cấu</label><input type="text" name="structure" value={formData.structure} onChange={handleChange} /></div>
                            <div className="form-group"><label>Số tầng hầm</label><input type="number" name="numberOfBasement" value={formData.numberOfBasement} onChange={handleChange} /></div>
                            <div className="form-group"><label>Diện tích sàn (m²)</label><input type="number" name="floorArea" value={formData.floorArea} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hướng</label><input type="text" name="direction" value={formData.direction} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hạng</label><input type="text" name="level" value={formData.level} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 2. GIÁ & PHÍ (Giữ nguyên) */}
                    <div className="form-section">
                        <h3 className="section-title"><FaDollarSign /> Giá thuê & Diện tích</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Diện tích thuê (VD: 100, 200)</label>
                                <input type="text" name="rentArea" value={formData.rentArea} onChange={handleChange} />
                            </div>
                            <div className="form-group"><label>Giá thuê ($/m²) *</label><input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Mô tả giá</label><input type="text" name="rentPriceDescription" value={formData.rentPriceDescription} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí dịch vụ</label><input type="text" name="serviceFee" value={formData.serviceFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí môi giới</label><input type="number" name="brokerageFee" value={formData.brokerageFee} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 3. PHÍ KHÁC (Giữ nguyên) */}
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

                    {/* 4. HÌNH ẢNH (AVATAR & ALBUM) - ĐÃ CẬP NHẬT */}
                    <div className="form-section">
                        <h3 className="section-title"><FaImage /> Hình ảnh & Loại</h3>

                        {/* A. AVATAR */}
                        <div className="form-group full-width">
                            <label>Ảnh đại diện (Avatar) *</label>

                            {/* Nếu chưa có ảnh -> Hiện nút Upload */}
                            {!formData.avatar && !isUploadingAvatar && (
                                <div className="upload-box">
                                    <label className="custom-file-upload">
                                        <FaCloudUploadAlt size={24} /> Chọn ảnh đại diện
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            )}

                            {/* Nếu đang upload -> Hiện Loading */}
                            {isUploadingAvatar && (
                                <div className="loading-upload"><FaSpinner className="icon-spin" /> Đang tải ảnh lên...</div>
                            )}

                            {/* Nếu đã có ảnh -> Hiện Ảnh + Nút Xóa */}
                            {formData.avatar && (
                                <div className="image-preview-item" style={{ maxWidth: '200px' }}>
                                    <img src={formData.avatar} alt="Avatar" />
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
                                    <input type="file" multiple accept="image/*" onChange={handleAlbumChange} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {isUploadingAlbum && (
                                <div className="loading-upload"><FaSpinner className="icon-spin" /> Đang tải {isUploadingAlbum} ảnh...</div>
                            )}

                            {/* Grid hiển thị Album */}
                            <div className="album-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {formData.imageList.map((url, index) => (
                                    <div key={index} className="image-preview-item" style={{ width: '100px', height: '100px' }}>
                                        <img src={url} alt={`Album ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" className="btn-remove-img" onClick={() => handleRemoveAlbumImage(index)}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                        <button type="submit" className="btn-submit-form" disabled={isLoading || isUploadingAvatar || isUploadingAlbum}>
                            {isLoading ? <span className="spinner"></span> : <><FaCheck /> Đăng Tin</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateBuilding;