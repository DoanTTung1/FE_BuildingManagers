import * as Yup from 'yup';

const phoneRegExp = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;

export const consignmentSchema = Yup.object().shape({
    // Bước 1: Thông tin khách
    customerName: Yup.string().required('Vui lòng nhập họ tên'),
    customerPhone: Yup.string().matches(phoneRegExp, 'Số điện thoại không hợp lệ').required('Bắt buộc nhập SĐT'),
    customerEmail: Yup.string().email('Email không đúng định dạng'),

    // Bước 2: Thông tin BĐS
    buildingName: Yup.string().required('Vui lòng nhập tên tòa nhà'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    districtCode: Yup.string().required('Vui lòng chọn Quận'),
    transactionType: Yup.string().required('Chọn loại giao dịch'), // RENT hoặc SELL

    // Bước 3: Chi tiết & Giá
    floorArea: Yup.number().min(10, 'Diện tích quá nhỏ').required('Nhập diện tích sàn'),
    numberOfFloors: Yup.number().min(1, 'Số tầng tối thiểu là 1').required('Nhập số tầng'),
    expectedPrice: Yup.number().min(1000000, 'Giá trị quá nhỏ').required('Nhập giá mong muốn'),
    description: Yup.string().max(1000, 'Mô tả tối đa 1000 ký tự')
});