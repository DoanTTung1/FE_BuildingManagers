import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaBuilding, FaDollarSign, FaImage, FaCheck, FaUserTie, FaListUl, FaSpinner } from 'react-icons/fa';
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
    const [isUploading, setIsUploading] = useState(false); // Trạng thái đang upload ảnh
    const [previewImage, setPreviewImage] = useState(null);

    // State form khớp với DTO
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
        image: '' // Bây giờ sẽ lưu URL thay vì Base64
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

    // ==========================================================
    // XỬ LÝ UPLOAD ẢNH QUA API /api/upload/image
    // ==========================================================
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Hiển thị preview tạm thời tại máy khách (UX)
        setPreviewImage(URL.createObjectURL(file));

        // 2. Tạo FormData để gửi file
        const uploadData = new FormData();
        uploadData.append('file', file); // Key 'file' phải khớp với @RequestParam("file") ở Backend

        setIsUploading(true);
        try {
            // Gọi API upload
            const response = await axiosClient.post('/api/upload/image', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Backend trả về URL chuỗi trực tiếp (String)
            const imageUrl = response;

            // Cập nhật URL vào formData
            setFormData(prev => ({ ...prev, image: imageUrl }));
            console.log("Upload ảnh thành công:", imageUrl);

        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            alert("Không thể upload ảnh, vui lòng thử lại!");
            setFormData(prev => ({ ...prev, image: '' })); // Reset nếu lỗi
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate cơ bản
        if (!formData.name || !formData.districtId || !formData.rentPrice) {
            alert("Vui lòng điền các trường bắt buộc (*)");
            return;
        }

        // Chặn submit nếu đang upload ảnh
        if (isUploading) {
            alert("Vui lòng đợi ảnh tải lên hoàn tất!");
            return;
        }

        setIsLoading(true);
        try {
            // Gọi API tạo tòa nhà
            await axiosClient.post('/api/buildings', formData);
            alert("Đăng tin thành công!");
            navigate('/admin/buildings'); // Chuyển về trang quản lý admin
        } catch (error) {
            console.error("Lỗi đăng tin:", error);
            alert("Có lỗi xảy ra khi lưu thông tin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-page-wrapper">
            <div className="create-container">
                <div className="form-header">
                    <h2>📝 Đăng Tin Tòa Nhà Mới</h2>
                    <p>Nhập thông tin chi tiết (Ảnh sẽ được tải lên hệ thống lưu trữ Cloud)</p>
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
                            <div className="form-group">
                                <label>Kết cấu</label>
                                <input type="text" name="structure" value={formData.structure} onChange={handleChange} placeholder="VD: 2 Hầm - 10 Tầng" />
                            </div>
                            <div className="form-group">
                                <label>Số tầng hầm</label>
                                <input type="number" name="numberOfBasement" value={formData.numberOfBasement} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Diện tích sàn (m²)</label>
                                <input type="number" name="floorArea" value={formData.floorArea} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Hướng</label>
                                <input type="text" name="direction" value={formData.direction} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Hạng</label>
                                <input type="text" name="level" value={formData.level} onChange={handleChange} placeholder="VD: A, B, C" />
                            </div>
                        </div>
                    </div>

                    {/* 2. DIỆN TÍCH & GIÁ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaDollarSign /> Giá thuê & Diện tích</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Diện tích thuê (Nhập chuỗi cách nhau bởi dấu phẩy)</label>
                                <input type="text" name="rentArea" value={formData.rentArea} onChange={handleChange} placeholder="VD: 100, 200, 500" />
                            </div>
                            <div className="form-group">
                                <label>Giá thuê ($/m²) *</label>
                                <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Mô tả giá</label>
                                <input type="text" name="rentPriceDescription" value={formData.rentPriceDescription} onChange={handleChange} placeholder="VD: Đã bao gồm phí quản lý" />
                            </div>
                            <div className="form-group">
                                <label>Phí dịch vụ</label>
                                <input type="text" name="serviceFee" value={formData.serviceFee} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phí môi giới</label>
                                <input type="number" step="0.1" name="brokerageFee" value={formData.brokerageFee} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* 3. CÁC LOẠI PHÍ & TIỆN ÍCH KHÁC */}
                    <div className="form-section">
                        <h3 className="section-title"><FaListUl /> Phí & Điều kiện</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Phí ô tô</label><input type="text" name="carFee" value={formData.carFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí xe máy</label><input type="text" name="motorbikeFee" value={formData.motorbikeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí ngoài giờ</label><input type="text" name="overtimeFee" value={formData.overtimeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền điện</label><input type="text" name="electricityFee" value={formData.electricityFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Đặt cọc</label><input type="text" name="deposit" value={formData.deposit} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thanh toán</label><input type="text" name="payment" value={formData.payment} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thời hạn thuê</label><input type="text" name="rentTime" value={formData.rentTime} onChange={handleChange} /></div>
                            <div className="form-group"><label>TG Trang trí</label><input type="text" name="decorationTime" value={formData.decorationTime} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* 4. HÌNH ẢNH & LOẠI */}
                    <div className="form-section">
                        <h3 className="section-title"><FaImage /> Hình ảnh & Loại</h3>

                        <div className="form-group full-width">
                            <label>Chọn ảnh đại diện {isUploading && <span style={{ color: 'orange' }}>(Đang tải lên...)</span>}</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />

                            {/* Hiển thị Loading hoặc Preview */}
                            <div className="image-preview-area" style={{ marginTop: '10px' }}>
                                {isUploading ? (
                                    <div className="loading-upload" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
                                        <FaSpinner className="icon-spin" /> Đang xử lý ảnh...
                                    </div>
                                ) : previewImage ? (
                                    <div className="image-preview">
                                        <img src={previewImage} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="form-group full-width">
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

                    {/* 5. LIÊN HỆ QUẢN LÝ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaUserTie /> Liên hệ quản lý</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên quản lý</label>
                                <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>SĐT quản lý</label>
                                <input type="text" name="managerPhoneNumber" value={formData.managerPhoneNumber} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* GHI CHÚ */}
                    <div className="form-group full-width">
                        <label>Ghi chú thêm</label>
                        <textarea name="note" value={formData.note} onChange={handleChange} rows="4" placeholder="Thông tin khác..."></textarea>
                    </div>

                    {/* BUTTONS */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/admin/buildings')}>Hủy bỏ</button>
                        <button type="submit" className="btn-submit-form" disabled={isLoading || isUploading}>
                            {isLoading ? <span className="spinner"></span> : <><FaCheck /> Đăng Tin Ngay</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateBuilding;