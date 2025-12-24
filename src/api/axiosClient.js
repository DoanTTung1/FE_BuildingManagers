import axios from 'axios';

const axiosClient = axios.create({
    // 👇 SỬA DÒNG NÀY:
    // 1. Đổi http -> https (Railway bắt buộc bảo mật)
    // 2. Thay localhost:8080 -> thanhtungf.up.railway.app
    baseURL: 'https://thanhtungf.up.railway.app/api/admin/', 
    
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;