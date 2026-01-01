import axios from 'axios';
import queryString from 'query-string';

const axiosClient = axios.create({
    baseURL: 'https://thanhtung-building.up.railway.app',
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
});

// --- THÊM ĐOẠN NÀY (REQUEST INTERCEPTOR) ---
// Tác dụng: Trước khi gửi bất kỳ request nào đi, nó sẽ tự động chèn Token vào
axiosClient.interceptors.request.use(async (config) => {
    // 1. Lấy token từ bộ nhớ trình duyệt
    const token = localStorage.getItem('token');

    // 2. Nếu có token, gắn nó vào Header "Authorization"
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});
// -------------------------------------------

axiosClient.interceptors.response.use((res) => {
    if (res && res.data) {
        return res.data;
    }
    return res;
}, (error) => {
    // Xử lý lỗi (nếu cần log ra console)
    // console.error("Error API:", error);
    throw error;
});

export default axiosClient;