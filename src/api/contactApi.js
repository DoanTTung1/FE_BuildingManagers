import axiosClient from './axiosClient';

const contactApi = {
    // --- KHÁCH HÀNG (USER) ---
    sendContact: (data) => {
        return axiosClient.post('/api/contacts', data);
    },

    // --- QUẢN TRỊ VIÊN (ADMIN) - Bổ sung phần này ---
    
    // 1. Lấy tất cả tin nhắn (Hàm bạn đang thiếu)
    getAll: () => {
        return axiosClient.get('/api/contacts');
    },

    // 2. Xóa tin nhắn
    delete: (id) => {
        return axiosClient.delete(`/api/contacts/${id}`);
    },

    // 3. Đánh dấu đã xử lý
    markAsProcessed: (id) => {
        return axiosClient.put(`/api/contacts/${id}/status`);
    }
};

export default contactApi;