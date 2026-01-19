import axiosClient from './axiosClient'; // Import cái file bạn vừa cấu hình xong

const statisticApi = {
    getDashboardStats: () => {
        const url = '/api/statistics/dashboard'; // Khớp với Controller Backend
        return axiosClient.get(url);
    }
};

export default statisticApi;