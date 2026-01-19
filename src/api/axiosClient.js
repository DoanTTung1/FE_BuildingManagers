import axios from 'axios';
import queryString from 'query-string';

const axiosClient = axios.create({
    baseURL: 'https://be-buildingmanagers.onrender.com', // URL Backend của bạn
    // headers: {
    //     'Content-Type': 'application/json', // <--- QUAN TRỌNG: PHẢI XÓA HOẶC COMMENT DÒNG NÀY
    // },
    paramsSerializer: params => queryString.stringify(params),
});

// REQUEST INTERCEPTOR: Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Xử lý dữ liệu trả về gọn gàng
axiosClient.interceptors.response.use((res) => {
    if (res && res.data) {
        return res.data;
    }
    return res;
}, (error) => {
    // Ném lỗi ra để component (như Modal) bắt được và hiện thông báo
    throw error;
});

export default axiosClient;