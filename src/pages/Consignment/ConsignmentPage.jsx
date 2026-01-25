import React, { useState } from 'react';
import { useFormik } from 'formik';
import axiosClient from '../../api/axiosClient';
import { consignmentSchema } from './formSchema';
import {
    FaCheckCircle, FaArrowRight, FaHome, FaUserTie,
    FaMapMarkerAlt, FaRulerCombined, FaMoneyBillWave, FaSpinner, FaArrowLeft
} from 'react-icons/fa';
import './Consignment.css';

const ConsignmentPage = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            customerName: '', customerPhone: '', customerEmail: '',
            buildingName: '', address: '', districtCode: '', ward: '',
            direction: 'NORTH', transactionType: 'RENT',
            numberOfFloors: '', floorArea: '', totalArea: 0,
            expectedPrice: '', currency: 'VND',
            description: '', imageUrls: ''
        },
        validationSchema: consignmentSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                // --- [BƯỚC SỬA QUAN TRỌNG ĐỂ KHỚP BE] ---
                const payload = {
                    ...values,
                    // 1. Ép về Integer cho các trường số nguyên
                    numberOfFloors: values.numberOfFloors ? parseInt(values.numberOfFloors, 10) : null,
                    floorArea: values.floorArea ? parseInt(values.floorArea, 10) : null,
                    
                    // 2. Ép về kiểu số thực (BigDecimal bên Java) cho expectedPrice
                    expectedPrice: values.expectedPrice ? parseFloat(values.expectedPrice) : null,
                    
                    // 3. Xử lý logic diện tích tổng (Đảm bảo là kiểu Integer)
                    totalArea: values.totalArea 
                        ? parseInt(values.totalArea, 10) 
                        : (parseInt(values.numberOfFloors || 0, 10) * parseInt(values.floorArea || 0, 10)),

                    // 4. Đảm bảo các chuỗi rỗng chuyển thành null để tránh lỗi Validation @Email hoặc @NotBlank
                    customerEmail: values.customerEmail || null,
                    ward: values.ward || null,
                    description: values.description || null,
                    imageUrls: values.imageUrls || null
                };

                await axiosClient.post('/api/consignments', payload);
                setIsSuccess(true);
            } catch (error) {
                // Hiển thị thông báo lỗi chi tiết từ Server để bạn dễ kiểm soát
                alert("Lỗi: " + (error.response?.data?.message || "Vui lòng kiểm tra lại định dạng số và các trường bắt buộc"));
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleNext = async () => {
        let fieldsToValidate = [];
        if (step === 1) fieldsToValidate = ['customerName', 'customerPhone'];
        if (step === 2) fieldsToValidate = ['buildingName', 'address', 'districtCode'];

        const errors = await formik.validateForm();
        const hasError = fieldsToValidate.some(field => errors[field]);

        if (!hasError) {
            setStep(step + 1);
        } else {
            fieldsToValidate.forEach(field => formik.setFieldTouched(field, true));
        }
    };

    // --- MÀN HÌNH CẢM ƠN ---
    if (isSuccess) {
        return (
            <div className="consign-success-container">
                <div className="success-card fade-in-up">
                    <div className="icon-circle">
                        <FaCheckCircle />
                    </div>
                    <h2>Đã tiếp nhận yêu cầu!</h2>
                    <p>
                        Cảm ơn anh/chị <b>{formik.values.customerName}</b> đã tin tưởng. <br />
                        Chuyên viên tư vấn sẽ liên hệ qua số <b>{formik.values.customerPhone}</b> trong vòng 30 phút để xác thực thông tin.
                    </p>
                    <button className="btn-primary" onClick={() => window.location.href = '/'}>
                        Trở về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="consign-wrapper">
            {/* BACKGROUND DECORATION */}
            <div className="bg-shape-1"></div>
            <div className="bg-shape-2"></div>

            <div className="consign-container">
                {/* --- CỘT TRÁI: STORYTELLING (Kể chuyện) --- */}
                <div className="consign-sidebar">
                    <div className="sidebar-content">
                        <span className="badge-premium">Ký gửi nhanh – hiệu quả – an tâm</span>
                        <h1>Tối ưu hóa <br /> <span className="text-highlight">Giá trị tài sản</span></h1>
                        <p className="sidebar-desc">
                            Đừng để bất động sản của bạn "ngủ quên". Hãy để chúng tôi kết nối bạn với hàng ngàn doanh nghiệp đang tìm kiếm văn phòng ngay hôm nay.
                        </p>

                        <div className="trust-indicators">
                            <div className="trust-item">
                                <div className="trust-icon"><FaUserTie /></div>
                                <div>
                                    <h4>Chuyên nghiệp</h4>
                                    <p>Đội ngũ Sale am hiểu thị trường.</p>
                                </div>
                            </div>
                            <div className="trust-item">
                                <div className="trust-icon"><FaMoneyBillWave /></div>
                                <div>
                                    <h4>Định giá chuẩn</h4>
                                    <p>Tối đa hóa lợi nhuận cho thuê/bán.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sidebar-footer">
                        <p>© 2026 Thanh Tùng Elite Homes.</p>
                    </div>
                </div>

                {/* --- CỘT PHẢI: FORM TƯƠNG TÁC --- */}
                <div className="consign-main">
                    <div className="form-header">
                        <p className="step-indicator">Bước {step} trên 3</p>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="modern-form">

                        {/* BƯỚC 1: LÀM QUEN */}
                        {step === 1 && (
                            <div className="step-content fade-in">
                                <h2>Chào bạn, hãy bắt đầu nhé!</h2>
                                <p className="step-desc">Để chuyên viên tiện xưng hô và liên hệ tư vấn.</p>

                                <div className="input-group">
                                    <label>Anh/Chị tên là gì? <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        {...formik.getFieldProps('customerName')}
                                        placeholder="Ví dụ: Nguyễn Văn An"
                                        className={formik.touched.customerName && formik.errors.customerName ? "input-error" : ""}
                                    />
                                    {formik.touched.customerName && formik.errors.customerName && <span className="error-text">{formik.errors.customerName}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Số điện thoại liên hệ <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="customerPhone"
                                        {...formik.getFieldProps('customerPhone')}
                                        placeholder="0912 xxx xxx"
                                        className={formik.touched.customerPhone && formik.errors.customerPhone ? "input-error" : ""}
                                    />
                                    {formik.touched.customerPhone && formik.errors.customerPhone && <span className="error-text">{formik.errors.customerPhone}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Email (Để nhận báo cáo định giá)</label>
                                    <input type="email" name="customerEmail" {...formik.getFieldProps('customerEmail')} placeholder="name@example.com" />
                                </div>

                                <div className="form-actions right">
                                    <button type="button" className="btn-primary" onClick={handleNext}>
                                        Tiếp tục <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BƯỚC 2: VỊ TRÍ */}
                        {step === 2 && (
                            <div className="step-content fade-in">
                                <h2>Tài sản của bạn ở đâu?</h2>
                                <p className="step-desc">Vị trí chính xác giúp chúng tôi tiếp cận đúng khách hàng mục tiêu.</p>

                                <div className="input-group">
                                    <label>Tên tòa nhà (Hoặc tên gợi nhớ) <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="buildingName"
                                        {...formik.getFieldProps('buildingName')}
                                        placeholder="VD: Tòa nhà văn phòng mặt tiền Nguyễn Huệ..."
                                        className={formik.touched.buildingName && formik.errors.buildingName ? "input-error" : ""}
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Khu vực <span className="req">*</span></label>
                                        <div className="select-wrapper">
                                            <select name="districtCode" {...formik.getFieldProps('districtCode')}>
                                                <option value="">Chọn Quận/Huyện</option>
                                                <option value="1">Quận 1 - Trung tâm</option>
                                                <option value="2">Thủ Thiêm (Q2 cũ)</option>
                                                <option value="3">Quận 3</option>
                                                <option value="BINH_THANH">Bình Thạnh</option>
                                                <option value="7">Quận 7</option>
                                            </select>
                                        </div>
                                        {formik.touched.districtCode && formik.errors.districtCode && <span className="error-text">Vui lòng chọn khu vực</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Bạn muốn ký gửi để?</label>
                                        <div className="radio-group">
                                            <label className={`radio-card ${formik.values.transactionType === 'RENT' ? 'active' : ''}`}>
                                                <input type="radio" name="transactionType" value="RENT" onChange={formik.handleChange} checked={formik.values.transactionType === 'RENT'} />
                                                Cho Thuê
                                            </label>
                                            <label className={`radio-card ${formik.values.transactionType === 'SELL' ? 'active' : ''}`}>
                                                <input type="radio" name="transactionType" value="SELL" onChange={formik.handleChange} checked={formik.values.transactionType === 'SELL'} />
                                                Bán
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Địa chỉ chính xác <span className="req">*</span></label>
                                    <div className="input-with-icon">
                                        <FaMapMarkerAlt className="field-icon" />
                                        <input type="text" name="address" {...formik.getFieldProps('address')} placeholder="Số nhà, Tên đường..." />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-text" onClick={() => setStep(step - 1)}>
                                        <FaArrowLeft /> Quay lại
                                    </button>
                                    <button type="button" className="btn-primary" onClick={handleNext}>
                                        Tiếp tục <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BƯỚC 3: CHI TIẾT */}
                        {step === 3 && (
                            <div className="step-content fade-in">
                                <h2>Chi tiết quan trọng</h2>
                                <p className="step-desc">Cung cấp thêm thông số để chúng tôi định giá tốt nhất cho bạn.</p>

                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Kết cấu (Số tầng)</label>
                                        <div className="input-with-icon">
                                            <FaHome className="field-icon" />
                                            <input type="number" name="numberOfFloors" {...formik.getFieldProps('numberOfFloors')} placeholder="VD: 5" />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Diện tích sàn (m²)</label>
                                        <div className="input-with-icon">
                                            <FaRulerCombined className="field-icon" />
                                            <input type="number" name="floorArea" {...formik.getFieldProps('floorArea')} placeholder="VD: 100" />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group highlight-group">
                                    <label>Mức giá bạn kỳ vọng (VNĐ) <span className="req">*</span></label>
                                    <div className="input-with-icon large">
                                        <span className="currency-symbol">₫</span>
                                        <input
                                            type="number"
                                            name="expectedPrice"
                                            {...formik.getFieldProps('expectedPrice')}
                                            placeholder="VD: 50.000.000"
                                            className="price-input"
                                        />
                                    </div>
                                    {formik.touched.expectedPrice && formik.errors.expectedPrice && <span className="error-text">Chúng tôi cần biết mức giá mong muốn của bạn</span>}
                                </div>

                                <div className="input-group">
                                    <label>Ghi chú thêm</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        {...formik.getFieldProps('description')}
                                        placeholder="Ví dụ: Nhà mới xây, ưu tiên hợp đồng dài hạn, có thang máy..."
                                    ></textarea>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-text" onClick={() => setStep(step - 1)}>
                                        <FaArrowLeft /> Quay lại
                                    </button>
                                    <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? <><FaSpinner className="spinner-rotate" /> Đang xử lý...</> : "Hoàn tất ký gửi"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConsignmentPage;