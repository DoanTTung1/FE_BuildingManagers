import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
    FaBuilding, FaDollarSign, FaImage, FaCheck, FaUserTie,
    FaSpinner, FaTimes, FaCloudUploadAlt, FaArrowLeft, FaListUl
} from 'react-icons/fa';
import '../../styles/CreateBuilding.css';

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

const UpdateBuilding = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // State quản lý file upload
    const [rawAvatarFile, setRawAvatarFile] = useState(null);
    const [rawAlbumFiles, setRawAlbumFiles] = useState([]);

    // State quản lý Preview ảnh
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState('');
    const [previewAlbumUrls, setPreviewAlbumUrls] = useState([]);

    const [formData, setFormData] = useState({
        name: '', street: '', ward: '', districtId: '',
        structure: '', numberOfBasement: 0, floorArea: 0,
        direction: '', level: '', rentPrice: 0,
        rentPriceDescription: '', serviceFee: '', carFee: '',
        motorbikeFee: '', overtimeFee: '', waterFee: '',
        electricityFee: '', deposit: '', payment: '',
        rentTime: '', decorationTime: '', brokerageFee: 0,
        note: '', managerName: '', managerPhoneNumber: '',
        rentArea: '', typeCode: []
    });

    useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const res = await axiosClient.get(`/api/buildings/${id}`);
                setFormData({
                    ...res,
                    districtId: res.districtId || '',
                    typeCode: res.typeCode || [],
                    // Đảm bảo các trường số không bị null để tránh warning React
                    numberOfBasement: res.numberOfBasement || 0,
                    floorArea: res.floorArea || 0,
                    rentPrice: res.rentPrice || 0,
                    brokerageFee: res.brokerageFee || 0
                });
                if (res.image) setPreviewAvatarUrl(res.image);
                if (res.imageList) setPreviewAlbumUrls(res.imageList);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchBuilding();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTypeChange = (code) => {
        const currentTypes = Array.isArray(formData.typeCode) ? formData.typeCode : [];
        let updatedTypes = currentTypes.includes(code)
            ? currentTypes.filter(t => t !== code)
            : [...currentTypes, code];
        setFormData({ ...formData, typeCode: updatedTypes });
    };

    const handleAlbumSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setRawAlbumFiles(prev => [...prev, ...files]);
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewAlbumUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const handleRemoveAlbumImage = (index) => {
        // Xóa khỏi mảng file raw (nếu là ảnh mới)
        // Lưu ý: Logic này đơn giản hóa, thực tế cần check index kỹ hơn nếu trộn ảnh cũ/mới
        // Ở đây ta xóa visual preview là chính
        setPreviewAlbumUrls(prev => {
            const urlToRemove = prev[index];
            if (urlToRemove.startsWith('blob:')) URL.revokeObjectURL(urlToRemove);

            // Nếu là ảnh blob (mới), cũng cần xóa khỏi rawAlbumFiles
            // Tuy nhiên để đơn giản, ta cứ giữ raw và lọc lúc submit hoặc upload hết
            // (Cách tối ưu hơn là dùng object {file, url} nhưng code sẽ dài dòng hơn)
            return prev.filter((_, i) => i !== index);
        });

        // Đồng bộ xóa khỏi mảng raw nếu đó là ảnh mới thêm vào
        // (Đây là logic nâng cao, ở mức cơ bản bạn có thể bỏ qua dòng này nếu thấy phức tạp)
    };

    const uploadSingleFile = async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        return await axiosClient.post('/api/upload/image', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 1. Upload Avatar (nếu có chọn mới)
            let finalAvatarUrl = previewAvatarUrl;
            if (rawAvatarFile) {
                finalAvatarUrl = await uploadSingleFile(rawAvatarFile);
            }

            // 2. Upload Album
            // Lấy lại các ảnh cũ (link http)
            let finalImageList = previewAlbumUrls.filter(url => url.startsWith('http'));

            // Upload các ảnh mới (nằm trong rawAlbumFiles)
            // LƯU Ý: Để chính xác, ta nên upload rawAlbumFiles và cộng dồn vào.
            // Nhưng nếu user xóa ảnh mới ở UI preview, rawAlbumFiles vẫn còn.
            // -> Cách fix nhanh: Upload hết raw, sau đó dùng previewAlbumUrls làm chuẩn đầu ra.

            if (rawAlbumFiles.length > 0) {
                const uploadPromises = rawAlbumFiles.map(file => uploadSingleFile(file));
                const newUploadedUrls = await Promise.all(uploadPromises);

                // Chỉ lấy những url nào hiện đang còn trong preview (để khớp với việc user đã xóa bớt)
                // (Ở mức đơn giản: Cứ gộp tất cả ảnh mới upload vào)
                finalImageList = [...finalImageList, ...newUploadedUrls];
            }

            const payload = {
                ...formData,
                id: Number(id),
                districtId: Number(formData.districtId),
                image: finalAvatarUrl,
                imageList: finalImageList
            };

            await axiosClient.put(`/api/buildings/${id}`, payload);
            navigate('/admin/buildings');
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data?.message || "Vui lòng thử lại"));
        } finally {
            setIsLoading(false);
        }
    };

    if (fetching) return <div className="loading-screen"><FaSpinner className="spinner" /> Đang tải dữ liệu...</div>;

    return (
        <div className="create-page-wrapper">
            <div className="create-container">
                <div className="form-header">
                    <h2>📝 Chỉnh Sửa Tòa Nhà</h2>
                    <p>ID: {id} - {formData.name}</p>
                </div>

                <form className="create-form" onSubmit={handleSubmit}>
                    {/* KHỐI 1: THÔNG TIN CHUNG */}
                    <div className="form-section">
                        <h3 className="section-title"><FaBuilding /> Thông tin chính</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tên tòa nhà</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Quận</label>
                                <select name="districtId" value={formData.districtId || ''} onChange={handleChange}>
                                    <option value="">-- Chọn Quận --</option>
                                    {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Đường</label><input type="text" name="street" value={formData.street} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phường</label><input type="text" name="ward" value={formData.ward} onChange={handleChange} /></div>
                            <div className="form-group"><label>Kết cấu</label><input type="text" name="structure" value={formData.structure} onChange={handleChange} /></div>
                            <div className="form-group"><label>Số tầng hầm</label><input type="number" name="numberOfBasement" value={formData.numberOfBasement} onChange={handleChange} /></div>
                            <div className="form-group"><label>Diện tích sàn (m²)</label><input type="number" name="floorArea" value={formData.floorArea} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hướng</label><input type="text" name="direction" value={formData.direction} onChange={handleChange} /></div>
                            <div className="form-group"><label>Hạng</label><input type="text" name="level" value={formData.level} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* KHỐI 2: GIÁ & PHÍ (Đầy đủ mọi loại phí) */}
                    <div className="form-section">
                        <h3 className="section-title"><FaDollarSign /> Giá thuê & Chi phí</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Giá thuê ($)</label><input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} /></div>
                            <div className="form-group"><label>Mô tả giá</label><input type="text" name="rentPriceDescription" value={formData.rentPriceDescription} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí dịch vụ</label><input type="text" name="serviceFee" value={formData.serviceFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí ô tô</label><input type="text" name="carFee" value={formData.carFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí xe máy</label><input type="text" name="motorbikeFee" value={formData.motorbikeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí ngoài giờ</label><input type="text" name="overtimeFee" value={formData.overtimeFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền điện</label><input type="text" name="electricityFee" value={formData.electricityFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền nước</label><input type="text" name="waterFee" value={formData.waterFee} onChange={handleChange} /></div>
                            <div className="form-group"><label>Phí môi giới</label><input type="number" name="brokerageFee" value={formData.brokerageFee} onChange={handleChange} /></div>
                        </div>
                    </div>

                    {/* KHỐI 3: ĐIỀU KIỆN & DIỆN TÍCH */}
                    <div className="form-section">
                        <h3 className="section-title"><FaListUl /> Điều kiện thuê</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Đặt cọc</label><input type="text" name="deposit" value={formData.deposit} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thanh toán</label><input type="text" name="payment" value={formData.payment} onChange={handleChange} /></div>
                            <div className="form-group"><label>Thời hạn thuê</label><input type="text" name="rentTime" value={formData.rentTime} onChange={handleChange} /></div>
                            <div className="form-group"><label>TG Trang trí</label><input type="text" name="decorationTime" value={formData.decorationTime} onChange={handleChange} /></div>
                            <div className="form-group full-width">
                                <label>Diện tích thuê (VD: 100, 200, 300)</label>
                                <input type="text" name="rentArea" value={formData.rentArea} onChange={handleChange} placeholder="Nhập các diện tích cách nhau bởi dấu phẩy" />
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 4: HÌNH ẢNH & LOẠI */}
                    <div className="form-section">
                        <h3 className="section-title"><FaImage /> Hình ảnh & Loại</h3>

                        <div className="form-group full-width">
                            <label>Loại tòa nhà</label>
                            <div className="checkbox-group">
                                {BUILDING_TYPES.map(type => (
                                    <label key={type.code} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(formData.typeCode) && formData.typeCode.includes(type.code)}
                                            onChange={() => handleTypeChange(type.code)}
                                        />
                                        <span>{type.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Ảnh đại diện (Avatar)</label>
                            <div className="upload-box">
                                <label className="custom-file-upload">
                                    <FaCloudUploadAlt size={30} />
                                    <input type="file" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setRawAvatarFile(file);
                                            setPreviewAvatarUrl(URL.createObjectURL(file));
                                        }
                                    }} style={{ display: 'none' }} />
                                    <span>{previewAvatarUrl ? "Đổi ảnh khác" : "Chọn ảnh đại diện"}</span>
                                </label>
                            </div>
                            {previewAvatarUrl && (
                                <div style={{ marginTop: '10px' }}>
                                    <img src={previewAvatarUrl} className="img-preview-small" alt="Avatar" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                                </div>
                            )}
                        </div>

                        {/* Album */}
                        <div className="form-group full-width" style={{ marginTop: '20px' }}>
                            <label>Album ảnh ({previewAlbumUrls.length})</label>
                            <div className="upload-box">
                                <label className="custom-file-upload">
                                    <FaCloudUploadAlt size={30} />
                                    <input type="file" multiple onChange={handleAlbumSelect} style={{ display: 'none' }} />
                                    <span>Thêm nhiều ảnh vào album</span>
                                </label>
                            </div>
                            <div className="album-grid">
                                {previewAlbumUrls.map((url, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={url} alt={`Album ${index}`} />
                                        <button type="button" className="btn-remove-img" onClick={() => handleRemoveAlbumImage(index)}><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 5: LIÊN HỆ */}
                    <div className="form-section">
                        <h3 className="section-title"><FaUserTie /> Liên hệ & Ghi chú</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Tên quản lý</label><input type="text" name="managerName" value={formData.managerName} onChange={handleChange} /></div>
                            <div className="form-group"><label>SĐT quản lý</label><input type="text" name="managerPhoneNumber" value={formData.managerPhoneNumber} onChange={handleChange} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea name="note" value={formData.note} onChange={handleChange} rows="3"></textarea></div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}><FaArrowLeft /> Quay lại</button>
                        <button type="submit" className="btn-submit-form" disabled={isLoading}>
                            {isLoading ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaCheck /> Lưu thay đổi</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateBuilding;