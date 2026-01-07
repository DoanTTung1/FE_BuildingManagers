import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
    FaBuilding, FaDollarSign, FaImage, FaCheck, FaUserTie,
    FaListUl, FaSpinner, FaTimes, FaCloudUploadAlt, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';
import '../styles/CreateBuilding.css';

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
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [rawAvatarFile, setRawAvatarFile] = useState(null);
    const [rawAlbumFiles, setRawAlbumFiles] = useState([]);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState('');
    const [previewAlbumUrls, setPreviewAlbumUrls] = useState([]);

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
    });

    useEffect(() => {
        return () => {
            if (previewAvatarUrl) URL.revokeObjectURL(previewAvatarUrl);
            previewAlbumUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewAvatarUrl, previewAlbumUrls]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTypeChange = (code) => {
        let updatedTypes = [...formData.typeCode];
        if (updatedTypes.includes(code)) updatedTypes = updatedTypes.filter(t => t !== code);
        else updatedTypes.push(code);
        setFormData({ ...formData, typeCode: updatedTypes });
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRawAvatarFile(file);
        setPreviewAvatarUrl(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        setRawAvatarFile(null);
        setPreviewAvatarUrl('');
    };

    const handleAlbumSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setRawAlbumFiles(prev => [...prev, ...files]);
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewAlbumUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const handleRemoveAlbumImage = (index) => {
        setRawAlbumFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewAlbumUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const uploadSingleFile = async (file) => {
        if (!file) return "";
        const uploadData = new FormData();
        uploadData.append('file', file);
        // Lưu ý: Endpoint upload phải trả về String (URL ảnh)
        const res = await axiosClient.post('/api/upload/image', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Giả sử API trả về res.data là đường dẫn ảnh
        return res;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation Frontend cơ bản
        if (!formData.name || !formData.districtId || !formData.rentPrice) {
            alert("Vui lòng điền: Tên, Quận, Giá thuê!");
            return;
        }
        if (formData.typeCode.length === 0) {
            alert("Vui lòng chọn ít nhất 1 loại tòa nhà!");
            return;
        }

        setIsLoading(true);

        try {
            // --- BƯỚC 1: UPLOAD ẢNH ---
            let finalAvatarUrl = "";
            if (rawAvatarFile) {
                setLoadingMessage("Đang tải lên avatar...");
                finalAvatarUrl = await uploadSingleFile(rawAvatarFile);
            }

            let finalImageList = [];
            if (rawAlbumFiles.length > 0) {
                setLoadingMessage(`Đang tải lên ${rawAlbumFiles.length} ảnh...`);
                const uploadPromises = rawAlbumFiles.map(file => uploadSingleFile(file));
                finalImageList = await Promise.all(uploadPromises);
            }

            setLoadingMessage("Đang lưu thông tin...");

            // --- BƯỚC 2: MAP DỮ LIỆU SANG JAVA DTO (FIX LỖI 400) ---
            const finalPayload = {
                // Các trường String (Giữ nguyên)
                id: null, // Thêm mới thì ID là null
                name: formData.name,
                street: formData.street,
                ward: formData.ward,

                // Java Long -> Cần ép kiểu Number
                districtId: Number(formData.districtId),

                structure: formData.structure,

                // Java Integer -> Cần ép kiểu Number
                numberOfBasement: Number(formData.numberOfBasement),
                floorArea: Number(formData.floorArea),
                rentPrice: Number(formData.rentPrice),

                direction: formData.direction,
                level: formData.level,
                rentPriceDescription: formData.rentPriceDescription,
                serviceFee: formData.serviceFee,
                carFee: formData.carFee,
                motorbikeFee: formData.motorbikeFee,
                overtimeFee: formData.overtimeFee,
                waterFee: formData.waterFee,
                electricityFee: formData.electricityFee,
                deposit: formData.deposit,
                payment: formData.payment,
                rentTime: formData.rentTime,
                decorationTime: formData.decorationTime,

                // Java BigDecimal -> Cần ép kiểu Number (hoặc String số)
                brokerageFee: Number(formData.brokerageFee),

                note: formData.note,
                linkOfBuilding: formData.linkOfBuilding,
                map: formData.map,
                managerName: formData.managerName,
                managerPhoneNumber: formData.managerPhoneNumber,

                // Trường đặc biệt
                rentArea: formData.rentArea, // Java String (Service tự cắt chuỗi)
                typeCode: formData.typeCode, // Java List<String>

                avatar: finalAvatarUrl,      // Java String
                imageList: finalImageList    // Java List<String>
            };

            console.log("Payload gửi đi:", finalPayload); // F12 để kiểm tra

            await axiosClient.post('/api/buildings', finalPayload);

            setIsLoading(false);
            setShowSuccess(true);

        } catch (error) {
            console.error("Lỗi:", error);
            // Hiển thị lỗi chi tiết từ Backend trả về
            const errorMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || "Lỗi không xác định";
            alert(`Lỗi Server (400/500): ${errorMsg}`);
            setIsLoading(false);
        }
    };

    const handleSuccessRedirect = () => navigate('/');
    const isAdmin = user?.roles?.includes('ADMIN');

    return (
        <div className="create-page-wrapper">
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="success-icon-box"><FaCheckCircle /></div>
                        <h3>Đăng Tin Thành Công!</h3>
                        <p className="success-subtitle">Tòa nhà <strong>{formData.name}</strong> đã được thêm.</p>
                        <div className={`status-alert ${isAdmin ? 'alert-active' : 'alert-pending'}`}>
                            {isAdmin ? "✅ Hiển thị công khai ngay." : "⚠️ Đang chờ xét duyệt."}
                        </div>
                        <button className="btn-success-ok" onClick={handleSuccessRedirect}>Về Trang Chủ <FaArrowRight /></button>
                    </div>
                </div>
            )}

            <div className="create-container">
                <div className="form-header">
                    <h2>📝 Đăng Tin Tòa Nhà Mới</h2>
                    <p>Nhập thông tin chi tiết & hình ảnh</p>
                </div>

                <form className="create-form" onSubmit={handleSubmit}>
                    {/* THÔNG TIN CHUNG */}
                    <div className="form-section">
                        <h3 className="section-title"><FaBuilding /> Thông tin chung</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tên tòa nhà *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
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

                    {/* GIÁ THUÊ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaDollarSign /> Giá thuê & Diện tích</h3>
                        <div className="form-grid">
                            <div className="form-group full-width"><label>Diện tích thuê (VD: 100, 200)</label><input type="text" name="rentArea" value={formData.rentArea} onChange={handleChange} /></div>
                            <div className="form-group"><label>Giá thuê *</label><input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Mô tả giá</label><input type="text" name="rentPriceDescription" value={formData.rentPriceDescription} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí dịch vụ</label><input type="text" name="serviceFee" value={formData.serviceFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí môi giới</label><input type="number" name="brokerageFee" value={formData.brokerageFee} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* PHÍ & ĐIỀU KIỆN */}
                    <div className="form-section">
                        <h3 className="section-title"><FaListUl /> Phí & Điều kiện</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Phí ô tô</label><input type="text" name="carFee" value={formData.carFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí xe máy</label><input type="text" name="motorbikeFee" value={formData.motorbikeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền điện</label><input type="text" name="electricityFee" value={formData.electricityFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền nước</label><input type="text" name="waterFee" value={formData.waterFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Đặt cọc</label><input type="text" name="deposit" value={formData.deposit} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thanh toán</label><input type="text" name="payment" value={formData.payment} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thời hạn thuê</label><input type="text" name="rentTime" value={formData.rentTime} onChange={handleChange} /></div>
                            <div className="form-group"><label>TG Trang trí</label><input type="text" name="decorationTime" value={formData.decorationTime} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* HÌNH ẢNH & LOẠI */}
                    <div className="form-section">
                        <h3 className="section-title"><FaImage /> Hình ảnh & Loại</h3>

                        <div className="form-group full-width">
                            <label>Loại tòa nhà *</label>
                            <div className="checkbox-group">
                                {BUILDING_TYPES.map(type => (
                                    <label key={type.code} className="checkbox-item">
                                        <input type="checkbox" checked={formData.typeCode.includes(type.code)} onChange={() => handleTypeChange(type.code)} />
                                        <span>{type.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Ảnh đại diện (Avatar) *</label>
                            <div className="upload-box">
                                <label className="custom-file-upload">
                                    <FaCloudUploadAlt size={30} />
                                    <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
                                    <span>{rawAvatarFile ? "Đã chọn ảnh đại diện" : "Nhấn để chọn ảnh"}</span>
                                </label>
                            </div>
                            {previewAvatarUrl && (
                                <div className="avatar-preview-wrapper" style={{ marginTop: '15px', position: 'relative', width: 'fit-content' }}>
                                    <img src={previewAvatarUrl} alt="Preview" style={{ width: '150px', borderRadius: '10px' }} />
                                    <button type="button" className="btn-remove-img" onClick={handleRemoveAvatar} style={{ position: 'absolute', top: '-10px', right: '-10px' }}><FaTimes /></button>
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Album ảnh chi tiết ({previewAlbumUrls.length})</label>
                            <div className="upload-box">
                                <label className="custom-file-upload">
                                    <FaCloudUploadAlt size={30} />
                                    <input type="file" multiple accept="image/*" onChange={handleAlbumSelect} style={{ display: 'none' }} />
                                    <span>Nhấn để chọn album ảnh</span>
                                </label>
                            </div>
                            {previewAlbumUrls.length > 0 && (
                                <div className="album-grid">
                                    {previewAlbumUrls.map((url, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img src={url} alt={`Album ${index}`} />
                                            <button type="button" className="btn-remove-img" onClick={() => handleRemoveAlbumImage(index)}><FaTimes /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LIÊN HỆ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaUserTie /> Liên hệ</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Tên quản lý</label><input type="text" name="managerName" value={formData.managerName} onChange={handleChange} /></div>
                            <div className="form-group"><label>SĐT quản lý</label><input type="text" name="managerPhoneNumber" value={formData.managerPhoneNumber} onChange={handleChange} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea name="note" value={formData.note} onChange={handleChange} rows="3"></textarea></div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Hủy</button>
                        <button type="submit" className="btn-submit-form" disabled={isLoading}>
                            {isLoading ? <><FaSpinner className="spinner" /> {loadingMessage}</> : <><FaCheck /> Đăng Tin</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBuilding;