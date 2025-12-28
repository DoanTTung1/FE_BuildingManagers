import axiosClient from "./axiosClient";

const authApi = {
    login: (data) => {
        // data: { userName, password }
        return axiosClient.post('/api/auth/login', data);
    },
    
    register: (data) => {
        // data: { userName, password, fullName, email, phone }
        return axiosClient.post('/api/auth/register', data);
    }
};

export default authApi;