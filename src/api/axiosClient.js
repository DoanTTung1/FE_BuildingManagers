import axios from 'axios';

const axiosClient = axios.create({

    baseURL: 'https://thanhtung-building.up.railway.app/api/admin',

    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;  