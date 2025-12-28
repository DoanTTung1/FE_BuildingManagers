import axios from 'axios';
import queryString from 'query-string';

const axiosClient = axios.create({
    baseURL: 'https://thanhtung-building.up.railway.app', // URL Railway của bạn
    headers: {
        'Content-Type': 'application/json',
    },
    // Config này giúp chuyển mảng typeCode thành: typeCode=A&typeCode=B
    paramsSerializer: params => queryString.stringify(params),
});

axiosClient.interceptors.response.use((res) => res.data || res, (err) => { throw err; });

export default axiosClient;