import axios from 'axios';

const axiosClient = axios.create({
   
    baseURL: 'https://thanhtung-building.up.railway.app', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor giữ nguyên...
axiosClient.interceptors.response.use((res) => res.data || res, (err) => { throw err; });

export default axiosClient;