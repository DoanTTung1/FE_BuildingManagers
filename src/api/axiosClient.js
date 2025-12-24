import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api/admin/', // Đường dẫn gốc tới API của bạn
    headers: {
        'Content-Type': 'application/json',
    },
    // Nếu bạn chưa tắt Security bên Java, hãy dùng Basic Auth tạm thời:
   
});

export default axiosClient;